package service

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"sync/atomic"
	"time"

	"log-aggregation/notif_sender/config"

	"log-aggregation/notif_sender/db"

	"github.com/Shopify/sarama"
)

// ----- batch handler

type ConsumerGroupHandler interface {
	sarama.ConsumerGroupHandler
	WaitReady()
	Reset()
}

type ConsumerSessionMessage struct {
	Session sarama.ConsumerGroupSession
	Message *sarama.ConsumerMessage
}

type MultiAsyncConsumerConfig struct {
	BufChan chan *ConsumerSessionMessage
}

type multiAsyncConsumerGroupHandler struct {
	cfg *MultiAsyncConsumerConfig

	ready chan bool
}

type MultiBatchConsumerConfig struct {
	BufferCapacity        int // msg capacity
	MaxBufSize            int // max message size
	TickerIntervalSeconds int

	BufChan chan batchMessages
}

type batchMessages []*ConsumerSessionMessage

type multiBatchConsumerGroupHandler struct {
	cfg *MultiBatchConsumerConfig

	ready chan bool

	// buffer
	ticker *time.Ticker
	msgBuf batchMessages

	// lock to protect buffer operation
	mu sync.RWMutex
}

type ConsumerGroup struct {
	cg sarama.ConsumerGroup
}

func NewConsumerGroup(broker string, topics []string, group string, handler ConsumerGroupHandler) (*ConsumerGroup, error) {
	ctx := context.Background()
	cfg := sarama.NewConfig()
	cfg.Version = sarama.V0_10_2_0
	if config.AppConfiguration.KafkaConfig.KafkaTopicConfig == "earliest" {
		cfg.Consumer.Offsets.Initial = sarama.OffsetOldest
	} // otherwise latest message
	client, err := sarama.NewConsumerGroup([]string{broker}, group, cfg)
	if err != nil {
		panic(err)
	}

	go func() {
		for {
			err := client.Consume(ctx, topics, handler)
			if err != nil {
				if err == sarama.ErrClosedConsumerGroup {
					break
				} else {
					panic(err)
				}
			}
			if ctx.Err() != nil {
				return
			}
			handler.Reset()
		}
	}()

	handler.WaitReady() // Await till the consumer has been set up

	return &ConsumerGroup{
		cg: client,
	}, nil
}

func NewMultiBatchConsumerGroupHandler(cfg *MultiBatchConsumerConfig) ConsumerGroupHandler {
	handler := multiBatchConsumerGroupHandler{
		ready: make(chan bool, 0),
	}

	if cfg.BufferCapacity == 0 {
		cfg.BufferCapacity = 10000
	}
	handler.msgBuf = make([]*ConsumerSessionMessage, 0, cfg.BufferCapacity)
	if cfg.MaxBufSize == 0 {
		cfg.MaxBufSize = 8000
	}

	if cfg.TickerIntervalSeconds == 0 {
		cfg.TickerIntervalSeconds = 60
	}
	handler.cfg = cfg

	handler.ticker = time.NewTicker(time.Duration(cfg.TickerIntervalSeconds) * time.Second)

	return &handler
}

// Setup is run at the beginning of a new session, before ConsumeClaim
func (h *multiBatchConsumerGroupHandler) Setup(sarama.ConsumerGroupSession) error {
	// Mark the consumer as ready
	close(h.ready)
	return nil
}

// Cleanup is run at the end of a session, once all ConsumeClaim goroutines have exited
func (h *multiBatchConsumerGroupHandler) Cleanup(sarama.ConsumerGroupSession) error {
	return nil
}

func (h *multiBatchConsumerGroupHandler) WaitReady() {
	<-h.ready
	return
}

func (h *multiBatchConsumerGroupHandler) Reset() {
	h.ready = make(chan bool, 0)
	return
}

func (h *multiBatchConsumerGroupHandler) flushBuffer() {
	if len(h.msgBuf) > 0 {
		h.cfg.BufChan <- h.msgBuf
		h.msgBuf = make([]*ConsumerSessionMessage, 0, h.cfg.BufferCapacity)
	}
}

func (h *multiBatchConsumerGroupHandler) insertMessage(msg *ConsumerSessionMessage) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.msgBuf = append(h.msgBuf, msg)
	if len(h.msgBuf) >= h.cfg.MaxBufSize {
		h.flushBuffer()
	}
}

func (h *multiBatchConsumerGroupHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {

	// NOTE:
	// Do not move the code below to a goroutine.
	// The `ConsumeClaim` itself is called within a goroutine, see:
	// https://github.com/Shopify/sarama/blob/master/consumer_group.go#L27-L29
	claimMsgChan := claim.Messages()

	for {
		select {
		case message, ok := <-claimMsgChan:
			if ok {
				h.insertMessage(&ConsumerSessionMessage{
					Message: message,
					Session: session,
				})
			} else {
				return nil
			}
		case <-h.ticker.C:
			h.mu.Lock()
			h.flushBuffer()
			h.mu.Unlock()
		}
	}

	return nil
}

func decodeMessage(kafkaMessage string, event *db.Event) error {

	// parse the message into event
	// fmt.Printf("DEBUG : Recieved message " + kafkaMessage)
	// config.Trace.Println("DEBUG : Recieved message " + kafkaMessage)
	err := json.Unmarshal([]byte(kafkaMessage), event)
	return err
}

func StartMultiBatchConsumer(broker, topic string) (*ConsumerGroup, error) {
	var count int64
	var start = time.Now()
	var bufChan = make(chan batchMessages, 1000)
	for i := 0; i < config.AppConfiguration.Workers; i++ {
		go func() {
			for messages := range bufChan {
				var event db.Event
				for j := range messages {
					if err := decodeMessage(string(messages[j].Message.Value), &event); err == nil {
						fmt.Printf("processing recipient %s \n", event.EventID)
						fmt.Println(string(messages[j].Message.Value))
						ProcessChannel(event)
						messages[j].Session.MarkMessage(messages[j].Message, "")
					} else {
						fmt.Printf("Unmarsh Failed\n")
						// panic(err)
					}
					fmt.Printf("=======================================================\n")
				}
				cur := atomic.AddInt64(&count, int64(len(messages)))
				if cur%1000 == 0 {
					fmt.Printf("multi batch consumer consumed %d messages at speed %.2f/s\n", cur, float64(cur)/time.Since(start).Seconds())
				}
			}
		}()
	}
	handler := NewMultiBatchConsumerGroupHandler(&MultiBatchConsumerConfig{
		MaxBufSize: 1000,
		BufChan:    bufChan,
	})
	consumer, err := NewConsumerGroup(broker, []string{topic}, "multi-batch-consumer-"+fmt.Sprintf("%d", time.Now().Unix()), handler)
	if err != nil {
		return nil, err
	}
	return consumer, nil
}

// func main() {
// 	var done = make(chan struct{})
// 	defer close(done)
// 	_, err := StartMultiBatchConsumer("localhost:9092", "alerts")
// 	if err != nil {
// 		panic(err)
// 	}
// 	<-done
// 	c := make(chan os.Signal, 1)
// 	signal.Notify(c, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT)
// 	fmt.Println("received signal", <-c)

// }

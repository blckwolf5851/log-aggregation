/*
This file handles data storing and querying
*/
package main

// Listener
import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"sync"
	"syscall"

	"log-aggregation/config"
	"log-aggregation/config/logevent"

	"github.com/Shopify/sarama"
)

// ModuleName is the name used in config file
const ModuleName = "kafka"

// InputConfig holds the configuration json fields and internal objects
type InputConfig struct {
	config.InputConfig
	Version          string   `json:"version"`                     // Kafka cluster version, eg: 0.10.2.0
	Brokers          []string `json:"brokers"`                     // Kafka bootstrap brokers to connect to, as a comma separated list
	Topics           []string `json:"topics"`                      // Kafka topics to be consumed, as a comma seperated list
	Group            string   `json:"group"`                       // Kafka consumer group definition
	OffsetOldest     bool     `json:"offset_oldest"`               // Kafka consumer consume initial offset from oldest
	Assignor         string   `json:"assignor"`                    // Consumer group partition assignment strategy (range, roundrobin)
	SecurityProtocol string   `json:"security_protocol,omitempty"` // use SASL authentication
	User             string   `json:"sasl_username,omitempty"`     // SASL authentication username
	Password         string   `json:"sasl_password,omitempty"`     // SASL authentication password

	saConf *sarama.Config
}

type kafkaError struct {
	target  string
	message string
}

func (e *kafkaError) Error() string {
	return fmt.Sprintf("%s - %s", e.target, e.message)
}

// DefaultInputConfig returns an InputConfig struct with default values
func DefaultInputConfig() InputConfig {
	return InputConfig{
		InputConfig: config.InputConfig{
			CommonConfig: config.CommonConfig{
				Type: ModuleName,
			},
		},
		SecurityProtocol: "",
		User:             "",
		Password:         "",
	}
}

// InitHandler initialize the input plugin
func InitHandler(ctx context.Context, raw *config.ConfigRaw) (config.TypeInputConfig, error) {

	conf := DefaultInputConfig()
	err := config.ReflectConfig(raw, &conf)
	if err != nil {
		return nil, err
	}

	version, err := sarama.ParseKafkaVersion(conf.Version)
	if err != nil {
		fmt.Printf("Error parsing Kafka version: %v", err)
		return nil, err
	}

	/**
	 * Construct a new Sarama configuration.
	 * The Kafka cluster version has to be defined before the consumer/producer is initialized.
	 */
	sarConfig := sarama.NewConfig()
	sarConfig.Version = version

	switch conf.Assignor {
	case "roundrobin":
		sarConfig.Consumer.Group.Rebalance.Strategy = sarama.BalanceStrategyRoundRobin
	case "range":
		sarConfig.Consumer.Group.Rebalance.Strategy = sarama.BalanceStrategyRange
	default:
		fmt.Printf("Unrecognized consumer group partition assignor: %s", conf.Assignor)
	}

	if conf.OffsetOldest {
		sarConfig.Consumer.Offsets.Initial = sarama.OffsetOldest
	}

	if len(conf.Topics) < 0 {
		fmt.Printf("Topics should not be empty")
		return nil, err
	}

	if conf.Group == "" {
		fmt.Printf("Group should not be empty")
		return nil, err
	}

	if len(conf.Brokers) == 0 {
		fmt.Printf("Brokers should not be empty")
		return nil, err
	}

	if conf.SecurityProtocol == "SASL" {
		sarConfig.Net.SASL.Enable = true
		sarConfig.Net.SASL.User = conf.User
		sarConfig.Net.SASL.Password = conf.Password
	}

	conf.saConf = sarConfig

	conf.Codec, err = config.GetCodecOrDefault(ctx, *raw)
	if err != nil {
		return nil, err
	}

	return &conf, nil
}

// Start wraps the actual function starting the plugin
func (t *InputConfig) Start(ctx context.Context, msgChan chan<- logevent.LogEvent) (err error) {
	/**
	 * Setup a new Sarama consumer group
	 */
	cum := consumerHandle{
		i:     t,
		ch:    msgChan,
		ready: make(chan bool),
		ctx:   ctx,
	}

	ct, cancel := context.WithCancel(ctx)
	defer cancel()
	client, err := sarama.NewConsumerGroup(t.Brokers, t.Group, t.saConf)
	if err != nil {
		fmt.Printf("Error creating consumer group client: %v", err)
		return err
	}

	wg := &sync.WaitGroup{}
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			// `Consume` should be called inside an infinite loop, when a
			// server-side rebalance happens, the consumer session will need to be
			// recreated to get the new claims
			if err := client.Consume(ct, t.Topics, &cum); err != nil {
				fmt.Printf("Error from consumer: %v", err)
			}
			// check if context was cancelled, signaling that the consumer should stop
			if ct.Err() != nil {
				return
			}

			cum.ready = make(chan bool)
		}
	}()

	<-cum.ready // Await till the consumer has been set up
	fmt.Printf("Sarama consumer up and running!...")

	sigterm := make(chan os.Signal, 1)
	signal.Notify(sigterm, syscall.SIGINT, syscall.SIGTERM)
	select {
	case <-ct.Done():
		fmt.Printf("terminating: context cancelled")
	case <-sigterm:
		fmt.Printf("terminating: via signal")
	}
	cancel()
	wg.Wait()
	if err = client.Close(); err != nil {
		fmt.Printf("Error closing client: %v", err)
		return err
	}
	return nil
}

// consumerHandle represents a Sarama consumer group consumer
type consumerHandle struct {
	i     *InputConfig
	ch    chan<- logevent.LogEvent
	ready chan bool
	ctx   context.Context
}

// Setup is run at the beginning of a new session, before ConsumeClaim
func (c *consumerHandle) Setup(sarama.ConsumerGroupSession) error {
	// Mark the consumer as ready
	close(c.ready)
	return nil
}

// Cleanup is run at the end of a session, once all ConsumeClaim goroutines have exited
func (c *consumerHandle) Cleanup(sarama.ConsumerGroupSession) error {
	return nil
}

// ConsumeClaim must start a consumer loop of ConsumerGroupClaim's Messages().
func (c *consumerHandle) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {

	// NOTE:
	// Do not move the code below to a goroutine.
	// The `ConsumeClaim` itself is called within a goroutine, see:
	// https://github.com/Shopify/sarama/blob/master/consumer_group.go#L27-L29
	for message := range claim.Messages() {
		var extra = map[string]interface{}{
			"topic":     message.Topic,
			"timestamp": message.Timestamp,
		}
		ok, err := c.i.Codec.Decode(c.ctx, string(message.Value), extra, []string{}, c.ch)
		if !ok {
			fmt.Printf("decode message to msg chan error : %v", err)
		}
		session.MarkMessage(message, "")
	}

	return nil
}

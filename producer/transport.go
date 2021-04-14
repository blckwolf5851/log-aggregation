/*
This file handles transporting logs from collection to processing stage via kafka
*/
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/Shopify/sarama"
	"github.com/gofiber/fiber/v2"
)

// Comment struct, TODO: possibly add field type, timestamp
type Log struct {
	Level   string `form:"text" json:"level"`
	Message string `form:"text" json:"message"`
}

func main() {

	app := fiber.New()
	api := app.Group("/api/v1") // /api

	api.Post("/logs", createLog)

	app.Listen(":3000")

}

/*
connect to Kafka as producer
*/
func ConnectProducer(brokersUrl []string) (sarama.SyncProducer, error) {
	config := sarama.NewConfig()
	config.Producer.Return.Successes = true
	config.Producer.RequiredAcks = sarama.WaitForAll
	config.Producer.Retry.Max = 5

	sarama.Logger = log.New(os.Stdout, "[sarama] ", log.LstdFlags)

	// NewSyncProducer creates a new SyncProducer using the given broker addresses and configuration
	conn, err := sarama.NewSyncProducer(brokersUrl, config)
	if err != nil {
		return nil, err
	}

	return conn, nil
}

/*
Push <message> to a topic <topic>
*/
func PushLogToQueue(topic string, message []byte) error {

	// connect to producer
	brokersUrl := []string{"127.0.0.1:9092"}
	producer, err := ConnectProducer(brokersUrl)
	if err != nil {
		return err
	}

	defer producer.Close()

	// prepare the message (using given topic and the message)
	msg := &sarama.ProducerMessage{
		Topic: topic,
		Value: sarama.StringEncoder(message),
	}

	// Push message to topic
	partition, offset, err := producer.SendMessage(msg)
	if err != nil {
		return err
	}

	fmt.Printf("Message is stored in topic(%s)/partition(%d)/offset(%d)\n", topic, partition, offset)

	return nil
}

// createComment handler
// receive msg via REST and create the message for kafka consumer to consume
func createLog(c *fiber.Ctx) error {

	// Instantiate new struct
	cmt := new(Log)

	//  Parse body into Logs struct
	if err := c.BodyParser(cmt); err != nil {
		log.Println(err)
		c.Status(400).JSON(&fiber.Map{
			"success": false,
			"message": err,
		})
		return err
	}
	// convert body into bytes and send it to kafka
	cmtInBytes, err := json.Marshal(cmt)
	PushLogToQueue("logs", cmtInBytes)

	// Return Log in JSON format
	err = c.JSON(&fiber.Map{
		"success": true,
		"message": "Log pushed successfully",
		"comment": cmt,
	})
	if err != nil {
		c.Status(500).JSON(&fiber.Map{
			"success": false,
			"message": "Error creating product",
		})
		return err
	}

	return err
}

package main

import (
	"flag"
	"fmt"
	"os"
	"os/signal"
	"strconv"
	"syscall"

	"log-aggregation/notif_sender/service"

	"log-aggregation/notif_sender/config"
)

var profile = ""
var configServer = "http://0.0.0.0:8888"

func main() {

	logLevel := flag.String("loglevel", "error", "Possible options warn,trace,error,info")
	name := flag.String("name", "go-kafka-alert", "Application name")
	profileTerminal := flag.String("profile", "", "Configuration profile URL")
	configServerTerminal := flag.String("config", configServer, "Config server base url")
	flag.Parse()
	if profileTerminal != nil {
		profile = *profileTerminal
	}
	if configServerTerminal != nil {
		configServer = *configServerTerminal
	}
	config.LogLevel = *logLevel
	config.ApplicationName = *name
	config.ConfigProfile = profile
	config.ConfigServer = configServer
	_, configErr := config.LoadConfiguration()
	if configErr != nil {
		config.Error.Println("Error loading config. Shutting down ")
		os.Exit(1)
	}
	// db.DialDB()
	config.Trace.Println("Starting up Service with Log level '" + *logLevel + "'")
	config.Trace.Println("Configuration file loaded successfully with '" +
		strconv.Itoa(len(config.AppConfiguration.Templates)) + "' templates and " +
		strconv.Itoa(config.AppConfiguration.Workers) + " workers processing events")

	var done = make(chan struct{})
	defer close(done)
	_, err := service.StartMultiBatchConsumer(config.AppConfiguration.KafkaConfig.BootstrapServers, config.AppConfiguration.KafkaConfig.KafkaTopic)
	if err != nil {
		panic(err)
	}
	<-done
	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT)
	fmt.Println("received signal", <-c)
	// service.NewKafkaConsumer()
	// if service.KafkaConsumer == nil {
	// 	config.Error.Println("Error starting Kafka Consumer ")
	// 	os.Exit(1)
	// }

	// run := true
	// for run {
	// 	events, _ := service.GetEventFromKafkaStream()

	// 	if len(events) > 0 {

	// 		if len(events) <= config.AppConfiguration.Workers {
	// 			config.Info.Println("Distributing " + strconv.Itoa(len(events)) + " worker of the month")
	// 			go service.EventProcessorForChannel(events)
	// 		} else {
	// 			batchSize := len(events) / config.AppConfiguration.Workers
	// 			config.Info.Println("Distributing '" + strconv.Itoa(len(events)) + "' events for '" +
	// 				strconv.Itoa(config.AppConfiguration.Workers) +
	// 				"' workers '" + strconv.Itoa(batchSize) + "' each.")

	// 			//..else share
	// 			currentPointer := 0
	// 			var eventBatch []db.Event
	// 			for i := 1; i <= config.AppConfiguration.Workers; i++ {
	// 				//slice events ..using batchSize
	// 				if i == config.AppConfiguration.Workers {
	// 					eventBatch = events[currentPointer:]
	// 				} else {
	// 					eventBatch = events[currentPointer:batchSize]
	// 				}
	// 				go service.EventProcessorForChannel(eventBatch)
	// 				currentPointer = currentPointer + batchSize + 1
	// 			}
	// 		}
	// 	}
	// }
}

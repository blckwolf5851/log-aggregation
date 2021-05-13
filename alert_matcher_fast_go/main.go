package main

import (
	"fmt"
	"log"
)

var verbose bool = true

func main() {
	sampleQuery := `{
		"id": '3sfgff4dASE',
		"command": "ADD",
		"conditions": {
			"levelname": "ERROR"
		},
		"threshold": 2,
		"window": 2000,
		"sendTo": ['154757929sherry@gmail.com'],
		"priority": "HIGH",
		"receiveEmail": false
	}`
	sampleEvent := `{
		"timestamp": "2021-05-14T14:01:54.9571247Z",
		"levelname": "ERROR",
		"message": "Welcome to logging" 
	}`
	queries, err := InitQueries()
	if err != nil {
		fmt.Printf("InitQueries Failed: ")
		log.Fatal(err)
	}
	err = queries.ProcessQuery(sampleQuery)
	if err != nil {
		fmt.Printf("ProcessQuery Failed: ")
		log.Fatal(err)
	}

	err = queries.processEvent(sampleEvent)
	err = queries.processEvent(sampleEvent)
	err = queries.processEvent(sampleEvent)
	if err != nil {
		fmt.Printf("ProcessQuery Failed: ")
		log.Fatal(err)
	}

}

package service

import (
	"strconv"

	"log-aggregation/sender/config"
	"log-aggregation/sender/db"
)

// EventProcessorForChannel : Event Processor For Channel
func EventProcessorForChannel(events []db.Event) {
	if len(events) > 0 {
		config.Info.Print("Processing " + strconv.Itoa(len(events)))
		for _, event := range events {
			ProcessChannel(event)
		}
	}
}

// process channels
func ProcessChannel(event db.Event) {
	if CheckChannel(event, "SMS") {
		config.Info.Print("Processing " + event.EventID + " for SMS")
		smsChannel := EventForSMS{event}
		ProcessEvent(smsChannel)
	}
	if CheckChannel(event, "EMAIL") {
		config.Info.Print("Processing " + event.EventID + " for EMAIL")
		emailChannel := EventForEmail{event}
		ProcessEvent(emailChannel)
	}
	if CheckChannel(event, "API") {
		config.Info.Print("Processing " + event.EventID + " for API")
		apiChannel := EventForAPI{event}
		ProcessEvent(apiChannel)
	}

}

// ProcessEvent : Process Event
func ProcessEvent(eventForMessage EventForMessage) {
	messages, err := eventForMessage.ParseTemplate()
	if err != nil {
		config.Info.Print("Error parsing template Error :" + err.Error() + "")
	} else {
		for _, msg := range messages {
			//index message
			// msg.IndexMessage() // TODO

			// eventForMessage.SendMessage(msg)
			eventForMessage.SendMessage(msg) // TODO
			// response := eventForMessage.SendMessage(msg)

			//index response
			// msg.UpdateResponse(msg.MessageID, response) // TODO

		}
	}
}

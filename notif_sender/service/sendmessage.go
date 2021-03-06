package service

import (
	"strings"

	"log-aggregation/notif_sender/db"
)

//EventForMessage : Interface to be Implemented For Delivery Channels
type EventForMessage interface {
	ParseTemplate() ([]db.Message, error)

	SendMessage(message db.Message) db.MessageResponse
}

//CheckChannel : Validates Delivery Channel Support By Event
func CheckChannel(event db.Event, channel string) bool {
	return event.Channel[strings.ToUpper(channel)]
}

package main

import "time"

type Notification struct {
	EventID      string            `json:"eventId,omitempty"`
	Subject      string            `json:"subject"`
	Channel      map[string]bool   `json:"channel"`
	Recipient    []string          `json:"recipient"`
	UnmappedData map[string]string `json:"unmappedData"`
	EventType    string            `json:"eventType"`
	Description  string            `json:"description"`
	DateCreated  time.Time         `json:"timestamp,omitempty"`
}

func EmitNotif(query *Query) error {
	// TODO: push notification to kafka
	return nil
}

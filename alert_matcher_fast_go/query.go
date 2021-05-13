package main

import (
	"encoding/json"
	"fmt"
	"log"
)

type QueryInput struct {
	QueryID      string     `json:"id"`
	Command      string     `json:"command"`
	Conditions   Conditions `json:"conditions"`
	Threshold    float32    `json:"threshold"`
	Window       int        `json:"window"`
	SendTo       string     `json:"sendTo"`
	Priority     string     `json:"priority"`
	ReceiveEmail bool       `json:"receiveEmail"`
}

type Query struct {
	QueryInput   *QueryInput
	NumBatch     int
	BatchSize    int
	MatchingLogs *MatchingLogs
	ConditionId  string
}

func InitQuery(rawQuery string) (*Query, error) {
	var err error
	query := &Query{}
	query.QueryInput = &QueryInput{}
	// load json into query
	if err = json.Unmarshal([]byte(rawQuery), query.QueryInput); err != nil {
		if verbose {
			fmt.Printf("Json Unmarshal Query Failed: ")
			log.Fatal(err)
		}
		return nil, err
	}
	// calculate number of batch needed
	query.NumBatch, err = query.QueryInput.GetNumBatch()
	if err != nil {
		if verbose {
			fmt.Printf("GetNumBatch Failed: ")
			log.Fatal(err)

		}
		return nil, err
	}
	query.BatchSize = query.QueryInput.Window / query.NumBatch
	// setup matching logs
	query.MatchingLogs, err = InitMatchingLogs(query.NumBatch, query.BatchSize)
	if err != nil {
		if verbose {
			fmt.Printf("InitMatchingLogs Failed: ")
			log.Fatal(err)

		}
		return nil, err
	}
	// setup condition id from its condition
	query.ConditionId, err = query.QueryInput.GetConditionId()
	if err != nil {
		if verbose {
			fmt.Printf("Get ConditionId Failed: ")
			log.Fatal(err)

		}
		return nil, err
	}
	return query, nil
}

func (query *Query) CheckThreshold() (bool, error) {
	exceed := float32(query.MatchingLogs.TotalCount) >= query.QueryInput.Threshold
	if exceed {
		err := EmitNotif(query)
		if err != nil {
			if verbose {
				fmt.Printf("Notification Emition Failed: ")
				log.Fatal(err)
			}
			return exceed, err
		}
		query.MatchingLogs.Reinit()
	}
	return exceed, nil
}

func (queryInput *QueryInput) GetNumBatch() (int, error) {
	var mean float32 = 30.0 // TODO: calc mean base on historical data
	var variance float32 = 50.0
	if mean >= 22 {
		// TODO: calculate variance base on historical data
	}
	numBatch, err := GetNumBatch(mean, queryInput.Threshold, 0.9, variance)
	return numBatch, err
}

func (queryInput *QueryInput) GetConditionId() (string, error) {
	conditionId, err := queryInput.Conditions.GetConditionId()
	return conditionId, err
}

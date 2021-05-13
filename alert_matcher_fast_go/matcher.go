package main

import (
	"fmt"
	"time"
)

type Matcher map[string]Conditions

type Event struct {
	Timestamp time.Time `json:"timestamp"`
	Levelname string    `json:"levelname"`
	Message   string    `json:"message"`
}

func InitMatcher() (Matcher, error) {
	var matcher Matcher
	matcher = make(Matcher)
	return matcher, nil
}

func (matcher Matcher) AddCondition(conditionId string, conditions Conditions) {
	matcher[conditionId] = conditions
}

func (matcher Matcher) GetMatchingConditionId(event Event) []string {
	var matchingConditionId []string
	for conditionId, conditions := range matcher {
		if conditions.Match(event) {
			matchingConditionId = append(matchingConditionId, conditionId)
		}
	}
	if verbose {
		fmt.Printf("sMatching ConditionId: %v\n", matchingConditionId)
	}

	return matchingConditionId
}

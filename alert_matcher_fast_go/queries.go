package main

import (
	"encoding/json"
	"fmt"
	"log"
)

type IdToQuery map[string]*Query

type Queries struct {
	ConditionToIdToQuery map[string]IdToQuery
	Matcher              Matcher
}

func InitQueries() (*Queries, error) {
	queries := &Queries{}
	queries.ConditionToIdToQuery = make(map[string]IdToQuery)
	matcher, err := InitMatcher()
	if err != nil {
		if verbose {
			fmt.Printf("Process Query Failed: At InitMatcher: ")
			log.Fatal(err)
		}
		return nil, err
	}
	queries.Matcher = matcher
	return queries, nil
}

func (queries *Queries) ProcessQuery(rawQuery string) error {
	var err error
	var query *Query
	query, err = InitQuery(rawQuery)
	if err != nil {
		if verbose {
			fmt.Printf("Process Query Failed: At InitQuery: ")
			log.Fatal(err)
		}
		return err
	}
	if query.QueryInput.Command == "ADD" {
		err = queries.add(query)
	} else if query.QueryInput.Command == "DEL" {
		err = queries.remove(query)
	}
	return err
}

func (queries *Queries) add(query *Query) error {
	conditionIdToQueryId, ok := queries.ConditionToIdToQuery[query.ConditionId]
	if !ok {
		// if do not exist, then initialize inner map
		if verbose {
			fmt.Printf("Query Adding: QueryID (%s) does not exist yet in ConditionID (%s), adding...\n", query.QueryInput.QueryID, query.ConditionId)
		}
		queries.Matcher.AddCondition(query.ConditionId, query.QueryInput.Conditions)
		conditionIdToQueryId = make(IdToQuery)
		queries.ConditionToIdToQuery[query.ConditionId] = conditionIdToQueryId
	}
	queries.ConditionToIdToQuery[query.ConditionId][query.QueryInput.QueryID] = query
	if verbose {
		fmt.Printf("Query Adding Succeeded: QueryID (%s) Added to sub-map with ConditionID (%s), adding...\n", query.QueryInput.QueryID, query.ConditionId)
	}
	return nil
}

func (queries *Queries) remove(query *Query) error {
	_, ok := queries.ConditionToIdToQuery[query.ConditionId]
	if ok {
		_, ok = queries.ConditionToIdToQuery[query.ConditionId][query.QueryInput.QueryID]
		if ok {
			if verbose {
				fmt.Printf("Query Delete Succeeded: QueryID (%s) deleted from ConditionID (%s)\n", query.QueryInput.QueryID, query.ConditionId)
			}
			delete(queries.ConditionToIdToQuery[query.ConditionId], query.QueryInput.QueryID)
		} else {
			if verbose {
				fmt.Printf("Query Deleted Failed: No QueryID(%s) has ConditionID (%s)\n", query.QueryInput.QueryID, query.ConditionId)
			}
		}
	} else {
		if verbose {
			fmt.Printf("Query Deleted Failed: ConditionID (%s) does not exist\n", query.ConditionId)
		}
	}
	return nil
}

func (queries *Queries) processEvent(rawEvent string) error {
	var err error
	event := &Event{}
	if err = json.Unmarshal([]byte(rawEvent), event); err != nil {
		if verbose {
			fmt.Printf("Json Unmarshal Query Failed: ")
			log.Fatal(err)
		}
		return err
	}

	for conditionId, idToQuery := range queries.ConditionToIdToQuery {
		for queryId, query := range idToQuery {
			if verbose {
				fmt.Printf("Updating matching log for QueryID (%s) ConditionID (%s)\n", queryId, conditionId)
			}
			query.MatchingLogs.CountEvent(event.Timestamp)
			_, err = query.CheckThreshold()
			if verbose {
				fmt.Printf("CheckThreshold Failed: ")
				log.Fatal(err)
			}
		}
	}

	return nil

}

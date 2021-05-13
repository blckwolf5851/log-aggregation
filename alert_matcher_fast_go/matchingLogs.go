package main

import (
	"fmt"
	"time"
)

type MatchingLogs struct {
	Counter    []int       `json:"counter"`
	StartTimes []time.Time `json:"startTimes"`
	BatchSize  int         `json:"batchSize"`
	NumBatch   int         `json:"numBatch"`
	TotalCount int         `json:"totalCount"`
}

func InitMatchingLogs(numBatch int, batchSize int) (*MatchingLogs, error) {
	matchingLogs := &MatchingLogs{}
	matchingLogs.Counter = make([]int, numBatch, numBatch)
	matchingLogs.StartTimes = make([]time.Time, numBatch, numBatch)
	now := time.Now()
	matchingLogs.StartTimes[0] = now
	matchingLogs.BatchSize = batchSize
	matchingLogs.NumBatch = numBatch
	matchingLogs.TotalCount = 0
	return matchingLogs, nil
}

func (matchingLogs *MatchingLogs) Reinit() {
	matchingLogs.Counter = make([]int, matchingLogs.NumBatch, matchingLogs.NumBatch)
	matchingLogs.StartTimes = make([]time.Time, matchingLogs.NumBatch, matchingLogs.NumBatch)
	now := time.Now()
	matchingLogs.StartTimes[0] = now
	matchingLogs.TotalCount = 0
}

func (matchingLogs *MatchingLogs) CountEvent(timestamp time.Time) {
	now := time.Now()
	matchingLogs.shiftBatches(now)
	batchIdx := int(timeMilliSecDifference(timestamp, now) / int64(matchingLogs.BatchSize))
	if batchIdx >= len(matchingLogs.Counter) {
		if verbose {
			fmt.Printf("shiftBatches: Event exceed window period\n")
		}
		return
	}
	matchingLogs.Counter[batchIdx] += 1
	matchingLogs.TotalCount += 1
	if verbose {
		fmt.Printf("shiftBatches: Batches at index %d increment count by 1\n", batchIdx)
	}

}

func (matchingLogs *MatchingLogs) shiftBatches(now time.Time) {
	numShifts := int(timeMilliSecDifference(matchingLogs.StartTimes[0], now) / int64(matchingLogs.BatchSize))
	if verbose {
		fmt.Printf("shiftBatches: Batches will be shifted %d times...\n", numShifts)
	}

	for i := 0; i < numShifts; i++ {
		prevTime := toTimestamp(matchingLogs.StartTimes[0])
		newTime := fromTimestamp(prevTime + int64(matchingLogs.BatchSize))

		// remove last index
		c := matchingLogs.Counter[matchingLogs.NumBatch-1]
		matchingLogs.Counter = matchingLogs.Counter[:matchingLogs.NumBatch-1]
		matchingLogs.StartTimes = matchingLogs.StartTimes[:matchingLogs.NumBatch-1]
		matchingLogs.TotalCount -= c

		// insert at front
		matchingLogs.Counter = append([]int{0}, matchingLogs.Counter...)
		matchingLogs.StartTimes = append([]time.Time{newTime}, matchingLogs.StartTimes...)
	}
	if verbose {
		fmt.Printf("shiftBatches Complete: Current StartTimes = %v\n", matchingLogs.StartTimes)
		fmt.Printf("shiftBatches Complete: Current Total count = %d\n", matchingLogs.TotalCount)
	}
}

func toTimestamp(t time.Time) int64 {
	return t.UnixNano() / int64(time.Millisecond)
}

func fromTimestamp(millis int64) time.Time {
	/*
		Timestamp is in millisecond
	*/
	return time.Unix(0, millis*int64(time.Millisecond))
}

func timeMilliSecDifference(old time.Time, recent time.Time) int64 {
	/*
		Calculate time elapsed from old to recent
		Precondition: recent is later than old
	*/
	return recent.UnixNano()/int64(time.Millisecond) - old.UnixNano()/int64(time.Millisecond)
}

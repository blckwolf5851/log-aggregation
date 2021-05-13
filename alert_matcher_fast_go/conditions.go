package main

type Conditions map[string]string

func (conditions Conditions) Match(event Event) bool {
	// TODO: fill in condition matching algorithm
	return true
}
func (conditions Conditions) GetConditionId() (string, error) {
	// TODO: fill in condition matching algorithm
	return "4hiu43kj65p3db4", nil
}

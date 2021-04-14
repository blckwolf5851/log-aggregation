package main

import "strings"

type Config struct {
	SpecificProcess     map[string]string
	IssuesGeneralFields struct {
		Number      string
		Details     string
		Timestamp   string
		Log_level   string
		OtherFields map[string]string
	}
	Issues          map[string]Issue
	Priority        map[string]int
	ImportantEvents map[string]string
}

type ConfigInterface struct {
	SpecificProcess     map[string]string `yaml:"SpecificProcess" json:"SpecificProcess"`
	IssuesGeneralFields struct {
		Number      string            `yaml:"Number" json:"Number"`
		Details     string            `yaml:"Details" json:"Details"`
		Timestamp   string            `yaml:"Timestamp" json:"Timestamp"`
		Log_level   string            `yaml:"LogLevel" json:"LogLevel"`
		OtherFields map[string]string `yaml:"OtherFields" json:"OtherFields"`
	} `yaml:"IssuesGeneralFields"  json:"IssuesGeneralFields"`
	Issues          map[string]interface{} `yaml:"Issues" json:"Issues"`
	Priority        map[string]int         `yaml:"Priority" json:"Priority"`
	ImportantEvents map[string]string      `yaml:"ImportantEvents" json:"ImportantEvents"`
}
type Issue struct {
	specific_process  map[string]string
	regex             string
	detailing_mode    string
	grouping          string
	additional_fields map[string]string
}
type GroupedStruct struct {
	Group_names   []string
	Group_content map[string][][]string
	Group_count   map[string][]int
}
type AnalysisDetails struct {
	FileName        string
	RawLog          string
	SpecificProcess map[string]string
	Header          []string
	OrderedIssues   []string
	Issues          map[string]map[string]string
	Platform        string
}
type FullDetails struct {
	Analysis_details AnalysisDetails
	GroupedIssues    map[string]GroupedStruct
	NonGroupedIssues map[string]map[string]bool
	ImportantEvents  map[int]string
}

var (
	Log_levels = map[string][]string{"Ios": []string{"Critical", "Error", "Warning", "Notice", "Info", "Debug", "Trace"},
		"my-android-bucket": []string{"Assert", "Error", "Warning", "Info", "Debug", "Verbose"}}
	log_levels_map = map[string]map[string]string{"Ios": map[string]string{"Critical": "C", "Error": "E", "Warning": "W", "Notice": "N", "Info": "I", "Debug": "D", "Trace": "T"},
		"my-android-bucket": map[string]string{"Assert": "A", "Error": "E", "Warning": "W", "Info": "I", "Debug": "D", "Verbose": "V"}}
	log_levels_rgx = map[string]map[string]string{"Ios": map[string]string{"start": "", "end": ""},
		"my-android-bucket": map[string]string{"start": "(?m)^(?:0[1-9]|1[0-2])-(?:0[1-9]|(?:1|2)[0-9]|3(?:0|1))\\s(?:(?:(?:0|1)[0-9])|(?:2[0-3])):[0-5][0-9]:[0-5][0-9]\\.\\d{3}(?:\\s)*\\d{4,5}(?:\\s)*\\d{4,5}\\s", "end": "\\s.*"}}
)

func CountLine(content string) int {
	return len(strings.Split(content, "\n"))
}

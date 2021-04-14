package main

import (
	"regexp"
	"strings"
	"sync"

	"gopkg.in/yaml.v2"
)

func extractConfig(cfgName string, bucket string, cfgFile *Config) error {
	/*
		Given where to download config file (cfgName, bucket), load file content into Config struct
		@ Params
			cfgName string: name of the config file in cloud storage
			bucket string: bucket in cloud (where <cfgName> config file is stored)
			cfgFile *Config: pointer to data structure that will hold config info after function return
	*/
	// download configuration file from cloud
	// cfg_data, err := utilities.DownloadFile(nil, bucket, cfgName)
	// if err != nil {
	// 	return err
	// }
	var cfg_data = `SpecificProcess:
  proc1: a
  proc2: b
IssuesGeneralFields:
  Number: 1324
  Details: message
  Timestamp: 10245861
  LogLevel: 3
  OtherFields:
    other_field1: something1
    other_field2: something2
Issues:
  issue1:
    regex: .*
    detailing_mode: asdf
    grouping: group1
    specific_process:
      proc1: asdf
      proc2: asdf2
    additional_fields:
      field1: asdf
      field2: asdf2
Priority:
  p1: 3
  p2: 4
ImportantEvents:
    event1: asdf
    event2: asdf`
	// read the yaml file into ConfigInterface struct
	cfg := &ConfigInterface{}
	// if err := yaml.Unmarshal(cfg_data, cfg); err != nil {
	if err := yaml.Unmarshal([]byte(cfg_data), cfg); err != nil {
		return err
	}
	// modify the given configuration pointer
	cfgFile.IssuesGeneralFields.Details = cfg.IssuesGeneralFields.Details
	cfgFile.IssuesGeneralFields.Log_level = cfg.IssuesGeneralFields.Log_level
	cfgFile.IssuesGeneralFields.Number = cfg.IssuesGeneralFields.Number
	cfgFile.IssuesGeneralFields.OtherFields = cfg.IssuesGeneralFields.OtherFields
	cfgFile.IssuesGeneralFields.Timestamp = cfg.IssuesGeneralFields.Timestamp
	cfgFile.Priority = cfg.Priority
	cfgFile.SpecificProcess = cfg.SpecificProcess
	cfgFile.ImportantEvents = cfg.ImportantEvents
	// extract the issue into given configuration struct pointer
	cfgFile.Issues = make(map[string]Issue)
	for issue_name, _ := range cfg.Issues {
		cfgFile.Issues[issue_name] = extract_issues_content(cfg.Issues[issue_name])
	}
	return nil
}
func extract_issues_content(issue interface{}) Issue {
	/*
		extract issue section of the config into Issue struct
		@ Params
			issue interface{}: content of nested issue struct under Issue section in yaml
		@ Return
			myIssue Issue: struct that will hold onto issue information
	*/

	myIssues := Issue{}
	myIssues.specific_process = make(map[string]string)
	myIssues.additional_fields = make(map[string]string)
	for issue_key, issue_value := range issue.(map[interface{}]interface{}) {
		switch issue_value.(type) {
		case string:
			switch issue_key {
			case "regex":
				myIssues.regex = issue_value.(string)
			case "detailing_mode":
				myIssues.detailing_mode = issue_value.(string)
			case "grouping":
				myIssues.grouping = issue_value.(string)
			}

		case map[interface{}]interface{}:
			for name, value := range issue_value.(map[interface{}]interface{}) {
				if issue_key == "specific_process" {
					myIssues.specific_process[name.(string)] = value.(string)
				} else {
					myIssues.additional_fields[name.(string)] = value.(string)
				}
			}
		case interface{}:
		}
	}
	return myIssues
}

func getImportantEvents(cfgFile *Config, fContent string, importantEvents map[int]string) int {
	/*
		Prepare importantEvents to hold line number to important event name mapping
		@ Params
			cfgFile *Config: data structure that will hold config info after function return
			fContent string: raw log file content
			importantEvents map[int]string: upon function finish, it will contain mapping from line number to event name
		@ Return
			number of lines in the log file
	*/
	// get important event matching regex from raw log file content
	if len(cfgFile.ImportantEvents) < 1 {
		return 0
	}
	contentMap := make(map[string]int) // map raw log lines to line index
	contentSlice := strings.Split(fContent, "\n")
	for index, line := range contentSlice {
		contentMap[line] = index
	}
	var waitGroup sync.WaitGroup
	var mutex sync.Mutex
	waitGroup.Add(len(cfgFile.ImportantEvents))
	for ev, ev_rgx := range cfgFile.ImportantEvents {
		go func(ev string, ev_rgx string) {
			ev_rgx_comp, err := regexp.Compile(ev_rgx)
			if err != nil {
				waitGroup.Done()
				return
			}
			// list of log file line that contain matching event
			ev_content := ev_rgx_comp.FindAllString(fContent, -1)
			if len(ev_content) > 0 {
				mutex.Lock()
				for _, match_ev := range ev_content {
					importantEvents[contentMap[match_ev]] = ev
				}
				mutex.Unlock()
			}
			waitGroup.Done()
		}(ev, ev_rgx)
	}
	waitGroup.Wait()
	return len(contentSlice)
}

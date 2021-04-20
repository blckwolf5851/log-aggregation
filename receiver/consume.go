package main

import (
	"log-aggregation/config"
)

func init() {
	config.RegistInputHandler("kafka", InitHandler)
}

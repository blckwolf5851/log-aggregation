# Log Aggregation

## Setup

### Docker Setup
Run the following command to setup docker development environment

```
curl -sSL https://raw.githubusercontent.com/bitnami/bitnami-docker-kafka/master/docker-compose.yml > docker-compose.yml

docker-compose -f docker-compose.yml up
```

Note the kafka environment should have those variable during development

```
    - KAFKA_LISTENERS=PLAINTEXT://:9092
    - KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://127.0.0.1:9092
    - KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181
    - ALLOW_PLAINTEXT_LISTENER=yes
```

### Go Module Setup

```
go mod init log-aggregation
go mod tidy
```
### Elasticsearch Setup
To change vm.max_map_count
```
wsl -d docker-desktop
sysctl -w vm.max_map_count=262144
exit
```

## Commands

### Send data to producer
To send new logs to system on Windows:
```
curl -H "Content-Type: application/json" -X POST http://127.0.0.1:3000/api/v1/logs  -d "{ \"level\":\"info\", \"message\":\"Docker starting...\" }"
```

To send new logs to system on Linux:
```
curl --location --request POST '127.0.0.1:3000/api/v1/comments' 
--header 'Content-Type: application/json' \
--data-raw '{ "level":"info", "message":"Docker starting..." }'
```

## Useful Links
https://github.com/bitnami/bitnami-docker-kafka/blob/master/README.md

https://pkg.go.dev/github.com/shopify/sarama
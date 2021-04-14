# Setup
Run the following command to setup docker development environment

```
curl -sSL https://raw.githubusercontent.com/bitnami/bitnami-docker-kafka/master/docker-compose.yml > docker-compose.yml

docker-compose -f docker-compose.yml up
```

To setup the modules

```
go mod init log-aggregation
go mod tidy
```

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
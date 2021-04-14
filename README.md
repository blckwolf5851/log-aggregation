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

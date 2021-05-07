FROM golang:1.15.7-buster

WORKDIR /usr/local/go/src/log-aggregation/log_receiver

COPY go.* ./

RUN go mod tidy

COPY . ./

EXPOSE 8082

CMD go run transport.go
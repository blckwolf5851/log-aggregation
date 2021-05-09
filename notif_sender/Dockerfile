FROM golang:1.15.7-buster

WORKDIR /usr/local/go/src/log-aggregation/notif_sender

COPY go.* ./

RUN go mod tidy

COPY configuration.json ./

COPY . ./

EXPOSE 8888
# EXPOSE 9092

CMD go run main.go
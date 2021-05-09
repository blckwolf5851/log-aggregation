docker tag notif_sender:v1.0.0 gcr.io/log-aggregation-test/notif_sender:v1.0.0
docker tag kafka_es_bridge:v1.0.0 gcr.io/log-aggregation-test/kafka_es_bridge:v1.0.0
docker tag notif_websock:v1.0.0 gcr.io/log-aggregation-test/notif_websock:v1.0.0
docker tag alert_matcher:v1.0.0 gcr.io/log-aggregation-test/alert_matcher:v1.0.0
docker tag es_api:v1.0.0 gcr.io/log-aggregation-test/es_api:v1.0.0
docker tag log_receiver:v1.0.0 gcr.io/log-aggregation-test/log_receiver:v1.0.0

docker push gcr.io/log-aggregation-test/notif_sender:v1.0.0
docker push gcr.io/log-aggregation-test/kafka_es_bridge:v1.0.0
docker push gcr.io/log-aggregation-test/notif_websock:v1.0.0
docker push gcr.io/log-aggregation-test/alert_matcher:v1.0.0
docker push gcr.io/log-aggregation-test/es_api:v1.0.0
docker push gcr.io/log-aggregation-test/log_receiver:v1.0.0
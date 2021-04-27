from elasticsearch import Elasticsearch
from kafka import KafkaConsumer
import requests
import json
import hashlib
import re

# program this in node.js instead to view logs in real time
TEAM_ID = "Eventarc"
topics = [TEAM_ID]
SERVICE_NAMES = ["http://log-aggregation.com"]

KAFKA_BOOTSTRAP_SERVER = ['localhost:9092']

consumer = KafkaConsumer(
                        bootstrap_servers=KAFKA_BOOTSTRAP_SERVER,
                        auto_offset_reset='earliest',
                        key_deserializer=lambda key: json.loads(
                            key.decode('utf-8')),
                        value_deserializer=lambda msg: json.loads(
                            msg.decode('utf-8')),
                        group_id=TEAM_ID)

partitions = consumer.partitions_for_topic(topics[0])
print(partitions)

consumer.subscribe(topics)


es = Elasticsearch([{'host': 'localhost', 'port': 9200}])

index_setting = {
  "settings": {
        "number_of_shards": 5,
        "number_of_replicas": 2,
        "index": {
            "sort.field": "timestamp",
            "sort.order": "desc"
        }
  }
}
for msg in consumer:
    msg = msg.value
    if "team" not in msg:
        continue
    index = msg["service"].lower()
    index = re.sub('[^a-z-0-9+]+', '', index)
    print(index)
    # doc_type = msg["service"].lower()
    doc_id = msg["timestamp"].lower()
    hash_object = hashlib.md5(msg["msg"].encode())
    doc_id = doc_id+hash_object.hexdigest()
    print(msg)
    print(doc_id)
    es.indices.create(index=index, ignore=400, body=index_setting)
    es.index(index=index, id=doc_id, body=msg)
    print("Message Saved")

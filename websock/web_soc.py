import os
import gevent
from flask import Flask, render_template
from flask_sockets import Sockets

app = Flask(__name__)
app.debug = 'DEBUG' in os.environ

sockets = Sockets(app)

KAFKA_BOOTSTRAP_SERVER = ['localhost:9092']
TEAM_ID = "Eventarc"
topics = [TEAM_ID]

pubsub = KafkaConsumer(
                        bootstrap_servers=KAFKA_BOOTSTRAP_SERVER, 
                        auto_offset_reset='earliest', 
                        value_deserializer=lambda msg: json.loads(msg.decode('utf-8'))
                        )

class ChatBackend:
    """Interface for registering and updating WebSocket clients."""

    def __init__(self, topics):
        self.clients = list()
        self.subscription2client = {}
        self.pubsub = pubsub
        self.pubsub.subscribe(topics)

    def __iter_data(self):
        for msg in self.consumer:
            yield msg.value

    def change_subscription(ws, subscriptions):
        for sub in subscriptions:
            if sub not in self.subscription2client:
                self.subscription2client[sub] = set()
            self.subscription2client[sub].add(ws)

    def register(self, client):
        """Register a WebSocket connection for Redis updates."""
        self.clients.append(client)

    def send(self, client, data):
        """Send given data to the registered client.
        Automatically discards invalid connections."""
        try:
            if client in self.subscription2client(data["team"])
            client.send(data)
        except Exception:
            self.clients.remove(client)

    def run(self):
        """Listens for new messages in Kafka, and sends them to clients."""
        for data in self.__iter_data():
            for client in self.clients:
                gevent.spawn(self.send, client, data)

    def start(self):
        """Maintains Kafka subscription in the background."""
        gevent.spawn(self.run)

chats = ChatBackend(topics)
chats.start()


@sockets.route('/subscribe')
def inbox(ws):
    """Receives incoming subscribe commands"""
    while not ws.closed:
        # Sleep to prevent *constant* context-switches.
        gevent.sleep(0.1)
        message = ws.receive()
        # message is of form: "topic1,topic2,topic3..."
        if not message:
            continue
        topics = message.split(",")
        name = message[0]

        print(f"change worker's subscription to {topics}")
        change_subscription(ws, topics)


@sockets.route('/receive')
def outbox(ws):
    """Sends outgoing chat messages, via `ChatBackend`."""
    chats.register(ws)

    while not ws.closed:
        # Context switch while `ChatBackend.start` is running in the background.
        gevent.sleep(0.1)
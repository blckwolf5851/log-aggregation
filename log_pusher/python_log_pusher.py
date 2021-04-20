from kafka.client import KafkaClient
from kafka.producer import SimpleProducer,KeyedProducer
import logging,sys

class KafkaLoggingHandler(logging.Handler):

    def __init__(self, host, port, topic, key=None):
        logging.Handler.__init__(self)
        self.kafka_client = KafkaClient(host, port)
        self.key = key
        if key is None:
            self.producer = SimpleProducer(self.kafka_client, topic)
        else:
            self.producer = KeyedProducer(self.kafka_client, topic)

    def emit(self, record):
        #drop kafka logging to avoid infinite recursion
        if record.name == 'kafka':
            return
        try:
            #use default formatting
            msg = self.format(record)
            #produce message
            if self.key is None:
                self.producer.send_messages(msg)
            else:
                self.producer.send(self.key, msg)
        except:
            import traceback
            ei = sys.exc_info()
            traceback.print_exception(ei[0], ei[1], ei[2], None, sys.stderr)
            del ei

    def close(self):
        self.producer.stop()
        logging.Handler.close(self)

kh = KafkaLoggingHandler("localhost", 9092, "logs")
#OR
#kh = KafkaLoggingHandler("localhost", 9092, "test_log", "key1")

logger = logging.getLogger("")
logger.setLevel(logging.DEBUG)
logger.addHandler(kh)
logger.info("The %s boxing wizards jump %s", 5, "quickly")
logger.debug("The quick brown %s jumps over the lazy %s", "fox",  "dog")
try:
    import math
    math.exp(1000)
except:
    logger.exception("Problem with %s", "math.exp")
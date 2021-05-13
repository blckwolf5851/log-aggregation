from num_batch_calc import get_num_batch
import math
from datetime import datetime
import dateutil.parser
# a data structure for holding queries

def emit_notification(query):
    print("Sending email to", query["sendTo"])

verbose = True

class MatchingLogs:
    def __init__(self, num_batch, batch_size) -> None:
        self.counter = [0] * num_batch
        self.start_time = [-1] * num_batch # the start of each batch
        self.start_time[0] = datetime.now()
        self.batch_size = batch_size
        self.total_count = 0
    
    def count_event(self, timestamp):
        now = datetime.now()
        self.shift_batches()
        batch_idx = int((now - timestamp).total_seconds()*1000) // self.batch_size
        self.counter[batch_idx] += 1
        self.total_count += 1
        if verbose: print("Event belong to time batch #", batch_idx)
        if verbose: print("Current total count:", self.total_count)
    
    def shift_batches(self):
        now = datetime.now()
        num_shifts = int((now - self.start_time[0]).total_seconds() * 1000) // self.batch_size
        if verbose: print(f"Batches will be shifted {num_shifts} times.")
        for _ in range(num_shifts):
            self.counter.insert(0, 0)
            self.start_time.insert(0, self.start_time[0] + self.batch_size)
            self.total_count -= self.counter.pop()
            self.start_time.pop()
            if verbose: print("Timesplit:", self.start_time)
    

class Query:
    def __init__(self, query:dict) -> None:
        self.data = query
        self.id = query["id"]
        self.conditions = query["conditions"]
        self.threshold = query["threshold"]
        self.window = query["window"]
        
        self.num_batch = self.get_num_batch()
        self.batch_size = math.ceil(self.window / self.num_batch)
        self.matching_logs = MatchingLogs(self.num_batch, self.batch_size)
        if verbose: print("Number of batch will be", self.num_batch)
        self.condition_id = self.get_condition_id(query)
    
    def get_num_batch(self):
        mean = 4 # TODO: calculate mean here

        var=50
        if not mean < 22:
            var = 100 # TODO: calculate variance here
        
        return get_num_batch(mean, self.threshold, precision=0.9, var=var)
    
    def get_condition_id(self, query):
        return 'abe7jr4ivn3f'
    
    def check_threshold(self):
        if self.matching_logs.total_count >= self.threshold:
            if verbose: print(f"Threshold of {self.threshold} hit")
            emit_notification(self.data)

class Matcher:
    def __init__(self) -> None:
        self.conditionid2condition = {}

    def add_conditions(self, conditionid:str, conditions:dict) -> None:
        self.conditionid2condition[conditionid] = conditions
    
    def get_matching_conditionids(self, event:dict):
        matching_conditionids = []
        for conditionid, conditions in self.conditionid2condition.items():
            if self.condition_satisfied(conditions, event):
                matching_conditionids.append(conditionid)
        return matching_conditionids
    
    def condition_satisfied(self, conditions:dict, event:dict) -> bool:
        return True

class Queries:
    def __init__(self) -> None:
        self.conditionid2queries = {}
        self.matcher = Matcher()

    def process_query(self, query:dict) -> None:
        command = query["command"]
        query = Query(query)
        if command == "ADD":
            self.add(query)
        elif command == "DEL":
            self.remove(query)
    
    def add(self, query:Query) -> None:
        if query.condition_id not in self.conditionid2queries:
            self.matcher.add_conditions(query.condition_id, query.conditions)
            self.conditionid2queries[query.condition_id] = {}
        self.conditionid2queries[query.condition_id][query.id] = query
    
    def remove(self, query:Query) -> None:
        del self.conditionid2queries[query.condition_id][query.id]

    def process_event(self, event:dict):
        conditionids = self.matcher.get_matching_conditionids(event)
        event_timestamp = dateutil.parser.parse(event["timestamp"])
        
        if verbose: print("Received event at time:", event_timestamp)
        if verbose: print("Matching conditions are:", conditionids)
        for conditionid in conditionids:
            for queryid in self.conditionid2queries[conditionid]:
                query = self.conditionid2queries[conditionid][queryid]
                
                query.matching_logs.count_event(event_timestamp)
                query.check_threshold()
    

sample_query = {
    "id": '3sfgff4dASE',
    "command": "ADD", # can be ADD, DEL, every alert in <alerts> cannot have command = DEL
    "conditions": {
        "levelname": "ERROR" # field equal value
    },
    "threshold": 2,
    "window": 6485218, # time window size in millisecond
    "sendTo": ['154757929sherry@gmail.com'],
    "priority": "HIGH", # LOW, MEDIUM, HIGH
    "receiveEmail": False
}

now = datetime.now()
sample_event = {
    "timestamp": now.isoformat(),
    "levelname": "ERROR",
    "message": "Welcome to logging" 
}
queries = Queries()
queries.process_query(sample_query)
queries.process_event(sample_event)
queries.process_event(sample_event)


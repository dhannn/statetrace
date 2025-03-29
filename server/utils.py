from json import JSONEncoder
from collections import deque

class DequeEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, deque):
            return list(obj)
        return JSONEncoder.default(self, obj)
    
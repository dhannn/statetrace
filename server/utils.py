from json import JSONEncoder
from collections import deque

from loguru import logger

from machine import MTape

class DequeEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, deque):
            return list(obj)
        return JSONEncoder.default(self, obj)
    
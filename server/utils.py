from json import JSONEncoder
from collections import deque

from machine import MTape

class DequeEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, deque):
            return list(obj)
        return JSONEncoder.default(self, obj)

class WorklistEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, list):
            new_obj = []
            for state, memory, head in obj:
                new_mem = {}
                for name in memory:
                    new_mem[name] = {
                        'content': memory[name]['content'],
                        'type': memory[name]['type']
                    }

                    mem_type = memory[name]['type']
                    if mem_type == 'TAPE':
                        new_mem['content']

                if isinstance(memory, MTape):
                    pass
                new_obj.append()

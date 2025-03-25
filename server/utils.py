from json import JSONEncoder
from collections import deque

class DequeEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, deque):
            print('AAAAAAA', obj)
            for _, mems, _ in obj:
                for mem in mems:
                    print(obj)
                    mems[mem]['content'] = list(mems[mem]['content'])
            return list(obj)
        return JSONEncoder.default(self, obj)

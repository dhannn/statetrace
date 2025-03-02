from collections import deque

class Machine:

    def __init__(self, definition):

        self.commands = {
            'SCAN': self.scan,
            'SCAN LEFT': self.scan_left,
            'SCAN RIGHT': self.scan,
            'WRITE': self.write,
            'READ': self.read
        }

        self.tape_head = 0
        self.state = list(definition['states'].keys())[0]
        self.states = definition['states']

        self.memory = {}
        for _name, _type in definition['memory'].items():

            content = None
            if _type == 'STACK':
                content = []
            elif _type == 'QUEUE':
                content = deque()

            self.memory[_name] = {
                'type': _type,
                'content': content
            }

    def set_input(self, str_input):
        self.input = '#' + str_input + '#'

    def next(self):
        state = self.states[self.state]
        command = self.commands[state['command']]
        arg = state['arg']
        transitions = state['transitions']
        next_state = command(arg=arg, transitions=transitions)
        self.state = next_state

    def scan(self, arg, transitions):
        self.tape_head += 1
        print(self.input)
        if self.input is not None:
            current_symbol = self.input[self.tape_head]
            next_state = transitions.get(current_symbol, None)
            
            if next_state == None:
                raise Exception('AAAAAAAA')
            return next_state

    def scan_left(self, arg, transitions):
        self.tape_head -= 1
        if self.input is not None:
            current_symbol = self.input[self.tape_head]
            next_state = transitions.get(current_symbol, None)
            
            if next_state == None:
                raise Exception('AAAAAAAA')
            return next_state

    def write(self, arg, transitions):
        content = self.memory[arg]['content']
        memory_type = self.memory[arg]['type']

        if memory_type == 'STACK':
            # if len(content) > 0:
            print(transitions)
            if len(transitions) == 1:
                symbol = list(transitions)[0]
            next_state = transitions.get(symbol)
            
            if next_state == None:
                raise Exception('AAAAAAAA')
            content.append(symbol)
            print(self.memory[arg]['content'])
            return next_state

    def read(self, arg, transitions):
        memory_type = self.memory[arg]['type']
        content = self.memory[arg]['content']

        if memory_type == 'STACK':
            # if len(content) > 0:
            top = content.pop()
            print(transitions)
            if top in list(transitions):
                next_state = transitions.get(top)
            
            if next_state == None:
                raise Exception('AAAAAAAA')
            print(self.memory[arg]['content'])
            return next_state

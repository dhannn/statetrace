from collections import deque

from loguru import logger

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
        self.active_states = { list(definition['states'].keys())[0] }
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
        new_active_states = set()
        is_done = False
        for state in self.active_states:

            state = self.states[state]
            command = self.commands[state['command']]
            arg = state['arg']
            transitions = state['transitions']

            # Get possible next states (could be multiple)
            possible_next_states = command(arg=arg, transitions=transitions, is_done=is_done)
            new_active_states.update(possible_next_states)
            is_done = True
            
        self.active_states = new_active_states

    def scan(self, arg, transitions, is_done):
        if not is_done:
            self.tape_head += 1

        if self.input is not None:
            current_symbol = self.input[self.tape_head]
            return transitions.get(current_symbol, set())  # Return a set of next states

    def scan_left(self, arg, transitions):
        self.tape_head -= 1
        if self.input is not None:
            current_symbol = self.input[self.tape_head]
            return transitions.get(current_symbol, set())

    def write(self, arg, transitions):
        content = self.memory[arg]['content']
        memory_type = self.memory[arg]['type']

        if memory_type == 'STACK':
            symbols = list(transitions.keys())
            for symbol in symbols:
                pass
            content.append(symbol)
            return set(transitions[symbol])  # Return a set of next states

    def read(self, arg, transitions):
        memory_type = self.memory[arg]['type']
        content = self.memory[arg]['content']

        if memory_type == 'STACK' and content:
            top = content.pop()
            return set(transitions.get(top, []))  # Return a set of next states

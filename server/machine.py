from collections import deque
from pprint import pprint

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
        self.memory_types = {}
        self.memory_snapshot = []
        initial_snapshot = {
            'STACK': []
        }
        
        for _name, _type in definition['memory'].items():

            content = None
            if _type == 'STACK':
                content = []
            elif _type == 'QUEUE':
                content = deque()
            
            initial_snapshot[_type].append({
                'name': _name,
                'content': content
            })
            self.memory_types[_name] = _type
            logger.debug(f'initial_snapshot[[{_type}]: {initial_snapshot[_type]}')

        
        self.memory_snapshot.append(initial_snapshot)
        logger.debug(f'memory_snapshot: {self.memory_snapshot}')

    def set_input(self, str_input):
        self.input = '#' + str_input + '#'

    def next(self):
        new_memory_states = {}
        new_active_states = set()
        is_done = False
        
        print('Transitions', self.states)

        for state in self.active_states:

            state = self.states[state]
            command = self.commands[state['command']]
            arg = state['arg']
            transitions = state['transitions']

            # Get possible next states (could be multiple)
            memory_snapshot = self.memory_snapshot
            logger.debug(f'Memory Snapshot: { memory_snapshot }')
            possible_next_states = command(arg=arg, transitions=transitions, is_done=is_done)

            for next_state, new_memory in possible_next_states:
                new_active_states.add(next_state)
                new_memory_states[next_state] = new_memory

            logger.debug(f'New Memory: { new_memory_states }')

            new_active_states.update(possible_next_states)
            is_done = True
            
        self.active_states = new_active_states

    def scan(self, arg, transitions, is_done):
        if not is_done:
            self.tape_head += 1

        if self.input is not None:
            current_symbol = self.input[self.tape_head]
            print('scan()', transitions.get(current_symbol, set()))
            return transitions.get(current_symbol, set()),  # Return a set of next states

    def scan_left(self, arg, transitions, is_done):
        if not is_done:
            self.tape_head -= 1

        if self.input is not None:
            current_symbol = self.input[self.tape_head]
            return transitions.get(current_symbol, set()),

    def write(self, arg, transitions, is_done):
        pass

    def read(self, arg, transitions, is_done):
        pass

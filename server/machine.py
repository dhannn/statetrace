from collections import deque
from copy import deepcopy
from pprint import pprint
import random

from loguru import logger

class Memory:
    def write(symbol: str):
        pass

    def read() -> str:
        pass
    
    def __iter__(self):
        self.i = 0
        return self

    def __next__(self):
        x = self.i
        self.i += 1
        
        if x >= len(self.content):
            return None

        return self.content[x]

class MQueue(Memory):

    content: list

    def __init__(self):
        self.content = []

    def write(self, symbol):
        self.content.insert(0, symbol)
    
    def read(self):
        return self.content.pop()

class MStack(Memory):

    content: list

    def __init__(self):
        self.content = []

    def write(self, symbol):
        self.content.append(symbol)
    
    def read(self):
        return self.content.pop()

class Machine:

    def __init__(self, definition):

        self.definition = definition
        self.commands = {
            'SCAN': self.scan,
            'SCAN LEFT': self.scan_left,
            'SCAN RIGHT': self.scan,
            'WRITE': self.write,
            'READ': self.read
        }

        self.memory = {}
        for name, mem_type in definition['memory'].items():
            if mem_type == 'STACK':
                self.memory[name] = {
                    'type': mem_type,
                    'content': []
                }
            elif mem_type == 'QUEUE':
                self.memory[name] = {
                    'type': mem_type,
                    'content': []
                }
            
        self.head = 0        
        self.worklist = deque()  # Worklist for nondeterministic execution paths
        self.worklist.append((list(self.definition['states'].keys())[0], self.memory.copy(), self.head))

    def set_input(self, str_input):
        self.input = '#' + str_input + '#'
    
    def get_states(self):
        initial_states = self.definition['states'].keys()

        explored = {}
        for state in initial_states:
            for symbol, next_states in self.definition['states'][state]['transitions'].items():
                if not explored.get(state):
                    explored[state] = {}
                explored[state][symbol] = next_states
        
        return explored

    def next(self):
        if not self.worklist:
            logger.info('All paths rejected')
            return 'Rejected'

        new_states = []

        while self.worklist:
            state, mem_snapshot, head_pos = self.worklist.popleft()

            if state == 'accept':
                logger.info("Input Accepted!")
                return "Accepted"
            
            state_def = self.definition['states'].get(state)
            
            if not state_def:
                continue  # Skip undefined states
            
            command = state_def['command']
            arg = state_def['arg']
            transitions = state_def['transitions']

            possible_next_states = self.commands[command](arg, transitions, head_pos, mem_snapshot)

            # Add all valid paths to the worklist
            new_states.extend(possible_next_states)

        self.worklist.extend(new_states)

        if not self.worklist:  # If no more paths exist, the machine rejects the input
            logger.info("All paths led to dead ends. Input Rejected.")
            return "Rejected"
        
        return new_states

    def scan(self, arg, transitions, head_pos, memory):
        """Read input at the current tape position and determine the next state(s)."""
        symbol = self.input[head_pos + 1]

        x = [(next_state, memory.copy(), head_pos + 1) 
                for read_symbol, states in transitions.items() if symbol == read_symbol for next_state in states]
        return x

    def scan_left(self, arg, transitions, head_pos, memory):
        """Move the tape head left."""
        symbol = self.input[head_pos - 1]
        return [(next_state, memory.copy(), head_pos - 1) 
                for read_symbol, states in transitions.items() if symbol == read_symbol for next_state in states]

    def scan_right(self, arg, transitions, head_pos, memory):
        """Move the tape head right."""
        return self.scan(arg, transitions, head_pos, memory)

    def write(self, arg, transitions, head_pos, memory):
        """Write to memory and move to all possible next states."""
        possible_states = []
        if arg in memory:
            for symbol, states in transitions.items():
                for state in states:
                    new_mem = deepcopy(memory)
                    if new_mem[arg]['type'] == 'STACK':
                        new_mem[arg]['content'].append(symbol)
                    elif new_mem[arg]['type'] == 'QUEUE':
                        new_mem[arg]['content'].insert(0, symbol)
                    next_state = (state, new_mem, head_pos)
                    possible_states.append(next_state) 

        return possible_states

    def read(self, arg, transitions, head_pos, memory):
        """Read from stack/queue memory and determine next state(s)."""
        if arg in memory and memory[arg]:  # Ensure memory is not empty
            read_value = memory[arg]['content'].pop()
            return [(state, deepcopy(memory), head_pos) for state in transitions.get(read_value, [])]
        return []
    
from collections import deque
from copy import deepcopy
from pprint import pprint
import random

from loguru import logger

def set_input(type: str, memory: dict, input_string: str):

    if type == 'TAPE':
        for i, char in enumerate(input_string):
            memory['tape'][i + 1] = char
    elif type == '2D_TAPE':
        for i, char in enumerate(input_string):
            memory['tape'][str((0, i + 1))] = char

    return memory

class Machine:

    def __init__(self, definition):

        self.definition = definition
        self.commands = {
            'SCAN': self.scan,
            'SCAN LEFT': self.scan_left,
            'SCAN RIGHT': self.scan,
            'WRITE': self.write,
            'READ': self.read,
            'LEFT': self.left,
            'RIGHT': self.right,
            'UP': self.up,
            'DOWN': self.down,
            'PRINT': self.print
        }

        self.memory = {}
        self.input_tape = None
        for name, mem_type in definition['memory'].items():
            logger.debug(f'{mem_type}')
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
            elif mem_type == 'TAPE':
                if self.input_tape == None:
                    self.input_tape = name
                self.memory[name] = {
                    'type': mem_type,
                    'content': {
                        'head': 0,
                        'tape': {}
                    }
                }
            elif mem_type == '2D_TAPE':
                if self.input_tape == None:
                    self.input_tape = name
                self.memory[name] = {
                    'type': mem_type,
                    'content': {
                        'head': (0, 0),
                        'tape': {}
                    }
                }

        self.head_x = 0        
        self.worklist = deque()  # Worklist for nondeterministic execution paths
        self.worklist.append((list(self.definition['states'].keys())[0], self.memory.copy(), self.head_x))

    def set_input(self, str_input):
        if self.input_tape != None:
            set_input(
                self.memory[self.input_tape]['type'], 
                self.memory[self.input_tape]['content'], 
                str_input)
            logger.debug(f'self.input_tape: { self.input_tape }')
        else:
            self.input = '#' + str_input + '#'
    
    def get_states(self):
        initial_states = self.definition['states'].keys()

        explored = {}
        for state in initial_states:
            for symbol, next_states in self.definition['states'][state]['transitions'].items():
                if not explored.get(state):
                    explored[state] = {
                        'command': self.definition['states'][state]['command'],
                        'next-states': {}
                    }
                explored[state]['next-states'][symbol] = next_states
        
        logger.debug(f'Explored: {explored}')

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
        logger.debug(f'self.worklist: {self.worklist}')

        if not self.worklist:  # If no more paths exist, the machine rejects the input
            logger.info("All paths led to dead ends. Input Rejected.")
            return "Rejected"
        
        return new_states

    def scan(self, arg, transitions, head_pos, memory):
        """Read input at the current tape position and determine the next state(s)."""
        if self.input_tape != None:
            return self.right(self.input_tape, transitions, head_pos, memory)

        symbol = self.input[head_pos + 1]

        x = [(next_state, memory.copy(), head_pos + 1) 
                for read_symbol, states in transitions.items() if symbol == read_symbol for next_state in states]
        return x

    def scan_left(self, arg, transitions, head_pos, memory):
        """Move the tape head left."""
        if self.input_tape != None:
            return self.left(self.input_tape, transitions, head_pos, memory)
        
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
        if arg in memory and memory[arg] and len(memory[arg]['content']) > 0:  # Ensure memory is not empty
            read_value = memory[arg]['content'].pop()
            return [(state, deepcopy(memory), head_pos) for state in transitions.get(read_value, [])]
        return []
    
    def right(self, arg, transitions, head_pos, memory):
        head_pos += 1
        possible_states = []
        if arg in memory:
            logger.debug(f'memory: {memory}')
            for symbol, states in transitions.items():
                for state in states:
                    mem = deepcopy(memory)
                    if mem[arg]['type'] == 'TAPE':
                        mem[arg]['content']['head'] += 1
                        head = mem[arg]['content']['head']
                        logger.debug(f'head: {head}')
                        x = mem[arg]['content']['tape'].get(head, '#')
                        logger.debug(f'curr char: {x}')
                        logger.debug(f'symbol: {symbol}')

                        read = symbol.split('/')
                        if len(read) == 1:
                            write = read[0]
                            read = read[0]
                        else:
                            write = read[1]
                            read = read[0]

                        logger.debug(f': {x}, {read}')
                        mem[arg]['content']['tape'][head] = write
                        logger.debug(f'tape: {mem[arg]}')

                        if x == read:
                            possible_states.append((state, mem, head_pos))
                    elif mem[arg]['type'] == '2D_TAPE':
                        mem[arg]['content']['head'] = mem[arg]['content']['head'][0 ], mem[arg]['content']['head'][1] + 1
                        head = mem[arg]['content']['head']
                        logger.debug(f'head: {head}')
                        x = mem[arg]['content']['tape'].get(str(head), '#')
                        logger.debug(f'curr char: {x}')

                        read = symbol.split('/')
                        if len(read) == 1:
                            write = read[0]
                            read = read[0]
                        else:
                            write = read[1]
                            read = read[0]

                        mem[arg]['content']['tape'][str(head)] = write
                        logger.debug(f'tape: {mem[arg]['content']['tape']}')

                        if x == read:
                            possible_states.append((state, mem, head_pos))
                logger.debug(f'Symbol: {transitions[symbol]}')
        
        return possible_states
    
    def left(self, arg, transitions, head_pos, memory):
        head_pos -= 1
        possible_states = []
        if arg in memory:
            logger.debug(f'memory: {memory}')
            for symbol, states in transitions.items():
                for state in states:
                    mem = deepcopy(memory)
                    if mem[arg]['type'] == 'TAPE':                   
                        mem[arg]['content']['head'] -= 1
                        head = mem[arg]['content']['head']
                        logger.debug(f'head: {head}')
                        x = mem[arg]['content']['tape'].get(head, '#')
                        logger.debug(f'curr char: {x}')

                        read = symbol.split('/')
                        if len(read) == 1:
                            write = read[0]
                            read = read[0]
                        else:
                            write = read[1]
                            read = read[0]

                        mem[arg]['content']['tape'][head] = write
                        logger.debug(f'tape: {mem[arg]['content']['tape']}')

                        if x == read:
                            possible_states.append((state, mem, head_pos))
                    elif mem[arg]['type'] == '2D_TAPE':
                        mem[arg]['content']['head'] = mem[arg]['content']['head'][0], mem[arg]['content']['head'][1] - 1
                        head = mem[arg]['content']['head']
                        logger.debug(f'head: {head}')
                        x = mem[arg]['content']['tape'].get(str(head), '#')
                        logger.debug(f'curr char: {x}')


                        read = symbol.split('/')
                        if len(read) == 1:
                            write = read[0]
                            read = read[0]
                        else:
                            write = read[1]
                            read = read[0]
                        
                        mem[arg]['content']['tape'][str(head)] = write
                        logger.debug(f'tape: {mem[arg]['content']['tape']}')

                        if x == read:
                            possible_states.append((state, mem, head_pos))
                logger.debug(f'Symbol: {transitions[symbol]}')
        
        return possible_states
    
    def up(self, arg, transitions, head_pos, memory):
        possible_states = []
        if arg in memory:
            logger.debug(f'memory: {memory}')
            for symbol, states in transitions.items():
                for state in states:
                    mem = deepcopy(memory)
                    if mem[arg]['type'] == '2D_TAPE':
                        mem[arg]['content']['head'] = mem[arg]['content']['head'][0] - 1, mem[arg]['content']['head'][1]
                        head = mem[arg]['content']['head']
                        logger.debug(f'head: {head}')
                        x = mem[arg]['content']['tape'].get(str(head), '#')
                        logger.debug(f'curr char: {x}')

                        read, write = symbol.split('/')
                        mem[arg]['content']['tape'][str(head)] = write
                        logger.debug(f'tape: {mem[arg]['content']['tape']}')

                        if x == read:
                            possible_states.append((state, mem, head_pos))
                logger.debug(f'Symbol: {transitions[symbol]}')
        
        return possible_states
    
    def down(self, arg, transitions, head_pos, memory):
        possible_states = []
        if arg in memory:
            logger.debug(f'memory: {memory}')
            for symbol, states in transitions.items():
                for state in states:
                    mem = deepcopy(memory)
                    if mem[arg]['type'] == '2D_TAPE':
                        mem[arg]['content']['head'] = mem[arg]['content']['head'][0] + 1, mem[arg]['content']['head'][1]
                        head = mem[arg]['content']['head']
                        logger.debug(f'head: {head}')
                        x = mem[arg]['content']['tape'].get(str(head), '#')
                        logger.debug(f'curr char: {x}')

                        read, write = symbol.split('/')
                        mem[arg]['content']['tape'][str(head)] = write
                        logger.debug(f'tape: {mem[arg]['content']['tape']}')

                        if x == read:
                            possible_states.append((state, mem, head_pos))
                logger.debug(f'Symbol: {transitions[symbol]}')
        
        return possible_states

    def print(self, arg, transitions, head_pos, memory):

        x = []

        for write_symbol, states in transitions.items():
            mem = memory.copy()
            for next_state in states:
                logger.debug(f'{mem}')
                if not 'stdout' in mem:
                    mem['stdout'] = ''
                
                logger.debug(f'{mem}')
                mem['stdout'] += write_symbol

                x.append((next_state, mem, head_pos))

        return x

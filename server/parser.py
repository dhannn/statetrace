from pprint import pprint
from machine import *

class FSMParser:
    def __init__(self, tokens):
        self.parsed_data = {'memory': {}, 'states': {}}
        self.current_index = 0
        self.state = 'START'
        self.tokens = tokens
        self.current_state_name = None

        # Define valid state transitions
        self.next_valid_tokens = {
            'START': ['DATA_SECTION', 'LOGIC_SECTION'],
            'DATA_SECTION': ['MEMORY_TYPE'],
            'MEMORY_TYPE': ['MEMORY_NAME'],
            'MEMORY_NAME': ['MEMORY_TYPE', 'LOGIC_SECTION'],
            'LOGIC_SECTION': ['STATE_NAME'],
            'STATE_NAME': ['COMMAND'],
            'COMMAND': ['ARG', 'TRANSITION'],
            'ARG': ['TRANSITION'],
            'TRANSITION': ['DELIMITER', 'STATE_NAME', 'END', 'DATA_SECTION'],
            'DELIMITER': ['TRANSITION'],
        }

        # Map states to their handler functions
        self.state_handlers = {
            'START': self.handle_start,
            'DATA_SECTION': self.handle_data_section,
            'MEMORY_TYPE': self.handle_memory_type,
            'MEMORY_NAME': self.handle_memory_name,
            'LOGIC_SECTION': self.handle_logic_section,
            'STATE_NAME': self.handle_state_name,
            'COMMAND': self.handle_command,
            'ARG': self.handle_arg,
            'TRANSITION': self.handle_transition,
            'DELIMITER': self.handle_delimiter
        }

    def next_token(self):
        if self.current_index < len(self.tokens):
            token = self.tokens[self.current_index]
            self.current_index += 1
            return token
        return None

    def parse(self):
        while self.current_index < len(self.tokens):
            token_type, token_value = self.next_token()
            print(f'Currently doing ({token_type},{token_value})')
            self.handle_state(token_type, token_value)
        return self.parsed_data

    def handle_state(self, token_type, token_value):
        if token_type not in self.next_valid_tokens[self.state]:
            self.error(token_value, expected=self.next_valid_tokens[self.state])
            return

        # Call the correct function based on state
        self.state = token_type
        if self.state in self.state_handlers:
            self.state_handlers[self.state](token_type, token_value)
        

    # HANDLER FUNCTIONS
    def handle_start(self, token_type, token_value):
        self.mode = token_type
        self.state = token_type

    def handle_data_section(self, token_type, token_value):
        pass

    def handle_memory_type(self, token_type, token_value):
        self.memory_type = token_value

    def handle_memory_name(self, token_type, token_value):
        self.parsed_data['memory'][token_value] = self.memory_type

    def handle_logic_section(self, token_type, token_value):
        pass

    def handle_state_name(self, token_type, token_value):
        token_value = token_value[:-1]
        self.parsed_data['states'][token_value] = {
            'command': None, 
            'arg': None, 
            'transitions': {}
        }
        self.current_state_name = token_value

    def handle_command(self, token_type, token_value):
        self.parsed_data['states'][self.current_state_name]['command'] = token_value

    def handle_arg(self, token_type, token_value):
        self.parsed_data['states'][self.current_state_name]['arg'] = token_value[1:-1]

    def handle_transition(self, token_type, token_value):
        symbol, state = (token_value[1:-1]).split(',')
        self.parsed_data['states'][self.current_state_name]['transitions'][symbol] = state
        

    def handle_delimiter(self, token_type, token_value):
        pass

    def error(self, token_value, expected):
        raise SyntaxError(f"Unexpected token '{token_value}', expected one of: {expected}")


# Example tokens from your tokenizer
# tokens = [
#     ("DATA_SECTION", ".DATA"),
#     ("MEMORY_TYPE", "STACK"), ("MEMORY_NAME", "S1"),
#     ("MEMORY_TYPE", "STACK"), ("MEMORY_NAME", "S2"),
#     ("LOGIC_SECTION", ".LOGIC"),
#     ("STATE_NAME", "A]"), ("COMMAND", "WRITE"), ("ARG", "(S1)"), ("TRANSITION", "(#,B)"),
# ]
# tokens = [
#     ("DATA_SECTION", ".DATA"),
#     ("MEMORY_TYPE", "STACK"), ("MEMORY_NAME", "S1"),

#     ("LOGIC_SECTION", ".LOGIC"),
    
#     ("STATE_NAME", "A]"), ("COMMAND", "WRITE"), ("ARG", "(S1)"), ("TRANSITION", "(#,B)"),
    
#     ("STATE_NAME", "B]"), ("COMMAND", "SCAN"), ("TRANSITION", "(0,C)"), ("DELIMITER", ","), ("TRANSITION", "(1,D)"),
    
#     ("STATE_NAME", "C]"), ("COMMAND", "WRITE"), ("ARG", "(S1)"), ("TRANSITION", "(#,B)"),
    
#     ("STATE_NAME", "D]"), ("COMMAND", "READ"), ("ARG", "(S1)"), ("TRANSITION", "(#,E)"),
    
#     ("STATE_NAME", "E]"), ("COMMAND", "SCAN"), ("TRANSITION", "(1,D)"), ("DELIMITER", ","), ("TRANSITION", "(#,F)"),
    
#     ("STATE_NAME", "F]"), ("COMMAND", "READ"), ("ARG", "(S1)"), ("TRANSITION", "(#,accept)")
# ]
# tokens = [
#     ("LOGIC_SECTION", ".LOGIC"),

#     ("STATE_NAME", "q0]"), ("COMMAND", "SCAN"),
#     ("TRANSITION", "(0,q0)"), ("DELIMITER", ","),
#     ("TRANSITION", "(1,q1)"), ("DELIMITER", ","),
#     ("TRANSITION", "(#,accept)"),

#     ("STATE_NAME", "q1]"), ("COMMAND", "SCAN"),
#     ("TRANSITION", "(0,q1)"), ("DELIMITER", ","),
#     ("TRANSITION", "(1,q0)"), ("DELIMITER", ","),
#     ("TRANSITION", "(#,reject)")
# ]

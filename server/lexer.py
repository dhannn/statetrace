import re

# Define token types and patterns
TOKEN_PATTERNS = [
    ('DATA_SECTION', r'(\.DATA)\b'),
    ('LOGIC_SECTION', r'(\.LOGIC)\b'),
    ('STATE_NAME', r'\b\w+\]'), 
    ('MEMORY_TYPE', r'\b(STACK|QUEUE)\b'),
    ('COMMAND', r'\b(SCAN\s*(LEFT|RIGHT)?|PRINT|WRITE|READ)\b'),
    ('TRANSITION', r'\([\w#]+\s*,\s*[\w#]+\)'),
    ('COMMENT', r';\s*[ \S]+'),
    ('ARG', r'\([#\w]+\)'),
    ('MEMORY_NAME', r'[#\w]+'),
    ('DELIMITER', r'[,]'), 
]

# Compile regex patterns
TOKEN_REGEX = [(name, re.compile(pattern)) for name, pattern in TOKEN_PATTERNS]

def tokenize_line(line):
    tokens = []
    while line:
        line = line.strip()
        matched = False

        for token_type, pattern in TOKEN_REGEX:
            m = pattern.match(line)
            
            if m:
                tokens.append((token_type, m.group(0)))
                line = line[len(m.group(0)):]
                matched = True
                break
        if not matched:
            raise SyntaxError(f"Unexpected token: {line}")
        
    return tokens



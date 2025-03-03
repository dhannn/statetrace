from fastapi import FastAPI, HTTPException, WebSocket
import json
from loguru import logger
import asyncio

from lexer import *
from parser import *

app = FastAPI()

logger.add('server.log', rotation='10 MB', level='INFO')

async def load(websocket: WebSocket, input_string, machine_definition):
    tokens = []
    
    for line in machine_definition.splitlines():
        tokenized_line = tokenize_line(line)
        logger.info(f'Tokenizing machine definition: {tokenized_line}')
        tokens.extend(tokenized_line)
    
    parser = FSMParser(tokens)
    machine_definition = parser.parse()
    logger.info(f'Parsing tokens: {machine_definition}')
    machine = Machine(machine_definition)
    machine.set_input(input_string)

    stateSet = set()
    transitions = []
    for state in machine.states:
        stateSet.add(state)

        for transition in machine.states[state]['transitions']:
            next_state = machine.states[state]['transitions'][transition]
            stateSet.add(next_state)
            transitions.append({
                'source': state,
                'target': next_state
            })
    
    states = []
    for state in stateSet:
        s = {
            'id': state
        }

        if ss := machine.states.get(state, None):
            s['command'] = ss['command']
        
        states.append(s)

    memory_objects = [ {'id': name, 'type': machine.memory[name]['type']} for name in machine.memory ]

    x = json.dumps({
        'memory': memory_objects,
        'states': states,
        'transitions': transitions,
        'current-state': machine.state,
        'type': 'load'
    })

    logger.info(f'Machine successfully loaded')

    await websocket.send_text(x)
    
    return machine

async def run(websocket: WebSocket, machine: Machine):
    while machine.state != 'accept' and machine.state != 'reject':
        await asyncio.sleep(1)
        machine.next()
        memory_objects = [ {
            'id': name, 
            'type': machine.memory[name]['type'], 
            'content': machine.memory[name]['content'] 
        } for name in machine.memory ]
        x = json.dumps({
            'state': machine.state,
            'input-head': machine.tape_head,
            'current-state': machine.state,
            'memory': memory_objects,
            'type': 'run'
        })
        logger.info(f'Running machine: {x}')
        await websocket.send_text(x)


@app.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket):
    try:
        await websocket.accept()
        logger.info('Client connected to WebSocket')
        machine = None

        while True:
            response = json.loads((await websocket.receive())['text'])
            logger.info(f'Received input: { response }')

            res_type = response['type']
            if res_type == 'load':

                try:
                    input_string = response['input-string']
                    machine_definition = response['machine-definition']
                    machine = await load(websocket, input_string, machine_definition)
                except SyntaxError as e:
                    logger.error(e.msg)
                    x = json.dumps({
                        'type': 'error',
                        'error': e.msg
                    })
                    await websocket.send_text(x)

            elif res_type == 'run':
                await run(websocket, machine)
    except Exception as e:
        logger.error(f'Error connecting WebSockets: {e.msg}')
    finally:
        logger.warning('Client disconnected')

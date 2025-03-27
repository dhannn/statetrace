from fastapi import FastAPI, HTTPException, WebSocket
import json
from loguru import logger
import asyncio

from lexer import *
from parser import *
from utils import DequeEncoder

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


    x = json.dumps({
        'memory': machine.memory,
        'states': machine.get_states(),
        'active-states': json.dumps(machine.worklist, cls=DequeEncoder),
        'input-tape': machine.input_tape,
        'type': 'load'
    })

    logger.info(f'Machine successfully loaded')

    await websocket.send_text(x)
    
    return machine

async def run(websocket: WebSocket, machine: Machine):

    states = [ config[0] for config in machine.worklist ]

    while 'accept' not in states and 'reject' not in states and len(list(states)) > 0:
        await asyncio.sleep(1)
        machine.next()
        
        x = json.dumps({
            'active-states': json.dumps(list(machine.worklist)),
            'type': 'run'
        })
        
        logger.info(f'Running machine: {x}')
        states = [ config[0] for config in machine.worklist ]
        await websocket.send_text(x)

async def step(websocket: WebSocket, machine: Machine):

    states = [ config[0] for config in machine.worklist ]

    if 'accept' not in states and 'reject' not in states and len(list(states)) > 0:
        machine.next()

        logger.debug(json.dumps(list(machine.worklist)))
        
        x = json.dumps({
            'active-states': json.dumps(list(machine.worklist)),
            'type': 'step'
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

            elif res_type == 'step':
                await step(websocket, machine)
    except Exception as e:
        logger.error(f'Error connecting WebSockets: {e}')
    finally:
        logger.warning('Client disconnected')

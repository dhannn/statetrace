from fastapi import FastAPI, HTTPException, WebSocket
import json
import asyncio

from lexer import *
from parser import *

app = FastAPI()

async def load(websocket: WebSocket, input_string, machine_definition):
    tokens = []
    
    for line in machine_definition.splitlines():
        tokens.extend(tokenize_line(line))
    
    parser = FSMParser(tokens)
    machine_definition = parser.parse()
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
        await websocket.send_text(x)


@app.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    machine = None

    while True:
        response = json.loads((await websocket.receive())['text'])
        res_type = response['type']
        if res_type == 'load':

            try:
                input_string = response['input-string']
                machine_definition = response['machine-definition']
            except SyntaxError as e:
                await websocket.send_json(e)

            machine = await load(websocket, input_string, machine_definition)
        elif res_type == 'run':
            await run(websocket, machine)

        print(res_type, input_string, machine_definition)
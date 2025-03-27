import React, { useEffect, useState } from "react";
import StackComponent from "./StackComponent";
import QueueComponent from "./QueueComponent";
import TapeComponent from "./TapeComponent";

export default function MemoryPanel({ memory }) {
    
    const [ stacks, setStacks ] = useState([]);
    const [ queues, setQueues ] = useState([]);
    const [ tapes, setTapes ] = useState([]);
    const [ currentExecutionPath, setCurrentExecutionPath ] = useState(0);
    const [ executionPathSelect, setExecutionPathSelect ] = useState([]);

    useEffect(() => {

        const executionPaths = memory.map((mem, i) => {
            return <option key={i} value={i}>Execution Path: {i}</option>;
        });
        setExecutionPathSelect(executionPaths);
        
        let stack_info = [];
        let queue_info = [];
        let tape_info = [];
        
        for (const mem_name in memory[currentExecutionPath]) {
            const mem = memory[currentExecutionPath][mem_name];
            switch (mem.type) {
                case 'STACK':
                    stack_info.push({
                        'name': mem_name,
                        'content': mem.content
                    });
                    
                    break;
                case 'QUEUE':
                    queue_info.push({
                        'name': mem_name,
                        'content': mem.content
                    });
                    
                    break;
                case 'TAPE':
                    tape_info.push({
                        'name': mem_name,
                        'content': mem.content
                    });
                    
                    break;
            
                default:
                    break;
            }
        }

        setStacks(stack_info.map(s => <StackComponent key={s.name} name={s.name} content={s.content}/>));
        setQueues(queue_info.map(s => <QueueComponent key={s.name} name={s.name} content={s.content}/>));
        setTapes(tape_info.map(s => <TapeComponent key={s.name} name={s.name} content={s.content} />));
    }, [memory, currentExecutionPath]);

    return (
        <>
            <div className='memory-panel' style={{
                width: '30vw'
            }}>
                <h2>Memory</h2>
                {
                    memory.length === 0 || Object.keys(memory[0]).length === 0? 'You defined a simple finite state automaton.': 

                    <>
                        <select onChange={(e) => {
                            setCurrentExecutionPath(e.target.value);
                        }}>
                            {executionPathSelect}
                        </select>
                        <div style={{display: 'flex', justifyContent: 'space-evenly', flexDirection: 'column'}}>
                            {tapes}
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-evenly', flexDirection: 'column'}}>
                            {queues}
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
                            {stacks}
                        </div>
                    </>
                }
            </div>
        </>
    )
}

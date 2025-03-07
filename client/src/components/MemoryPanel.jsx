import React, { useEffect, useState } from "react";
import StackComponent from "./StackComponent";

export default function MemoryPanel({ memory }) {
    
    const [ stacks, setStacks ] = useState([]);
    const [ currentExecutionPath, setCurrentExecutionPath ] = useState(0);
    const [ executionPathSelect, setExecutionPathSelect ] = useState([]);

    useEffect(() => {
        const executionPaths = memory.map((mem, i) => {
            return <option key={i} value={i}>Execution Path: {i}</option>;
        });

        const _stacks = memory[currentExecutionPath]['STACK'].map(s => {
            return <StackComponent name={s.name} content={s.content}/>;
        });
        console.log(memory[currentExecutionPath]['STACK']);
        
        setStacks(_stacks);
        setExecutionPathSelect(executionPaths)
    }, [memory, currentExecutionPath])

    return (
        <>
            <div className='memory-panel'>
                <h2>Memory</h2>
                {
                    memory.length === 0? 'You defined a simple finite state automaton.': 
                    <>
                        <select>
                            {executionPathSelect}
                        </select>
                        <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
                            {stacks}
                        </div>
                    </>
                }
            </div>
        </>
    )
}

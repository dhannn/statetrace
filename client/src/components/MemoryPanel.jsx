import React, { useEffect, useState } from "react";
import StackComponent from "./StackComponent";

export default function MemoryPanel({ memory }) {
    
    const [ stacks, setStacks ] = useState([]);

    useEffect(() => {
        let stacks = memory.filter(mem => mem.type === 'STACK');
        const stackComponents = stacks.map(
            s => <StackComponent name={s.id} content={s.content}/>)
        setStacks(stackComponents)
    }, [memory])

    return (
        <div className='memory-panel'>
            <h2>Memory</h2>
            {
                memory.length === 0? 'You defined a simple finite state automaton.': 
                <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
                    {stacks}
                </div>
            }
        </div>
    )
}

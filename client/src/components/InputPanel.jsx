import React, { useState } from "react";

export default function InputPanel(props) {
    const { onLoad, onRun, onStep } = props;

    const [ inputString, setInputString ] = useState('');
    const [ machineDefinition, setMachineDefinition ] = useState('');


    return <div className='input-panel'>
        <h1>StateTrace</h1>
        <h2>Input String</h2>
        <input onInput={(e) => {
            setInputString(e.target.value);
            
        }}/>
        <h2>Machine Definition</h2>
        <textarea onInput={(e) => {
            setMachineDefinition(e.target.value);
        }}/>

        <div className='control-panel'>
            <button onClick={ () => onLoad(inputString, machineDefinition) }>Load</button>
            <button onClick={ () => onRun() }>Run</button>
            <button>Step</button>
        </div>
    </div>;
}

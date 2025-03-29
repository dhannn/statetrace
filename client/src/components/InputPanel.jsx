import React, { useState } from "react";
import MachineEditor from "../utils/SyntaxHighlighting";

export default function InputPanel(props) {
    const { onLoad, onRun, onStep } = props;

    const [ inputString, setInputString ] = useState('');
    const [ machineDefinition, setMachineDefinition ] = useState('');

    return <div className='input-panel'>
        <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            gap: '2px'
        }}>
            <img src="logo.svg" style={{
                width: '30%',
            }}/>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                gap: '0px',
                justifyContent: 'center'
            }}>
                <h1 style={{
                    fontSize: '2.6rem',
                    padding: '0px',
                    margin: '0px'
                }}>StateTrace</h1>
                <p style={{
                    fontSize: '0.9rem',
                    fontWeight: '300',
                    padding: '0px',
                    margin: '0px'
                }}>An Abstract Machine Simulator</p>
            </div>
        </div>
        <h2>Input String</h2>
        <input onInput={(e) => {
            setInputString(e.target.value);
            
        }}/>
        <h2>Machine Definition</h2>
        <MachineEditor value={ machineDefinition } onChange={(m_def) => {
            setMachineDefinition(m_def);
        }}/>

        <div className='control-panel'>
            <button onClick={ () => onLoad(inputString, machineDefinition) }>Load</button>
            <button onClick={ () => onRun() }>Run</button>
            <button onClick={ () => onStep() }>Step</button>
        </div>
    </div>;
}

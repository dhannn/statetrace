import { useEffect, useState } from 'react';
import './App.css';
import InputPanel from './components/InputPanel';
import useWebSocket from "react-use-websocket";
import StateDiagram from './components/StateDiagram';
import StandardInput from './components/StandardInput';

function App() {

  const { sendMessage, lastMessage } = useWebSocket("ws://localhost:8000/ws", {
    shouldReconnect: () => true,
  });

  const [ states, setStates ] = useState([]);
  const [ transitions, setTransitions ] = useState([]);
  const [ inputString, setInputString ] = useState('');
  const [ tapeHead, setTapeHead ] = useState(0);
  const [ currentState, setCurrentState ] = useState();

  useEffect(() => {
    if (lastMessage) {      
      const data = JSON.parse(lastMessage.data);
      
      switch (data.type) {
        case 'load':
          setStates(data.states);
          setTransitions(data.transitions);
          setTapeHead(0);
          setCurrentState(data['current-state']);
          
          break;
        
        case 'run':
          setTapeHead(data['input-head']);
          setCurrentState(data['current-state']);
          break;
          
        default:
          break;
      }
    }
  }, [lastMessage])
  
  const onLoad = (inputString, machineDefinition) => {
    const mess = JSON.stringify({
      'type': 'load',
      'input-string': inputString,
      'machine-definition': machineDefinition
    });
    sendMessage(mess);
    setInputString('#' + inputString + '#');
  };
  
  const onRun = () => {
    sendMessage(JSON.stringify({
      'type': 'run'
    }));
  }

  return (
    <>
      <h1>StateTrace</h1>
      <StandardInput inputString={ inputString } tapeHead={tapeHead}/>
      <div className='machine-panel'>
        <InputPanel onLoad={ onLoad } onRun={ onRun }/>
        <StateDiagram states={states} transitions={transitions} currentState={currentState}/>
      </div>
    </>
  )
}

export default App

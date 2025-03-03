import { useEffect, useState } from 'react';
import './App.css';
import InputPanel from './components/InputPanel';
import useWebSocket from "react-use-websocket";
import StateDiagram from './components/StateDiagram';
import StandardInput from './components/StandardInput';
import MemoryPanel from './components/MemoryPanel';
import ErrorModal from './components/ErrorModal';
import Modal from './components/Modal';

function App() {

  const { sendMessage, lastMessage } = useWebSocket("ws://localhost:8000/ws", {
    shouldReconnect: () => true,
  });

  const [ states, setStates ] = useState([]);
  const [ transitions, setTransitions ] = useState([]);
  const [ inputString, setInputString ] = useState('');
  const [ tapeHead, setTapeHead ] = useState(0);
  const [ currentState, setCurrentState ] = useState();
  const [ memoryObjects, setMemoryObjects ] = useState([]);
  const [ error, setError ] = useState('');
  const [ isInitialized, setIsInitialized ] = useState(false);

  useEffect(() => {
    if (lastMessage) {      
      const data = JSON.parse(lastMessage.data);
      
      switch (data.type) {
        case 'load':
          setStates(data.states);
          setTransitions(data.transitions);
          setTapeHead(0);
          setCurrentState(data['current-state']);
          setIsInitialized(true);
          setMemoryObjects(data['memory'])
          setError('')
          break;
          
        case 'run':
          setError('')
          setTapeHead(data['input-head']);
          setCurrentState(data['current-state']);
          setMemoryObjects(data['memory'])
          break;
        
        case 'error':
          setError(data['error'])
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
      { error !== '' && <ErrorModal error={error} /> }
      { currentState === null && <Modal msg='Cannot find next state. String rejected!'/> }
      <InputPanel onLoad={ onLoad } onRun={ onRun }/>
      { !isInitialized? <div style={{width: '60vw', marginTop: '15vh'}}>
          <h2>Simulate an abstract machine!</h2>
        <p>Simply define the machine and test it on an input string.</p>
        </div>: <>
      
        <div className='middle-panel'>
          <StandardInput inputString={ inputString } tapeHead={tapeHead}/>
          <StateDiagram states={states} transitions={transitions} currentState={currentState}/>
        </div>
        
        <MemoryPanel memory={memoryObjects}/>
      </>
      }
    </>
  )
}

export default App

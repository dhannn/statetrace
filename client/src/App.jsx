import { useEffect, useState } from 'react';
import './App.css';
import InputPanel from './components/InputPanel';
import useWebSocket from "react-use-websocket";
import StateDiagram from './components/StateDiagram';
import StandardInput from './components/StandardInput';
import MemoryPanel from './components/MemoryPanel';
import ErrorModal from './components/ErrorModal';
import Modal from './components/Modal';
import StandardOutput from './components/StandardOutput';

function App() {

  const { sendMessage, lastMessage } = useWebSocket("ws://localhost:8000/ws", {
    shouldReconnect: () => true,
  });

  const [ states, setStates ] = useState({});
  const [ inputString, setInputString ] = useState('');
  const [ head, setHead ] = useState([0]);
  const [ initialState, setInitialState ] = useState();
  const [ activeStates, setActiveStates ] = useState([]);
  const [ memoryObjects, setMemoryObjects ] = useState([]);
  const [ inputTape, setInputTape ] = useState(false);
  const [ outputString, setOutputString ] = useState(false);
  const [ error, setError ] = useState('');
  const [ isInitialized, setIsInitialized ] = useState(false);

  useEffect(() => {
    if (lastMessage) {      
      const data = JSON.parse(lastMessage.data);
      
      switch (data.type) {
        case 'load': {

          const activeConfigs = JSON.parse(data['active-states']);
          const activeStates = activeConfigs.map((x) => {
            return x[0];
          });
          setStates(data.states);
          setInputTape(data['input-tape']);
          
          setInitialState(activeStates[0])
          
          setActiveStates(activeStates)
          const activeHeads = activeConfigs.map((x) => {
            return x[2];
          });
          setHead(activeHeads);
          const activeMemoryObjects = activeConfigs.map((x) => {
            setOutputString(undefined);
            return x[1];
          });
          setMemoryObjects(activeMemoryObjects);
          console.log('Memory Objects', memoryObjects);
          

          setError('');
          setIsInitialized(true);
                    
          break;

        }
          
        case 'run': 
        case 'step': {
          const activeConfigs = JSON.parse(data['active-states']);
          const activeStates = activeConfigs.map((x) => {
            return x[0];
          });
          setActiveStates(activeStates);
          const activeMemoryObjects = activeConfigs.map((x) => {
            if (x[1]['stdout']) {
              setOutputString(x[1]['stdout']);
            }
            return x[1];
          });
          const activeHeads = activeConfigs.map((x) => {
            return x[2];
          });
          setHead(activeHeads);
          setMemoryObjects(activeMemoryObjects);
          
          
          break;
        }
        
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
  
  const onStep = () => {
    sendMessage(JSON.stringify({
      'type': 'step'
    }));
  }

  return (
    <>
      { error !== '' && <ErrorModal error={error} /> }
      { activeStates.length === 0 && isInitialized && <Modal msg='Cannot find next state. String rejected!'/> }
      <InputPanel onLoad={ onLoad } onRun={ onRun } onStep={onStep}/>
      { !isInitialized? <div style={{width: '60vw', marginTop: '15vh'}}>
          <h2>Simulate an abstract machine!</h2>
        <p>Simply define the machine and test it on an input string.</p>
        </div>: <>
      
        <div className='middle-panel' style={{overflow: 'scroll'}}>
        { !inputTape && <StandardInput inputString={ inputString } tapeHead={head}/> }
        { outputString && <StandardOutput outputString= {outputString}/>}
          <StateDiagram states={states} activeStates={activeStates} initialState={initialState}/>
        </div>
        
        { isInitialized && <MemoryPanel memory={memoryObjects} />}
      </>
      }
    </>
  )
}

export default App

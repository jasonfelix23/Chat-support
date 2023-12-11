import { useState, useEffect, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { langs } from '@uiw/codemirror-extensions-langs';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { basicLight } from '@uiw/codemirror-theme-basic';
import { play } from '../../assets';
import axios from 'axios';

const CodeEditor = ({ socket }) => {
  const [value, setValue] = useState(`print('Hello world!');`);
  const [output, setOutput] = useState('');
  const [userHasControl, setUserHasControl] = useState(false);
  const [controlUser, setControlUser] = useState('Nobody');

  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [token, setToken] = useState('');

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
    socket.emit('language-change', { language: event.target.value });
  };

  const handleSave = () => {
    socket.emit('saveCode', { code: value });
  };

  const takeControl = () => {
    socket.emit('take-control');
  };

  const releaseControl = () => {
    socket.emit('release-control');
  };

  const onChangeCode = useCallback((value, viewUpdate) => {
    setValue(value);
    console.log('value:', value);
  }, []);

  const authenticate = async () => {
    try {
      const authResponse = await axios.post('https://api.jdoodle.com/v1/auth-token', {
        clientId: '924b1ec66dc85ff8c43ab04a2552cac2',
        clientSecret: '368d2284939c5ec10f2c236abc31b299d4aa3f57bc076f8a127f78d3638ba046',
      },
      {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
      },
    }
      );

      const token = authResponse.data.token;
      //print('Token:', token);
      setToken(token);
    } catch (err) {
      console.error('Error authenticating!', err);
    }
    console.log('Token:', token);
  };

  const executeCode = async () => {
    try {
    //   if (!token) {
    //     // Authenticate if token is not available
    //     await authenticate();
    //   }

      const payload = {
        script: value,
        language: selectedLanguage,
        versionIndex: '0',
      }

      const res = await fetch('http://127.0.0.1:5000/execute', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            },
        });
        const data = await res.json();

    //   const res = await axios.post("https://api.jdoodle.com/v1/execute",
    //     payload,
    //     {
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Access-Control-Allow-Origin': '*',
    //         },
    //     }
    //   );
      console.log('Response:', data);

      if (data.error) {
        setOutput(data.error);
      } else {
        socket.emit('code-executed', { output: data.output });
      }
    } catch (err) {
      console.error('Error executing code!', err);
      if (err.response && err.response.data && err.response.data.error) {
        setOutput(err.response.data.error);
      } else {
        console.error('Error while executing code!', err);
        setOutput('Error in the code!');
      }
    }
  };

  let languageSelection;

  if (selectedLanguage === 'python') {
    languageSelection = python();
  }

  if (selectedLanguage === 'javascript') {
    languageSelection = javascript();
  }

  // Client side
  useEffect(() => {
    if (socket) {
      socket.on('updateCode', ({ userId, code }) => {
        if (userId !== socket.id) {
          setValue(code);
        }
      });

      socket.on('language-change', ({ userId, language }) => {
        if (userId !== socket.id) {
          setSelectedLanguage(language);
        }
      });

      socket.on('control-change', ({ controlUser }) => {
        setControlUser(controlUser.name);
        setUserHasControl(socket.id === controlUser.id);
      });
    }
  }, [socket]);

//   useEffect(() => {
//     // Authenticate on component mount
//     authenticate();
//   }, []);

  return (
    <div className='grid grid-rows-5 gap-4 h-full w-full box-border'>
      <div className='row-span-4 flex flex-col w-full h-full overflow-auto '>
        <div style={{ maxWidth: '100%', width: '100%' }}>
          <CodeMirror
            value={value}
            height='400px'
            width='100%'
            theme={basicLight}
            extensions={languageSelection}
            onChange={onChangeCode}
          />
        </div>
        <div className='col-span-5 flex p-2 justify-between bg-slate-200'>
          <div className='col-span-1'>
            <select
              className='bg-gray-400 hover:bg-gray-500 rounded-lg p-4'
              value={selectedLanguage}
              onChange={handleLanguageChange}
            >
              <option value='python'>Python</option>
              <option value='javascript'>JavaScript</option>
            </select>
          </div>
          {userHasControl ? (
            <button onClick={releaseControl} className='col-span-1'>
              Release control
            </button>
          ) : null}
          {controlUser === 'Nobody' ? (
            <button onClick={takeControl} className='col-span-1'>
              Take control
            </button>
          ) : null}
          <p>{userHasControl ? 'You have control' : `${controlUser} has control`}</p>
          <button className='col-span-1 bg-gray-400 hover:bg-gray-500' onClick={handleSave}>
            Save
          </button>
          <button onClick={executeCode}>
            <img src={play} className='w-4' alt='Run' />
          </button>
        </div>
      </div>
      <div className='row-span-1 p-4 flex flex-col items-center justify-center bg-black'>
        <h1 className='text-gray-600'>Output</h1>
        <div className='text-gray-400'>{output}</div>
      </div>
    </div>
  );
};

export default CodeEditor;

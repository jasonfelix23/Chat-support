import { useState, useEffect, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { basicLight } from '@uiw/codemirror-theme-basic';
import { play } from '../../assets';
import axios from 'axios';

const CodeEditor = ({ socket }) => {
  const [value, setValue] = useState(`print('Hello world!');`);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [userHasControl, setUserHasControl] = useState(false);
  const [controlUser, setControlUser] = useState('Nobody');
  const [isPlayButtonPressed, setIsPlayButtonPressed] = useState(false);


  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [apiKey, setApiKey] = useState('YOUR_RAPIDAPI_KEY'); // Replace with your RapidAPI key

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

  const onChangeCode = useCallback((value) => {
    setValue(value);
  }, []);

  const executeCode = async () => {
    try {
    //   const payload = {
    //     langEnum: [
    //       'python',
    //       'javascript',
    //       // Add other languages as needed
    //     ],
    //     lang: selectedLanguage.toLowerCase(),
    //     code,
    //     input: '',
    //   };

    setIsPlayButtonPressed(true);

      const response = await axios.post('https://code-compiler10.p.rapidapi.com/', {
        langEnum: [
            'python',
            'javascript',
        ],
        lang: selectedLanguage.toLowerCase(),
        code: value,
        input: '',
    }, {
        headers: {
        'content-type': 'application/json',
          'Content-Type': 'application/json',
          'x-compile': 'rapidapi',
          'X-RapidAPI-Key': '21f64d709emshbabcd9e32de3870p14993fjsndefaa0fbccbf',
          'X-RapidAPI-Host': 'code-compiler10.p.rapidapi.com',
        },
      });

      console.log('Response:', response.data);
      if (response.data.output) {
        setOutput(response.data.output);
      } else {
        // Handle cases where the output is not present in the response
        setOutput('No output received.');
      }

      if (response.data.error) {
        setOutput(response.data.error);
      } else {
        socket.emit('code-executed', { output: response.data.result });
      }
    } catch (error) {
      console.error('Error executing code!', error);
      setOutput('Error in the code!');
    } finally {
        setIsPlayButtonPressed(false);
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

/*return (
    <div className='grid grid-rows-5 gap-4 h-full w-full box-border'>
      <div className='row-span-4 flex flex-col w-full h-full overflow-auto'>
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
        {isPlayButtonPressed ? null : <h1 className='text-gray-600'>Output</h1>}
        <div className='text-gray-400'>{output}</div>
      </div>
    </div>
  );
};*/

// /**return (
//     <div className='grid grid-rows-5 gap-4 h-full w-full box-border'>
//       <div className='row-span-4 flex flex-col w-full h-full overflow-auto'>
//         <div style={{ maxWidth: '100%', width: '100%' }}>
//           {/* CodeMirror and other UI elements */}
//         /*</div>
//         <div className='col-span-5 flex p-2 justify-between bg-slate-200'>
//           {/* Language selection and control buttons */}
//         </div>
//       </div>
//       <div className='row-span-1 p-4 flex flex-col items-center justify-center bg-black'>
//         <h1 className='text-gray-600'>Output</h1>
//         <div className='text-gray-400'>{output}</div>
//       </div>
//       {isPlayButtonPressed && (
//         <div className='absolute inset-0 flex items-center justify-center'>
//           <div className='bg-white p-4 rounded'>
//             <p className='text-gray-600'>Executing code...</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };**/

return (
    <div className='grid grid-rows-5 gap-4 h-full w-full box-border'>
      <div className='row-span-4 flex flex-col w-full h-full overflow-auto relative'>
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
        {isPlayButtonPressed && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='bg-white p-4 rounded'>
              <p className='text-gray-600'>Executing code...</p>
            </div>
          </div>
        )}
      </div>
      <div className='row-span-1 p-4 flex flex-col items-center justify-center bg-black'>
        <div className='text-gray-600'>Output</div>
        <div className='text-gray-400'>{output}</div>
      </div>
    </div>
  );
  
};
export default CodeEditor;

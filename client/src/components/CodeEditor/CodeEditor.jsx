import { useState, useEffect, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { basicLight } from '@uiw/codemirror-theme-basic';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { play, download } from '../../assets';
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
          'x-compile': 'rapidapi',
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': '9f5179372dmsh327130fbd829303p1a50b3jsn63212679421a',
          'X-RapidAPI-Host': 'code-compiler10.p.rapidapi.com'
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

  // const saveCodeAsPDF = async () => {
  //   try {
  //     const response = await axios.post('http://localhost:5000/saveCodeAsPDF', { code: value });

  //     if (response.data.success) {
  //       const url = response.data.url;

  //       // Create a temporary link element
  //       const link = document.createElement('a');
  //       link.href = url;
  //       link.target = '_blank';
  //       link.download = 'code_output.pdf';

  //       // Append the link to the body
  //       document.body.appendChild(link);

  //       // Trigger a click event to initiate the download
  //       link.click();

  //       // Remove the link from the body
  //       document.body.removeChild(link);
  //     } else {
  //       console.error('Server error:', response.data.error);
  //     }
  //   } catch (error) {
  //     console.error('Error saving code as PDF:', error);
  //   }
  // };

  const saveCodeAsPDF = async () => {
    try {
      const response = await axios.post('http://localhost:5000/saveCodeAsPDF', { code: value });

      if (response.data.success) {
        const url = response.data.url;
        const pdfBuffer = response.data.pdfBuffer;

        // Create a temporary link element
        const link = document.createElement('a');

        // If the PDF buffer is available, create a Blob and use it as a data URL
        if (pdfBuffer) {
          const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
          const dataUrl = URL.createObjectURL(blob);
          link.href = dataUrl;
        } else {
          // If the PDF buffer is not available, use the signed URL directly
          link.href = url;
        }

        link.target = '_blank';
        link.download = 'code_output.pdf';

        // Append the link to the body
        document.body.appendChild(link);

        // Trigger a click event to initiate the download
        link.click();

        // Remove the link from the body
        document.body.removeChild(link);
      } else {
        console.error('Server error:', response.data.error);
      }
    } catch (error) {
      console.error('Error saving code as PDF:', error);
    }
  };

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

  let statusBarClass = `col-span-6 flex p-6 justify-between gap-3 bg-neutral-900 text-gray-400`
  if (userHasControl) {
    statusBarClass = `col-span-6 flex p-2 justify-between bg-slate-200 text-gray-600`
  }

  return (
    <div className='grid grid-rows-6 gap-4 h-full w-full box-border'>
      <div className='row-span-4 flex flex-col w-full h-full overflow-auto relative'>
        <div style={{ maxWidth: '100%', width: '100%' }}>
          <CodeMirror
            value={value}
            height='400px'
            width='100%'
            theme={userHasControl ? basicLight : dracula}
            readOnly={!userHasControl}
            extensions={languageSelection}
            onChange={onChangeCode}
          />
        </div>
        <div className={statusBarClass}>
          {userHasControl ?
            <div className='col-span-1'>
              {/* Dropdown button */}
              <select
                className='bg-gray-400 hover:bg-gray-500 rounded-lg p-4'
                value={selectedLanguage}
                onChange={handleLanguageChange}
              >
                <option value='python'>Python</option>
                <option value='javascript'>JavaScript</option>
              </select>
            </div> : null}
          {userHasControl ? (
            <button onClick={releaseControl} className='col-span-1 bg-gray-400 hover:bg-gray-500'>Release control</button>)
            : null}
          {controlUser === 'Nobody' ? (
            <button onClick={takeControl} className='col-span-1 bg-neutral-800 hover:bg-neautral-900 text-gray-400'>Take control</button>)
            : null}
          <p>{userHasControl ? 'You have control' : `${controlUser} has control`}</p>
          {userHasControl ? (<button className='col-span-1 bg-gray-400 hover:bg-gray-500' onClick={handleSave}>
            Save
          </button>) : null}

          {userHasControl ? <button onClick={saveCodeAsPDF} className="col-span-1 bg-gray-400 hover:bg-gray-500">
            <img src={download} alt="Download PDF" className="w-4" />
          </button> : <button onClick={saveCodeAsPDF} className="col-span-1 bg-neutral-800 hover:bg-neautral-900">
            <img src={download} alt="Download PDF" className="w-4" />
          </button>}

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
      <div className='row-span-1 p-4 flex flex-col items-start  bg-black'>
        <div className='text-gray-600'>Output</div>
        <div className='text-gray-400'>{output}</div>
      </div>
    </div>
  );

};
export default CodeEditor;

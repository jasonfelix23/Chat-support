import { useState, useEffect, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript'
import { langs } from '@uiw/codemirror-extensions-langs';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { basicLight } from '@uiw/codemirror-theme-basic'
import { play } from '../../assets'

const CodeEditor = ({ socket }) => {
    const [value, setValue] = useState("print('hello world!');");
    const [userHasControl, setUserHasControl] = useState(false);
    const [controlUser, setControlUser] = useState('Nobody');

    const [selectedLanguage, setSelectedLanguage] = useState('python');

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
                // console.log(code);
                // Update the code editor if the code is from another user
                if (userId !== socket.id) {
                    setValue(code);
                }
            });

            socket.on('language-change', ({ userId, language }) => {
                // console.log(language, "selected");
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
                        {/* Dropdown button */}
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
                        <button onClick={releaseControl} className='col-span-1'>Release control</button>
                    ) : null}
                    {controlUser === 'Nobody' ? (
                        <button onClick={takeControl} className='col-span-1'>Take control</button>
                    ) : null}
                    <p>{userHasControl ? 'You have control' : `${controlUser} has control`}</p>
                    <button className='col-span-1 bg-gray-400 hover:bg-gray-500'
                        onClick={handleSave}>
                        Save
                    </button>
                    <button className='col-span-1 bg-gray-500 '>
                        <img src={play} className='w-4' /></button>
                </div>
            </div>
            <div className='row-span-1 p-4 flex flex-col items-center justify-center bg-black'>
                <h1 className='text-gray-600'>Output</h1>
            </div>
        </div>
    )
}

export default CodeEditor;

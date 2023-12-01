import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router';
import queryString from 'query-string';
import socketIOClient from 'socket.io-client';
import './Chat.css'

import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import Messages from '../Messages/Messages';
import CanvasDraw from '../CanvasDraw/CanvasDraw';

let socket;
const ENDPOINT = 'http://127.0.0.1:5000';

const Chat = () => {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const location = useLocation();

    //function for sending messages
    const sendMessage = (e) => {
        e.preventDefault();
        if (message) {
            socket.emit('sendMessage', message, () => setMessage(''));
        }
    }

    useEffect(() => {
        if (!socket) {
            const { name, room } = queryString.parse(location.search);
            socket = socketIOClient.connect(ENDPOINT);

            setName(name);
            setRoom(room);

            socket.emit("join", { name, room }, (error) => {
                if (error) {
                    alert(error);
                }
            });

            socket.on('message', (message) => {
                setMessages(messages => [...messages, message]);
            });
        }
    }, [location.search]);


    console.log(message, messages);



    return (
        <div className='grid grid-cols-2 gap-4 h-screen w-screen box-border outerContainer'>
            <div className='col-span-1/2  bg-gray-200 p-4 flex flex-col items-center justify-center'>
                <h1 className='text-gray-600'>Code Editor</h1>
                <p className='text-gray-400 font-light'>Coming out soon</p>
            </div>
            <div className='col-span-1/2 grid grid-rows-2 gap-4'>

                <div className='row-span-1 p-4 '>
                    <div className='container'>
                        <InfoBar room={room} />
                        <Messages messages={messages} name={name} />
                        <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
                    </div>
                </div>
                <div className='row-span-1'>
                    <CanvasDraw />
                </div>
            </div>
        </div>

    )
}

export default Chat
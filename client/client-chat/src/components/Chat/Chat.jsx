import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router';
import queryString from 'query-string';
import socketIOClient from 'socket.io-client';
import './Chat.css'

import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import Messages from '../Messages/Messages';

let socket;
const ENDPOINT = 'http://127.0.0.1:5000';

const Chat = () => {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const location = useLocation();

    // useEffect(() => {
    //     if (!socket) {

    //         const { name, room } = queryString.parse(location.search);
    //         socket = socketIOClient.connect(ENDPOINT);

    //         setName(name);
    //         setRoom(room);

    //         socket.emit("join", { name, room }, (error) => {
    //             if (error) {
    //                 alert(error);
    //             }
    //         });

    //     }

    // }, [location.search]);


    // useEffect(() => {
    //     socket.on('message', (message) => {
    //         setMessages(messages => [...messages, message]);
    //     })
    // }, []);

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
        <div className='outerContainer'>
            <div className='container'>
                <InfoBar room={room} />
                <Messages messages={messages} name={name} />
                <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
            </div>
        </div>
    )
}

export default Chat
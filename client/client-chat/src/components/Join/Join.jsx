import { useState } from 'react';
import { useNavigate } from "react-router-dom";

const ENDPOINT = 'http://127.0.0.1:5000';

export default function SignIn() {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();

        if (!name || !room) return;

        //make a request to the backend to check if the room exists
        try {
            const response = await fetch(`${ENDPOINT}/joinRoom`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    room: room,
                    password: password,
                }),
            });

            if (!response.ok) {
                // Handle server error or show an error message
                console.error('Error Joining room:', response.statusText);
                return;
            }

            // Room Joined successfully, you can handle the response as needed
            const result = await response.json();
            console.log('Room Joined:', result);
            navigate(`/chat?name=${name}&room=${room}`);
        } catch (error) {
            console.error('Error Joining room:', error);
        }
    }

    return (
        <div>
            <div>
                <input placeholder="Name" className="joinInput" type="text" onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
                <input placeholder="Room" className="joinInput mt-20" type="text" onChange={(e) => setRoom(e.target.value)} />
            </div>
            <div>
                <input placeholder="Password" className="joinInput mt-20" type="password" onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button className={'button mt-20'} type="submit" onClick={handleSignIn}>Sign In</button>
        </div>
    );
}
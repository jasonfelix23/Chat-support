import { useState } from 'react';
import { Link } from "react-router-dom";

const CreateRoom = () => {
    const [room, setRoom] = useState('');
    const [password, setPassword] = useState('');

    const handleCreate = async (e) => {
        e.preventDefault();
        console.log(`No request to server, just checking ${room} name and ${password}`);

        if (!password) {
            // Handle validation or show an error message
            return;
        }

        try {
            // Send a POST request to the server to create a room
            const response = await fetch('http://127.0.0.1:5000/createRoom', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    room: room,
                    password: password,
                }),
            });

            if (!response.ok) {
                // Handle server error or show an error message
                console.error('Error creating room:', response.statusText);
                return;
            }

            // Room created successfully, you can handle the response as needed
            const result = await response.json();
            console.log('Room created:', result);

            // Redirect or perform any other actions after room creation
            // For example, navigate to the chat page with the new room
            // navigate(`/chat?name=${name}&room=${result.roomName}`);
        } catch (error) {
            console.error('Error creating room:', error);
        }
    };
    return (
        <div>
            <div>
                <input placeholder="Room" className="joinInput" type="text" onChange={(event) => setRoom(event.target.value)} />
            </div>
            <div>
                <input
                    placeholder="Password"
                    className="joinInput mt-20"
                    type="password"
                    onChange={(event) => setPassword(event.target.value)}
                />
            </div>
            <Link onClick={handleCreate} to={`/`}>
                <button className={'button mt-20'} type="submit">
                    Create
                </button>
            </Link>
        </div>
    )
}

export default CreateRoom
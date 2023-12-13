import { useState } from 'react';
import { Link , useNavigate} from "react-router-dom";


const CreateRoom = () => {
    const [room, setRoom] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
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
            // setTimeout(() => {
            //     navigate('../Join/Join.jsx');
            // }, 1000);
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
                    className="joinInput mt-10"
                    type="password"
                    onChange={(event) => setPassword(event.target.value)}
                />
            </div>
            <Link onClick={handleCreate} to={`/`}>
                <button className='bg-white hover:bg-gray-300 text-gray-600 font-semibold py-4 px-8  mt-10 border border-gray-400 rounded shadow'
                    type="submit"
                     onClick={handleCreate}>
                    Create
                </button>
            </Link>
        </div>
    )
}

export default CreateRoom
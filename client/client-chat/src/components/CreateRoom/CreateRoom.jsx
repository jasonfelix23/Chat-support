import React from 'react'

const CreateRoom = () => {
    return (
        <div>
            <div>
                <input placeholder="Name" className="joinInput" type="text" onChange={(event) => setName(event.target.value)} />
            </div>
            <div>
                <label>Password:</label>
                <input
                    placeholder="Password"
                    className="joinInput mt-20"
                    type="password"
                    onChange={(event) => setPassword(event.target.value)}
                />
            </div>
            <Link onClick={handleCreate} to={`/chat?name=${name}&password=${password}`}>
                <button className={'button mt-20'} type="submit">
                    Create
                </button>
            </Link></div>
    )
}

export default CreateRoom
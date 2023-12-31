const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing

const Room = require('./models/Room');

router.get('/', (req, res) => {
    res.send('server is up and running');
})

// Create room route
router.post('/createRoom', async (req, res) => {
    console.log("Here on route /createRoom");
    const { room, password } = req.body;

    // Validate input
    if (!room || !password) {
        return res.status(400).json({ error: 'Room and password are required' });
    }

    try {
        // Check if the room already exists
        const existingRoom = await Room.findOne({ name: room });
        if (existingRoom) {
            return res.status(400).json({ error: 'Room already exists' });
        }

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new room
        const newRoom = new Room({
            name: room,
            password: hashedPassword,
        });

        // Save the room to the database
        await newRoom.save();

        res.status(201).json({ roomName: newRoom.name });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Join room route
router.post('/joinRoom', async (req, res) => {
    const { name, room, password } = req.body;

    // Validate input
    if (!name || !room || !password) {
        return res.status(400).json({ error: 'Name, room, and password are required' });
    }

    try {
        // Find the room in the database
        const existingRoom = await Room.findOne({ name: room });

        // If the room doesn't exist, return an error
        if (!existingRoom) {
            return res.status(400).json({ error: 'Room does not exist' });
        }

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, existingRoom.password);

        if (passwordMatch) {
            // Password is correct, you can proceed with joining the room
            res.status(200).json({ message: 'Joined successfully' });
        } else {
            // Password is incorrect
            res.status(401).json({ error: 'Incorrect password' });
        }
    } catch (error) {
        console.error('Error joining room:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router
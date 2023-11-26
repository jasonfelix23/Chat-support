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

module.exports = router
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const upload = multer();
// const fs = require('fs');
// const functions = require('firebase-functions');
// const admin = require('firebase-admin');
// const serviceAccount = require('./Credentials.json');
// const path = require('path');
// const os = require('os');
// const bodyParser = require('body-parser');
// const pdf = require('html-pdf');
const { jsPDF } = require("jspdf");

const Room = require('./models/Room');
// const multerStorage = multer.memoryStorage();
const storage = new Storage({
    projectId: 'credentials.project_id',
    keyFilename: './Credentials.json',
    bucket: 'screenshots_canvas',
});

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


router.post('/execute', async (req, res) => {
    console.log("Here on route /execute");

    const { script, language, versionIndex } = req.body;

    const response = await fetch('https://api.jdoodle.com/v1/execute', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            clientId: "924b1ec66dc85ff8c43ab04a2552cac2",
            clientSecret: "8272743fc24e4848176e8fb0c248ccdeb9ead082c2c95ac586cd373773b29c3b",
            script: script,
            language: language,
            versionIndex: "1"
        }),
    });

    const data = await response.json();
    console.log(data);
    res.send(data);
});

// router.post('/saveCodeAsPDF', async (req, res) => {
//     try {
//         const { code } = req.body;

//         //const pdfDoc = await PDFDocument.create();
//         const pdfDoc = await pdf.create();
//         const page = pdfDoc.addPage();
//         const { height } = page.getSize();

//         page.drawText(code, {
//             x: 50,
//             y: height - 100,
//         });

//         const pdfBytes = await pdfDoc.save();

//         const fileName = `code_${Date.now()}.pdf`;
//         const bucket = storage.bucket('screenshots_canvas');
//         const file = bucket.file(fileName);

//         // Create a writable stream and pipe the PDF data to it
//         const writeStream = file.createWriteStream({
//             metadata: {
//                 contentType: 'application/pdf',
//             },
//         });

//         writeStream.on('error', (err) => {
//             console.error('Error writing PDF to Google Cloud Storage:', err);
//             res.status(500).json({ success: false, error: 'Internal Server Error' });
//         });

//         writeStream.on('finish', async () => {
//             console.log(`PDF saved to Google Cloud Storage: ${fileName}`);

//             // Get a signed URL for the client to download the PDF
//             const [url] = await file.getSignedUrl({
//                 action: 'read',
//                 expires: Date.now() + 15 * 60 * 1000, // 15 minutes
//             });

//             // Respond to the client with the signed URL
//             res.status(200).json({ success: true, url });
//         });

//         // Pipe the PDF data to the writable stream
//         writeStream.end(pdfBytes);
//     } catch (error) {
//         console.error('Error saving code as PDF:', error);
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

router.post('/saveCodeAsPDF', async (req, res) => {
    try {
        const { code } = req.body;

        // Create a new jsPDF instance
        const pdf = new jsPDF();

        // Set font size and type
        pdf.setFontSize(12);
        pdf.setFont('courier');

        // Split the code into lines and add them to the PDF
        const codeLines = code.split('\n');
        codeLines.forEach((line, index) => {
            // Add each line to the PDF
            pdf.text(line, 10, 10 + index * 10);
        });

        // Save the PDF to a buffer
        const pdfBuffer = pdf.output();

        const fileName = `code_${Date.now()}.pdf`;
        const bucket = storage.bucket('screenshots_canvas');
        const file = bucket.file(fileName);

        // Create a writable stream and pipe the PDF data to it
        const writeStream = file.createWriteStream({
            metadata: {
                contentType: 'application/pdf',
            },
        });

        writeStream.on('error', (err) => {
            console.error('Error writing PDF to Google Cloud Storage:', err);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        });

        writeStream.on('finish', async () => {
            console.log(`PDF saved to Google Cloud Storage: ${fileName}`);

            // Get a signed URL for the client to download the PDF
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            });

            // Respond to the client with the signed URL and also send the PDF buffer
            res.status(200).json({ success: true, url, pdfBuffer });
        });

        // Pipe the PDF buffer to the writable stream
        writeStream.end(pdfBuffer);

    } catch (error) {
        console.log('Error saving PDF:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/uploadCanvasScreenshot', upload.single('image'), async (req, res) => {
    try {
        const imageData = req.file?.buffer;
        if (!imageData) {
            throw new Error('No image data');
        }

        const fileName = `canvas_screenshot_${Date.now()}.png`;

        const bucket = storage.bucket('screenshots_canvas');
        const file = bucket.file(fileName);

        await file.save(imageData, { contentType: 'image/png' });

        console.log(`Image uploaded to Google Cloud Storage: ${fileName}`);

        res.status(200).json({ success: true, fileName });
    } catch (error) {
        console.error('Error uploading image to Google Cloud Storage:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/downloadCanvasImage/:fileName', async (req, res) => {
    const { fileName } = req.params;
    const bucket = storage.bucket('screenshots_canvas');
    const file = bucket.file(fileName);
    const [fileExists] = await file.exists();

    if (fileExists) {
        const readStream = file.createReadStream();
        res.setHeader('Content-Type', 'image/png');
        readStream.pipe(res);
    }
    else {
        res.status(404).json({ success: false, error: 'File not found' });
    }
});


module.exports = router
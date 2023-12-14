//Libraries
const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors'); // Import cors module
const mongoose = require('mongoose');
const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const upload = multer();
const fs = require('fs');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require('./Credentials.json');
const path = require('path');
const os = require('os');
const bodyParser = require('body-parser');


//Custom imports
const Room = require('./models/Room');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');
const router = require('./router');
const credentials = JSON.parse(fs.readFileSync('./Credentials.json'));
const pdf = require('html-pdf');

//port 
const PORT = process.env.PORT || 5000;


const app = express();
const server = http.createServer(app);

app.use(bodyParser.json());

//connect to mongoDB
mongoose.connect('mongodb://mongo-db:27017/Rooms', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// mongoose.connect('mongodb://localhost:27017/Rooms', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });

// After connecting to MongoDB
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});


const io = new Server(server, {
    cors: {
       origin: 'http://react-ui:5173',
        methods: ['GET', 'POST'],
    }
});

// const io = new Server(server, {
//     cors: {
//         origin: 'http://localhost:5173',
//         methods: ['GET', 'POST'],
//     }
// });

const storage = new Storage({
    projectId: 'credentials.project_id',
    keyFilename: './Credentials.json',
    bucket: 'screenshots_canvas',
  });
  //const bucketName = 'screenshot_canvas';

  const multerStorage = multer.memoryStorage();

app.post('/uploadCanvasScreenshot', upload.single('image'), async (req, res) => {
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

  app.get('/downloadCanvasImage/:fileName', async (req, res) => {
    const { fileName } = req.params;
    const bucket = storage.bucket('screenshots_canvas');
    const file = bucket.file(fileName);
    const [fileExists] = await file.exists();

    if(fileExists) {
        const readStream = file.createReadStream();
        res.setHeader('Content-Type', 'image/png');
        readStream.pipe(res);
    }
    else {
        res.status(404).json({ success: false, error: 'File not found' });
    }
});

//   app.post('/saveCodeAsPDF', async (req, res) => {
//     try {
//       const { code } = req.body;
  
//       //const pdfDoc = await PDFDocument.create();
//     //   const pdfDoc = await pdf.create();
//     //   const page = pdfDoc.addPage();
//     //   const { height } = page.getSize();
  
//     //   page.drawText(code, {
//     //     x: 50,
//     //     y: height - 100,
//     //   });
  
//     //   const pdfBytes = await pdfDoc.save();

//       pdf.create(code, { format: 'Letter' }).toBuffer(async (err, buffer) => {
//         if (err) {
//           console.error('Error creating PDF:', err);
//           res.status(500).json({ success: false, error: 'Internal Server Error' });
//           return;
//         }
  
//       const fileName = `code_${Date.now()}.pdf`;
//       const bucket = storage.bucket('screenshots_canvas');
//       const file = bucket.file(fileName);
      
//       // Create a writable stream and pipe the PDF data to it
//       const writeStream = file.createWriteStream({
//         metadata: {
//           contentType: 'application/pdf',
//         },
//       });
  
//       writeStream.on('error', (err) => {
//         console.error('Error writing PDF to Google Cloud Storage:', err);
//         res.status(500).json({ success: false, error: 'Internal Server Error' });
//       });
  
//       writeStream.on('finish', async () => {
//         console.log(`PDF saved to Google Cloud Storage: ${fileName}`);
  
//         // Get a signed URL for the client to download the PDF
//         const [url] = await file.getSignedUrl({
//           action: 'read',
//           expires: Date.now() + 15 * 60 * 1000, // 15 minutes
//         });
  
//         // Respond to the client with the signed URL
//         res.status(200).json({ success: true, url });
//       });
  
//       // Pipe the PDF data to the writable stream
//       writeStream.end(pdfBytes);
//     } catch (error) {
//       console.error('Error saving code as PDF:', error);
//       res.status(500).json({ success: false, error: error.message });
//     }
// });


//Code below works on localhost and gives error in docker

// app.post('/saveCodeAsPDF', async (req, res) => {
//     try {
//       const { code } = req.body;
//       const phantomPath = '/opt/homebrew/bin/phantomjs';

//       const pdfOptions = {
//         phantomPath,
//         format: 'Letter',
//     };
  
//       // Use the html-pdf library to create a PDF
//       pdf.create(code, pdfOptions).toBuffer(async (err, buffer) => {
//         if (err) {
//             console.error('Error creating PDF:', err);
//             res.status(500).json({ success: false, error: 'Internal Server Error' });
//             return;
//         }
  
//         const fileName = `code_${Date.now()}.pdf`;
//         const bucket = storage.bucket('screenshots_canvas');
//         const file = bucket.file(fileName);
  
//         // Create a writable stream and pipe the PDF data to it
//         const writeStream = file.createWriteStream({
//           metadata: {
//             contentType: 'application/pdf',
//           },
//         });
  
//         writeStream.on('error', (err) => {
//           console.error('Error writing PDF to Google Cloud Storage:', err);
//           res.status(500).json({ success: false, error: 'Internal Server Error' });
//         });
  
//         writeStream.on('finish', async () => {
//           console.log(`PDF saved to Google Cloud Storage: ${fileName}`);
  
//           // Get a signed URL for the client to download the PDF
//           const [url] = await file.getSignedUrl({
//             action: 'read',
//             expires: Date.now() + 15 * 60 * 1000, // 15 minutes
//           });
  
//           // Respond to the client with the signed URL
//           res.status(200).json({ success: true, url });
//         });
  
//         // Pipe the PDF data to the writable stream
//         writeStream.end(buffer);
//       });
//     } catch (error) {
//       console.error('Error saving code as PDF:', error);
//       res.status(500).json({ success: false, error: error.message });
//     }
//   });
  

const puppeteer = require('puppeteer');

app.post('/saveCodeAsPDF', async (req, res) => {
    try {
        const { code } = req.body;

        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        await page.setContent(`<pre>${code}</pre>`);
        const pdfBuffer = await page.pdf();

        const fileName = `code_${Date.now()}.pdf`;
        const bucket = storage.bucket('screenshots_canvas');
        const file = bucket.file(fileName);

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

            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            });

            res.status(200).json({ success: true, url });
        });

        writeStream.end(pdfBuffer);
        await browser.close();
    } catch (error) {
        console.error('Error saving code as PDF:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});



  
io.on('connection', (socket) => {
    console.log(`We have a new connection ${socket.id}`);

    socket.on('join', ({ name, room }, callback) => {
        console.log(`${name} has joined room ${room}`);

        const { error, user } = addUser({ id: socket.id, name, room });

        if (error) return callback(error);
        socket.join(user.room);

        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to the room ${user.room}` });
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name}, has joined!` });

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        console.log(`from SendMessage ${user.name}`);

        io.to(user.room).emit('message', { user: user.name, text: message });
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

        callback();
    })

    socket.on('draw-line', ({ prevPoint, currentPoint, color }) => {
        const user = getUser(socket.id);

        socket.broadcast.to(user.room).emit('draw-line', { prevPoint, currentPoint, color });
    })

    socket.on('clear', () => {
        const user = getUser(socket.id);
        io.to(user.room).emit('clear')
    }
    );

    socket.on('saveCode', ({ code }) => {
        const user = getUser(socket.id);
        console.log(`Code being saved : ${code}`)
        // Store the code or perform any necessary actions here
        // You can store it in a database or in-memory data structure
        // For simplicity, let's store it in-memory for now

        // Broadcast the updated code to other users in the same room
        io.to(user.room).emit('updateCode', { userId: user.id, code });
    });

    socket.on('code-executed', ({output}) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('code-executed', {userId: socket.id, output });
    });

    socket.on('language-change', ({ language }) => {
        const user = getUser(socket.id);
        console.log(`Language being updated ${language}`);
        if (user) {
            user.language = language;
            io.to(user.room).emit('language-change', { userId: socket.id, language });
        }
    });

    socket.on('take-control', () => {
        const controlUser = getUser(socket.id);
        console.log(`${controlUser.name} has taken control`);
        io.emit('control-change', { controlUser });
    });

    // Listen for release-control event
    socket.on('release-control', () => {
        controlUser = { name: 'Nobody', id: '000' };
        io.emit('control-change', { controlUser });
    });


    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
        }
    });
});
app.use(cors());
app.use(express.json());
app.use(router);

server.listen(PORT, '0.0.0.0', () => console.log(`Server is running on port ${PORT}`));

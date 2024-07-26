const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// POST endpoint to handle incoming messages
app.post('/send-message', (req, res) => {
    const { ip, location, os, browser } = req.body;

    console.log('Received message:', {
        ip,
        location,
        os,
        browser
    });

    // You can perform additional operations here, like saving to a database

    res.status(200).json({ message: 'Message received successfully' });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

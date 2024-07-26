const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json());

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.post('/send-message', async (req, res) => {
    const { ip, location, os, browser } = req.body;

    const googleMapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    const message = `
New visitor detected!
IP Address: ${ip}
Location: ${location.country}, ${location.city} (${location.latitude}, ${location.longitude})
Google Maps: ${googleMapsUrl}
Operating System: ${os}
Browser: ${browser}
    `;

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: message }),
        });

        if (!response.ok) throw new Error('Network response was not ok');
        res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message to Telegram:', error);
        res.status(500).json({ error: 'Error sending message' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

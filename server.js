const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/visitor-info', async (req, res) => {
    console.log('Visitor info endpoint called');
    
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`Detected IP: ${ip}`);

    try {
        const locationResponse = await axios.get(`https://ipapi.co/${ip}/json/`);
        console.log('ipapi.co response:', locationResponse.data);
        
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
        console.log('Visitor Info:', visitorInfo);

        // Send notification to Telegram
        const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!telegramBotToken || !chatId) {
            console.error('Telegram bot token or chat ID is missing');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const message = `
New visitor detected!
IP Address: ${visitorInfo.ip}
Location: ${visitorInfo.country}, ${visitorInfo.city} (${visitorInfo.latitude}, ${visitorInfo.longitude})
Google Maps: https://www.google.com/maps?q=${visitorInfo.latitude},${visitorInfo.longitude}
User Agent: ${visitorInfo.os}
        `;

        try {
            const telegramResponse = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
                chat_id: chatId,
                text: message
            });
            console.log('Telegram message sent successfully:', telegramResponse.data);
        } catch (telegramError) {
            console.error('Error sending Telegram message:', telegramError.response ? telegramError.response.data : telegramError.message);
            console.error('Full error object:', telegramError);
        }

        res.json(visitorInfo);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred while fetching visitor information' });
    }
});

// Test route for Telegram API
app.get('/test-telegram', async (req, res) => {
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const message = 'Test message from server';
    
    try {
        const response = await axios.post(
            `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
            { chat_id: chatId, text: message }
        );
        console.log('Telegram API response:', response.data);
        res.json({ success: true, response: response.data });
    } catch (error) {
        console.error('Telegram API error:', error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

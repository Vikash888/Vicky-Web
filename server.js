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
    console.log('Location API response:', locationResponse.data);

    const location = locationResponse.data;
    const os = req.headers['user-agent'];
    const browser = req.headers['user-agent'];
    const googleMapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;

    const message = `
New visitor detected!
IP Address: ${ip}
Location: ${location.country_name}, ${location.city} (${location.latitude}, ${location.longitude})
Google Maps: ${googleMapsUrl}
Operating System: ${os}
Browser: ${browser}
    `;

    console.log('Preparing to send Telegram message:', message);

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const telegramResponse = await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      { chat_id: chatId, text: message }
    );
    console.log('Telegram API response:', telegramResponse.data);

    res.json({ success: true, message: 'Visitor info processed and notification sent' });
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'An error occurred while processing visitor information' });
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

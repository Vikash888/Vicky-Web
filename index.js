const https = require('https');

exports.handler = async (event) => {
    const visitorInfo = JSON.parse(event.body);
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    const googleMapsUrl = `https://www.google.com/maps?q=${visitorInfo.location.latitude},${visitorInfo.location.longitude}`;
    const message = `
New visitor detected!
IP Address: ${visitorInfo.ip}
Location: ${visitorInfo.location.country}, ${visitorInfo.location.city} (${visitorInfo.location.latitude}, ${visitorInfo.location.longitude})
Google Maps: ${googleMapsUrl}
Operating System: ${visitorInfo.os}
Browser: ${visitorInfo.browser}
    `;

    try {
        await sendTelegramMessage(telegramBotToken, chatId, message);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Information sent to Telegram successfully' }),
        };
    } catch (error) {
        console.error('Error sending message to Telegram:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error sending message to Telegram' }),
        };
    }
};

function sendTelegramMessage(token, chatId, text) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            chat_id: chatId,
            text: text
        });

        const options = {
            hostname: 'api.telegram.org',
            port: 443,
            path: `/bot${token}/sendMessage`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let responseBody = '';

            res.on('data', (chunk) => {
                responseBody += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(responseBody));
                } else {
                    reject(new Error(`Request failed with status code ${res.statusCode}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

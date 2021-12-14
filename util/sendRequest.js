const http = require('http');

function sendRequest(url, body) {
    return new Promise((resolve, reject) => {
        let request = http.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, (res) => {
            let data = "";
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });

        request.write(body);
        request.end();
    });
}

module.exports = sendRequest;
import axios from 'axios';
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('How many requests per minute? ', (answer) => {
    const requestsPerMinute = parseInt(answer);
    if (isNaN(requestsPerMinute) || requestsPerMinute <= 0) {
        console.log('Please enter a valid number greater than 0.');
        rl.close();
        return;
    }

    const interval = 60000 / requestsPerMinute;
    const url = 'http://localhost:30000/api/alerts'; // Replace with the actual URL of listener0srv

    const sendRequest = () => {
        const event = {
            "location": "Nahariya",
            "type": "Rocket Alert",
            "timestamp": "2025-01-22T10:00:00Z",
            "duration": 10
        };

        axios.post(url, event)
            .then(response => {
                console.log('Request sent successfully:', response.data);
            })
            .catch(error => {
                console.error('Error sending request:', error);
            });
    };

    setInterval(sendRequest, interval);
    console.log(`Sending ${requestsPerMinute} requests per minute to ${url}`);
    rl.close();
});
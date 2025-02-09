import axios from 'axios';
import dayjs from "dayjs";
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const locations: Array<string> = ['Nahariya', 'Haifa', 'Tel Aviv', 'Jerusalem'];

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
            "location": locations[Math.floor(Math.random() * locations.length)],
            "type": "Rocket Alert",
            "timestamp": dayjs().add(1, 'minute').toISOString(),
            "duration": 1
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

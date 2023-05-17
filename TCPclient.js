const net = require('net');
process.stdin.setEncoding('utf8');

const client = net.createConnection(8108, () => {
    console.log('Connected');
});

process.stdin.on('readable', () => {
    let userInput;
    if ((userInput = process.stdin.read()) !== null) {
        userInput = userInput.toString().trim();
        if (userInput === 'quit') {
            process.exit();
        } else {
            client.write(userInput);
        }
    }
});

client.setEncoding('utf8');
client.on('data', data => {
    console.log(data);
});
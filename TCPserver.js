const fs = require('fs');
const net = require('net');
const file = fs.createWriteStream('./chat.log', {flags: 'a'});
process.stdin.setEncoding('utf8');

let connectedClients = [];
let user = 1;    

const server = net.createServer(client => {
    //initial setup
    client.setEncoding('utf8')
    client.id = "Guest " + user++
    connectedClients.push(client)
    console.log('Client has connected')
    //after initial setup, notifications are sent
    file.write(client.id + " has entered the chat\n")    
    client.write(`Welcome to the chat ${client.id}!\n`)
    connectedClients.forEach(guest => {
        if(guest !== client){
            guest.write(`${client.id} has entered the chat`)
        }
    })
    //the server is now listening for input
    client.on('data', output => {
        if(output === '/clientlist'){
            connectedClients.forEach(guest => {
                if(guest === client){
                    const clientList = connectedClients.map(client => client.id).join(', ');
                    guest.write(clientList);                }
            })
        } else if(output.startsWith('/username')){
            const newUserName = output.split(' ')[1].trim();
            const oldUserName = client.id;
            let alreadyInUse = false;
            connectedClients.forEach(function(client) {
                if(client.id == newUserName) {
                    alreadyInUse = true;
                }
            });
            if (newUserName === oldUserName){
                client.write('This is already your username\n')
            } else if (alreadyInUse) {
                client.write('This username is already in use\n')
            } else {
                client.id = newUserName;
                file.write(`${oldUserName} has updated their username to ${newUserName}\n`)
                connectedClients.forEach(guest => {
                    if(guest === client){
                        guest.write(`You have updated your username to ${newUserName}\n`)
                    } else if (guest !== client){
                        guest.write(`${oldUserName} has updated their username to ${newUserName}\n`)
                    }
                })
            }
        
        
        } else if(output.startsWith('/w')){
            const self = client.id;
            const targetClient = output.split(' ')[1].trim();
            let whispered = false;
            if (targetClient === self) {
                client.write('You cannot whisper yourself');
                whispered = true;
            } else connectedClients.forEach(client => {
                if(targetClient === client.id){
                    let temp = output.split(' ');
                    let array = temp.slice(2);
                    let message = array.join(' ');
                    client.write(`${self}(whispered): ${message}`)
                    file.write(`${self} whispered to ${targetClient}: ${message}\n`)
                    whispered = true;
                };
            });
            if(whispered === false) {
                client.write('User does not exist');
            }
        } 
        
        else if(output.startsWith('/kick')){
            const adminPassword = 'pass1234';
            const self = client.id;
            const targetClient = output.split(' ')[1].trim();
            const password = output.split(' ')[2].trim();
            if (targetClient === self){
                    client.write('You cannot kick yourself');
            } else {
                let targetFound = false;
                connectedClients.forEach(guest => {
                    if(targetClient === guest.id) {
                        targetFound = true;
                        if(password === adminPassword) {
                            guest.write('You have been kicked from the chat\n')
                            guest.end();
                        } else {
                            client.write('Cannot kick, incorrect password\n');
                        }
                    }
                })
            if(!targetFound) {
                client.write('User does not exist\n');
            }
        }

        } else {
        connectedClients.forEach(guest => {
                if(guest !== client){
                    guest.write(`${client.id}: ${output}`)
                }
            })
        file.write(`${client.id}: ${output}\n`)
        }
    })
    client.on('end', () => {
        file.write(client.id + " has left the chat\n");
        connectedClients.forEach(guest => {
            if(guest !== client){
                guest.write(`${client.id} has left the chat`)
            }
        })
        const index = connectedClients.indexOf(client);
        connectedClients.splice(index, 1);
        console.log(`${client.id} disconnected`);
    })
    client.on('error', (err) => {
        throw err;
    });
});

server.listen(8108, () => {
    console.log('Port 8108 is watching');
}); 
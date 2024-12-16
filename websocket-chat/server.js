const WebSocket = require('ws');
const http = require('http');
const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/disconnect') {
        disconnectClient(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Route not found');
    }
});

const wss = new WebSocket.Server({ noServer: true });

const clients = new Set();
const userNames = {};
const wsConnections = {};

wss.on('connection', (ws) => {
    const userId = Math.random().toString(36).substr(2, 9); 
    clients.add(ws);
    userNames[ws] = userId; 
    wsConnections[userId] = ws; 

    ws.on('message', (message) => {
        console.log('Отримано повідомлення:', message);
        broadcast(message);
    });

    ws.on('close', () => {
        clients.delete(ws);
        delete userNames[ws]; 
        delete wsConnections[userId]; 
        console.log(`${userId} від’єднався`);
        broadcast(`${userId} залишив чат`);
        updateUserList();
    });

    ws.on('error', (error) => {
        console.error('Помилка WebSocket:', error);
        clients.delete(ws);
        delete userNames[ws];
        delete wsConnections[userId];
    });

    broadcast(`${userId} приєднався до чату`);
});

function disconnectClient(req, res) {
    const userId = req.headers['user-id'];

    const ws = wsConnections[userId];
    if (ws) {
        ws.close();
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`Користувач ${userId} успішно відключений від чату`);
        console.log(`${userId} відключено через HTTP-запит`);
    } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Користувач не знайдений');
    }
}

function broadcast(message) {
    for (let client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message); 
        }
    }
}

function updateUserList() {
    const userList = Object.values(userNames); 
    const userListMessage = `Список користувачів: ${userList.join(', ')}`;
    broadcast(userListMessage);
}

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

server.listen(3000, () => {
    console.log('Сервер працює на порту 3000');
});

function disconnectClient(req, res) {
    const userId = req.headers['user-id'];
    const ws = wsConnections[userId]; 

    if (ws) {
        ws.close(); 
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`Користувач ${userId} успішно відключений від чату`);
        console.log(`${userId} відключено через HTTP-запит`);
    } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Користувач не знайдений'); 
    }
}
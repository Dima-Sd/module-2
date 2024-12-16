const socket = new WebSocket('ws://localhost:3000');

socket.onopen = () => {
    console.log('З’єднання відкрите');
};

socket.onmessage = (event) => {
    const chat = document.getElementById('chat');
    const newMessage = document.createElement('div');
    newMessage.innerText = event.data; 
    chat.appendChild(newMessage); 

    if (event.data.startsWith("Список користувачів:")) {
        updateUserList(event.data); 
    }
};

socket.onclose = () => {
    console.log('З’єднання закрите');
    disableChat(); 
};

function sendMessage() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value;
    if (message.trim()) {
        socket.send(message);
        messageInput.value = '';
    }
}

function updateUserList(message) {
    const userListElement = document.getElementById('userList');
    userListElement.innerHTML = ''; 

    const users = message.replace("Список користувачів:", "").split(',');
    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.innerText = user.trim();
        userListElement.appendChild(userElement);
    });
}

function disconnect() {
    fetch('/disconnect', {
        method: 'GET',
        headers: {
            'user-id': 'userId123'
        }
    })
        .then(response => response.text())
        .then(message => {
            alert(message);
            socket.close(); 
        })
        .catch(error => {
            console.error('Помилка під час відключення:', error);
        });
}

function disableChat() {
    const chat = document.getElementById('chat');
    const newMessage = document.createElement('div');
    newMessage.innerText = "Ви відключились від чату.";
    chat.appendChild(newMessage); 

    document.getElementById("message").disabled = true;
    document.getElementById("sendBtn").disabled = true;
    document.getElementById("disconnectBtn").disabled = true;
}
const message = "Ви відключилися"
function disconnect() {
    fetch('/disconnect', {
        method: 'GET',
        headers: {
            'user-id': 'userId123'
        }
    })

        .then(response => response.text()) 
        .then(message => {
            alert(message); 
            socket.close(); 
        })
        .catch(error => {
            console.error('Помилка під час відключення:', error);
        });
}
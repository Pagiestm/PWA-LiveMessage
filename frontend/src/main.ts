import { io } from 'socket.io-client';
import filterCommentary from './services/ai/filter-commentary';
// @ts-ignore
import './style.css';

navigator.serviceWorker.register('service-worker.js');

if (!window.location.search.includes('username')) {
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div class="login-container">
      <h1>Welcome to Chat Room</h1>
      <input id="username-input" type="text" placeholder="Enter your username" />
      <button id="join-chat">Join Chat</button>
    </div>
  `;

  const joinButton = document.querySelector<HTMLButtonElement>('#join-chat')!;
  const usernameInput = document.querySelector<HTMLInputElement>('#username-input')!;

  joinButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
      window.location.href = `${window.location.pathname}?username=${username}`;
    }
  });
} else {
  const socket = io('http://localhost:3000');
  const username = new URLSearchParams(window.location.search).get('username');

  socket.on('connect', () => {
    console.log('Connected to server');
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });

  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div class="chat-container">
      <div class="chat-header">
        <h1>Chat Room</h1>
        <p>Welcome, ${username}!</p>
      </div>
      <div class="chat-messages">
        <ul id="messages"></ul>
      </div>
      <div class="chat-input">
        <input id="message" type="text" placeholder="Type a message..." />
        <button id="send" type="button"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14L21 3m0 0l-6.5 18a.55.55 0 0 1-1 0L10 14l-7-3.5a.55.55 0 0 1 0-1z"/></svg></button>
      </div>
      <div class="error-popup" id="error-popup"></div>
    </div>
  `;

  const sendButton = document.querySelector<HTMLButtonElement>('#send')!;
  const messageInput = document.querySelector<HTMLInputElement>('#message')!;
  const messagesList = document.querySelector<HTMLUListElement>('#messages')!;

  socket.emit('join', username);

  sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if(!message) {
      showErrorPopup("Le message ne peut pas être vide.");
      return;
    }

    filterCommentary.filter(message).then((filteredMessage) => {
      if(filteredMessage === 'accept') {
        socket.emit('chatMessage', message);
      } else {
        showErrorPopup("Le message a été rejeté car il contient des propos inappropriés ou considéré comme spam.");
      }
    });
    messageInput.value = '';
  });

  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendButton.click();
    }
  });

  socket.on('message', (data) => {
    console.log('Received message:', data);
    const item = document.createElement('li');
    item.className = data.user === username ? 'self' : '';
    
    const userParagraph = document.createElement('p');
    userParagraph.className = 'username';
    userParagraph.textContent = data.user;
    
    const messageParagraph = document.createElement('p');
    messageParagraph.textContent = data.text;
    
    item.appendChild(userParagraph);
    item.appendChild(messageParagraph);
    messagesList.appendChild(item);
    item.scrollIntoView({ behavior: 'smooth' });
  });

  socket.on('welcome', (msg) => addSystemMessage(msg));
  socket.on('userJoined', (msg) => addSystemMessage(msg));
  socket.on('userLeft', (msg) => addSystemMessage(msg));
}

function addSystemMessage(message: string) {
  const item = document.createElement('li');
  item.className = 'system-message';
  const p = document.createElement('p');
  p.textContent = message;
  item.appendChild(p);
  document.querySelector<HTMLUListElement>('#messages')?.appendChild(item);
}

function showErrorPopup(error: string = 'Your message was rejected.') {
  const errorPopup = document.querySelector<HTMLDivElement>('#error-popup')!;
  errorPopup.textContent = error;
  errorPopup.classList.add('show');
  setTimeout(() => {
    errorPopup.classList.remove('show');
  }, 3000); // Hide after 3 seconds
}
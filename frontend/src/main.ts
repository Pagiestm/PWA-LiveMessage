import './style.css';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="chat-container">
    <div class="chat-header">
      <h1>Chat Room</h1>
    </div>
    <div class="chat-messages">
      <ul id="messages">
        <li>
          <p>Gunride56</p>
          <p>Cc bébou</p>
        </li>
        <li class="self">
          <p>RedSunShine</p>
          <p>Ca va ?</p>
        </li>
      </ul>
    </div>
    <div class="chat-input">
      <input id="message" type="text" placeholder="Type a message..." />
      <button id="send" type="button">Send</button>
    </div>
  </div>
`;

const sendButton = document.querySelector<HTMLButtonElement>('#send')!;
const messageInput = document.querySelector<HTMLInputElement>('#message')!;
const messagesList = document.querySelector<HTMLUListElement>('#messages')!;

let username = prompt("Please enter your name:");

sendButton.addEventListener('click', () => {
  const message = messageInput.value;
  socket.emit('chat message', { username, message });
  messageInput.value = '';
});

socket.on('chat message', (data) => {
  const item = document.createElement('li');
  const pseudoParagraph = document.createElement('p');
  const messageParagraph = document.createELemereateElement('p');
  item.textContent = `${data.username}: ${data.message}`;
  messagesList.appendChild(item);
});
var socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
const button = document.getElementById('send-button');
const messageContainer = document.getElementById('messages');
const chatContainer = document.getElementById('chat-container');

// add message to page
function addMessageToPage(message) {
  const messageList = document.createElement('div');
  messageList.classList.add('message');
  messageList.innerHTML = message; //'<pre>' + message + '</pre>';
  // messageContainer.appendChild(messageList);

  const messageTime = new Date().toLocaleTimeString();
  const span = document.createElement('span');
  span.classList.add('message_time');
  span.textContent = messageTime;

  const tempWrapper = document.createElement('div');
  tempWrapper.appendChild(messageList);
  tempWrapper.appendChild(span);
  messageContainer.appendChild(tempWrapper);
}

// Handle sending message to server and input reset
function sendMessage() {
  const inputMessage = input.value.trim();
  if (inputMessage === '') {
    return;
  }

  addMessageToPage(inputMessage);
  socket.emit('chat_message', input.value);
  input.value = '';
}

//watch for message from the server to emit
socket.on('welcome', (msg) => {
  addMessageToPage(msg);

  // Scroll to the bottom of the chat automatically
  window.scrollTo(0, document.body.scrollHeight);
});

// Add listener to form submission
form.addEventListener('submit', (event) => {
  event.preventDefault();
  sendMessage();
});

// Add listener to button on click event
button.addEventListener('click', sendMessage);

// input.addEventListener('keydown', (event) => {
//   if (event.key === 'Enter') {
//     event.preventDefault();
//     sendMessage();
//   }
// });

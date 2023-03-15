var socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
const button = document.getElementById('send-button');
const messageContainer = document.getElementById('messages');

// add message to page
function addMessageToPage(message) {
  const messageList = document.createElement('div');
  messageList.classList.add('message');
  messageList.textContent = message;
  // messageContainer.appendChild(messageList);

  const messageTime = new Date().toLocaleTimeString();
  const span = document.createElement('span');
  span.classList.add('message_time');
  span.textContent = messageTime;
  console.log(span);

  const tempWrapper = document.createElement('div');
  tempWrapper.appendChild(messageList);
  tempWrapper.appendChild(span);
  messageContainer.appendChild(tempWrapper);

  //   messageContainer.scrollTop = messageContainer.scrollHeight;
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
});

// Add listener to form submission
form.addEventListener('submit', (event) => {
  event.preventDefault();
  sendMessage();
});

// Add listener to button on click event
button.addEventListener('click', sendMessage);

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendMessage();
  }
});

// REVIEW CODE BELOW HERE ///
// socket.on('welcome', ({ data, menu }) => {
//   const tempWrapper = document.createElement('p');
//   tempWrapper.innerHTML = data;
//   message.appendChild(tempWrapper.firstChild);

//   menu.forEach((item) => {
//     let wrapper = document.createElement('li');
//     wrapper.textContent = item;

//     menuList.appendChild(wrapper);
//   });
// });

// socket.on('chat message', (msg) => {
//   var item = document.createElement('li');
//   item.textContent = msg;
//   message.appendChild(item);
// });

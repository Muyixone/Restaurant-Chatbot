var socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
const message = document.getElementById('messages');
const welcomeMsg = document.getElementsByClassName('welcome_msg');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (input.value) {
    socket.emit('chat message', input.value);
    input.value = '';
  }
});

socket.on('welcome', ({ data, menu }) => {
  const tempWrapper = document.createElement('p');
  tempWrapper.innerHTML = data;
  message.appendChild(tempWrapper.firstChild);

  menu.forEach((item) => {
    let wrapper = document.createElement('li');
    wrapper.textContent = item;
    console.log(wrapper);
    message.appendChild(wrapper);
  });
});

socket.on('chat message', (msg) => {
  var item = document.createElement('li');
  item.textContent = msg;
  message.appendChild(item);
});

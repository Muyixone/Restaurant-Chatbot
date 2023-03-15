const path = require('path');
const express = require('express');
const http = require('http');
const { sessionMiddleware, wrap } = require('./middlewares');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cuisines = require('./cuisineStore');
const dayjs = require('dayjs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Use the middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// app.set('view engine', 'ejs');

// Session middleware
app.use(sessionMiddleware);
io.use(wrap(sessionMiddleware, { autoSave: true }));

let orderHistory = [];

app.get('/', (req, res) => {
  res.sendFile('index');
  //   res.render('index');
});

// Function to display order method
function rand() {
  let items = [
    'Press 1: To place an order For a list of our cuisines \n.',
    'Press 99: To confirm an order',
    'Press 98: To see order history',
    'Press 97: To see current order',
  ];

  items.forEach((item) => {
    return item;
  });
  //   for (let i of items) {
  //     return i;
  //     //  	const div = document.createElement('div')
  //     //   div.textContent = i
  //     //   display.appendChild(div)
  //   }
}

// Greet the user with time
function greetFunc(user, callback) {
  let currentTime = dayjs();
  let currentHour = currentTime.hour();
  if (currentHour < 12) {
    return [['Good Morning ' + user], callback()];
  } else if (currentHour > 12 && currentHour < 18) {
    return [['Good Afternoon ' + user], callback()];
  } else {
    return [['Good Evening ' + user], callback()];
  }
}

io.on('connection', (socket) => {
  console.log('A user has connected');

  let userName = '';
  socket.session = socket.request.session;

  socket.emit('welcome', 'You are welcome, Please enter your name');

  socket.on('chat_message', (msg) => {
    // const userSession = socket.handshake.session;
    if (!userName) {
      userName = msg;
      socket.emit(
        'welcome',
        greetFunc(userName.toUpperCase(), rand)
        // `Welcome ${userName}! To place an order;
        // Press 1: For a list of our cuisines \n.
        // Press 99: To confirm an order
        // Press 98: To see order history
        // Press 97: To see current order
        // Press : To Cancel order`
      );
    } else {
      switch (msg) {
        case '1':
          const cuisineList = Object.entries(cuisines)
            .map(([key, item]) => `${key}. ${item}`)
            .join('\n');
          socket.emit('welcome', `List of items to order:\n ${cuisineList}`);
          break;
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          const itemIndex = parseInt(msg);
          if (cuisines.hasOwnProperty(itemIndex)) {
            const itemSelected = cuisines[itemIndex];
            socket.session.currentOrder = socket.session.currentOrder || [];
            socket.session.currentOrder.push(itemSelected);
            socket.emit(
              'welcome',
              `Order ${itemSelected} has been added to your order`
            );
          } else {
            socket.emit('welcome', `Wrong order selected.`);
          }
          break;
        case '99':
          if (
            socket.session.currentOrder &&
            socket.session.currentOrder.length
          ) {
            orderHistory.push(socket.session.currentOrder);
            socket.emit('welcome', `Order placed successfully.`);
            delete socket.session.currentOrder;
          } else {
            socket.emit('welcome', `No order placed. please place an order`);
          }
          break;
        case '98':
          if (!orderHistory.length) {
            socket.emit('welcome', 'No previous orders');
          } else {
            const orderHistoryToStringMethod = orderHistory.map(
              (item, index) => {
                return `Order ${index + 1} : ${item.join(', ')}`;
              }
            );
            socket.emit(
              'welcome',
              `order history: ${orderHistoryToStringMethod}`
            );
          }
          break;
        case '97':
          console.log(socket.session);
          if (
            socket.session.currentOrder &&
            socket.session.currentOrder.length
          ) {
            // orderHistory.push(socket.session.currentOrder);
            socket.emit(
              'welcome',
              `Your current order: ${socket.session.currentOrder}`
            );
          } else {
            socket.emit('welcome', 'No current order. Please select an order');
          }
          break;
        case '0':
          if (
            socket.session.currentOrder &&
            socket.session.currentOrder.length
          ) {
            socket.emit('welcome', 'Order canceled');
            delete socket.session.currentOrder;
          } else {
            socket.emit('welcome', 'No current order to cancel');
          }
          break;
        default:
          socket.emit('welcome', 'Wrong selection');
          break;
      }
    }

    // io.emit('welcome', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

module.exports = {
  app,
  server,
};

const path = require('path');
const express = require('express');
const http = require('http');
const { sessionMiddleware, wrap } = require('./middlewares');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// app.set('view engine', 'ejs');

// let info = {
//   data: `Your are welcome!, \n Below is a list of our cuisines:`,
//   menu: ['Rice', 'Beans', 'Coffee', 'Dod'],
// };

app.use(sessionMiddleware);

io.use(wrap(sessionMiddleware, { autoSave: true }));
let orderRecord = [];
let cuisines = {
  2: 'item1',
  3: 'item3',
  4: 'item4',
  5: 'item5',
};
const state = {
  userName: '',
  currentOrder: [],
};

app.get('/', (req, res) => {
  res.sendFile('index');
  //   res.render('index');
});

io.on('connection', (socket) => {
  console.log('A user has connected');

  let userName = '';
  socket.session = socket.request.session;

  socket.emit('welcome', 'You are welcome, Please enter your name');

  socket.on('chat_message', (msg) => {
    // console.log('message from user:', msg);
    // const userSession = socket.handshake.session;
    if (!userName) {
      userName = msg;
      socket.emit(
        'welcome',
        `Welcome ${userName}! place your order \n. Typehere\n99. Typehere\n98. Typehere\n97. Typehere\n0. Cancel order`
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
            orderRecord.push(socket.session.currentOrder);
            socket.emit('welcome', `Order placed successfully.`);
            delete socket.session.currentOrder;
          } else {
            socket.emit('welcome', `No order placed. please place an order`);
          }
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

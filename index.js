const path = require('path');
const express = require('express');
const http = require('http');
const { sessionMiddleware, wrap } = require('./middlewares');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cuisines = require('./cuisineStore');

const { botGuide, greetFunc } = require('./utils/utilFunctions');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Use the middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(sessionMiddleware);
io.use(wrap(sessionMiddleware));

let orderHistory = [];
let botIntro = `Welcome to CuisineGenie, Please enter your name`;

app.get('/', (_, res) => {
  res.sendFile('index');
});

//socket events

io.on('connection', (socket) => {
  let userName = '';
  socket.session = socket.request.session;

  socket.emit('welcome', botIntro);

  socket.on('chat_message', (msg) => {
    if (!userName) {
      userName = msg;
      socket.emit('welcome', greetFunc(userName.toUpperCase(), botGuide));
    } else {
      switch (msg) {
        case '1':
          const cuisineList = Object.entries(cuisines)
            .map(([key, item]) => `${key}: ${item}`)
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
              `You have placed an order for ${itemSelected}\n ${botGuide()}`
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
            // Once order is successfully placed, remove the current order
            delete socket.session.currentOrder;
          } else {
            socket.emit('welcome', `No order placed. please place an order`);
          }
          break;
        case '98':
          if (!orderHistory.length) {
            socket.emit('welcome', 'No previous orders');
          } else {
            console.log(orderHistory);
            const orderHistoryToStringMethod = orderHistory.map(
              (item, index) => {
                // check if items order is more than one, for a customised message
                if (item.length > 1) {
                  return `Below are your orders: ${index + 1} : ${item.join(
                    ', '
                  )}\n`;
                } else {
                  return `Below is your order: ${index + 1} : ${item.join(
                    ' '
                  )}\n`;
                }
              }
            );
            socket.emit(
              'welcome',
              `order history:\n ${orderHistoryToStringMethod}`
            );
          }
          break;
        case '97':
          if (
            socket.session.currentOrder &&
            socket.session.currentOrder.length
          ) {
            // check if current order is more than one, for a customised message
            console.log(socket.session.currentOrder);
            if (socket.session.currentOrder.length > 1) {
              socket.emit(
                'welcome',
                `Your current orders are:\n ${socket.session.currentOrder.join(
                  ', '
                )}\n`
              );
            } else {
              socket.emit(
                'welcome',
                `Your current order:\n ${socket.session.currentOrder.join(
                  ', '
                )}\n`
              );
            }
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
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

module.exports = {
  app,
  server,
};

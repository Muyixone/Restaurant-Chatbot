const session = require('express-session');

const sessionMiddleware = session({
  secret: 'somerandomshit',
  resave: false,
  saveUninitialized: false,
});

//convert a connected middleware to socket.io middleware
const wrap = (expressMiddleware) => (socket, next) =>
  expressMiddleware(socket.request, {}, next);

module.exports = { sessionMiddleware, wrap };

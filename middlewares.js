const session = require('express-session');
const fileStore = require('session-file-store')(session);
require('dotenv').config();

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  store: new fileStore({}),
});

//convert a connected middleware to socket.io middleware
const wrap = (expressMiddleware) => (socket, next) =>
  expressMiddleware(socket.request, {}, next);

module.exports = { sessionMiddleware, wrap };

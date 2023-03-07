const { app, server } = require('./index');

server.listen(4800, () => {
  console.log('Server listening');
});

const { server } = require('./index');
require('dotenv').config();

server.listen(process.env.PORT, () => {
  console.log('Server listening');
});

const dayjs = require('dayjs');

// Function to display order method
const botGuide = () => {
  let items = [
    'Press 1: To place an order For a list of our cuisines.',
    'Press 99: To confirm an order.',
    'Press 98: To see order history.',
    'Press 97: To see current order.',
  ];
  return items.join('\n');
};

// Greet the user with time
const greetFunc = (user, callback) => {
  let currentTime = dayjs();
  let currentHour = currentTime.hour();

  if (currentHour < 12) {
    return [`Good Morning ${user}\n ${callback()}`];
  } else if (currentHour > 12 && currentHour < 18) {
    return [`Good Afternoon ${user}\n ${callback()}`];
  } else {
    return [`Good Evening ${user}\n ${callback()}`];
  }
};

module.exports = { botGuide, greetFunc };

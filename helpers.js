const crypto = require("crypto");

// Check if an email address exists - return user
const getUserByEmail = (email, database) => {
  for (const id in database) {
    const user = database[id];
    if (email === user.email) {
      return user;
    }
  }
};

// Check if a user is logged in.
const userIsLoggedIn = (userID, database) => {
  if (database[userID]) {
    return true;
  }
  return false;
};

// Display URLs that belong to users
const onlyDisplayLoggedinUsersURLS = (user, database) => {
  const newObj = {};
  for (const key in database) {
    if (database[key].userId === user) {
      newObj[key] = database[key].longURL;
    }
  }
  return newObj;
};

// check if address contains HTTP:// or HTTPS://, if not, add HTTP:// to it
const checkIfHttpExists = (input) => {
  if (!input.startsWith('http') && !input.startsWith('https')) {
    return input = 'http://' + input;
  } else {
    return input;
  }
};

const generateRandomString = () => {
  return crypto.randomBytes(3).toString('hex');
};

const alertMessage = (message) => {
  return message;
};

module.exports = { getUserByEmail, userIsLoggedIn, alertMessage, onlyDisplayLoggedinUsersURLS, checkIfHttpExists, generateRandomString };
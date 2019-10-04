const { assert } = require('chai');


const {
  getUserByEmail,
  userIsLoggedIn,
  onlyDisplayLoggedinUsersURLS,
  checkIfHttpExists,
  generateRandomString
} = require('../helpers');


const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "userRandomID" },
  "sgq3y": { longURL: "http://www.google.com", userId: "user2RandomID", counter: 0 }
};

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};



describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);

    const expectedOutput = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    };

    assert.deepEqual(user, expectedOutput);
  });
});

describe('userIsLoggedin', function() {
  it('should return true is user is logged in', function() {

    const input = userIsLoggedIn("user2RandomID", testUsers);
    const expectedOutput = true;

    assert.equal(input, expectedOutput);
  });
});


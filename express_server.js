const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const crypto = require("crypto");
const bcrypt = require('bcrypt');


const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["goddog"],

  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// users
const users = {
  "userRandomID": {
    id: "userRandomID",
    username: "greenFox",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "sgq3y6": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// test database
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "userRandomID" },
  "sgq3y": { longURL: "http://www.google.com", userId: "user2RandomID" }
};


// check if address contains HTTP:// or HTTPS://, if not, add HTTP:// to it
const checkIfHttpExists = (input) => {
  if (!input.startsWith('http') && !input.startsWith('https')) {
    return input = 'http://' + input;
  } else {
    return input;
  }
};

// Check if an email address exists - return true/false
const getUserByEmail = (email) => {
  for (const id in users) {
    const user = users[id];
    if (email === user.email) {
      return user;
    }
  }
};

app.post("/register", (req, res) => {
  const uniqueID = generateRandomString();
  // check if fields are empty
  if (req.body.email.length === 0 || req.body.password.length === 0 || req.body.username.length === 0) {
    console.log("ERROR 400");
    res.status(400).send('ERROR 400 - EMPTY FIELDS');
  } else {
    // Check if email is in the database
    if (getUserByEmail(req.body.email)) {
      console.log("ERROR 400");
      res.status(400);
      res.send('ERROR 400 - EMAIL ALREADY EXISTS');
    } else {
      users[uniqueID] = {
        id: uniqueID,
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      };
      req.session.user_id = uniqueID;
      res.redirect("/urls");
    }
  }
});

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email);
  if (!user) {
    res.status(403);
    res.send('ERROR 403 - NO SUCH EMAIL');
  } else {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id;
      res.redirect("/urls/");
    } else {
      res.status(403);
      res.send('ERROR 403 - PASSWORD INCORRECT');
    }
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls/");
});

app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  const address = checkIfHttpExists(req.body.longURL);
  let objectDetails = { longURL: address, userId: req.session.user_id };
  urlDatabase[randomString] = objectDetails;
  res.redirect("/urls/" + randomString);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (userIsLoggeedIn(req.session.user_id)) {
    delete urlDatabase[req.params.shortURL];
  } else {
    res.status(403).end();
  }
  res.redirect("/urls/");
});

app.post("/urls/:shortURL", (req, res) => {
  if (userIsLoggeedIn(req.session.user_id)) {
    urlDatabase[req.params.shortURL]["longURL"] = [checkIfHttpExists(req.body.newURL)];
  } else {
    res.status(403).end();
  }
  res.redirect("/urls/");
});


const generateRandomString = () => {
  return crypto.randomBytes(3).toString('hex');
};

const onlyDisplayLoggedinUsersURLS = (user) => {
  const newObj = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userId === user) {
      newObj[key] = urlDatabase[key].longURL;
    }
  }
  return newObj;
};

const userIsLoggeedIn = (userID) => {
  if (users[userID]) {
    return true;
  }
  return false;
};

// template variables
const getTemplateVars = (req) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  const user = users[userId];
  const longURL = urlDatabase[shortURL];
  const id = urlDatabase[shortURL];

  let templateVars = {
    urls: onlyDisplayLoggedinUsersURLS(userId),
    user: user,
    shortURL: shortURL,
    longURL: longURL,
    userId: id,
    loggedin: userIsLoggeedIn(userId)
  };
  return templateVars;
};

app.get("/login", (req, res) => {
  res.render("login", getTemplateVars(req));
});

app.get("/urls", (req, res) => {
  res.render("urls_index", getTemplateVars(req));
});

app.get("/register", (req, res) => {
  res.render("urls_registration", getTemplateVars(req));
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    res.render("urls_new", getTemplateVars(req));
  } else {
    res.render("login", getTemplateVars(req));
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userId) {
    res.render("urls_show", getTemplateVars(req));
  } else {
    res.redirect("/");
  }
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
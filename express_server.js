const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
// helper functions
const {
  getUserByEmail,
  userIsLoggedIn,
  onlyDisplayLoggedinUsersURLS,
  checkIfHttpExists,
  generateRandomString,
  alertMessage
} = require('./helpers');

const app = express();
const PORT = 8080;


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["goddog"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// User database
const users = {};

// URL database
const urlDatabase = {};

// template variables
const getTemplateVars = (req, err) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  const user = users[userId];
  const longURL = urlDatabase[shortURL];
  if (!err) {
    err = {};
  }
  let templateVars = {
    urls: onlyDisplayLoggedinUsersURLS(userId, urlDatabase),
    user: user,
    shortURL: shortURL,
    longURL: longURL,
    alertMessage: err,
    //statusCode: statusCode,
    loggedin: userIsLoggedIn(userId, users)
  };
  return templateVars;
};

// Post routes.

app.post("/register", (req, res) => {
  const uniqueID = generateRandomString();
  // check if fields are empty
  if (req.body.email.length === 0 || req.body.password.length === 0) {
    res.status(400);
    res.render("urls_registration", getTemplateVars(req, alertMessage('EMPTY FIELDS', 400)));
  } else {
    // Check if email is in the database
    if (getUserByEmail(req.body.email, users)) {
      res.status(400);
      res.render("urls_registration", getTemplateVars(req, alertMessage('EMAIL ALREADY EXISTS', 400)));
    } else {
      users[uniqueID] = {
        id: uniqueID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      };
      req.session.user_id = uniqueID;
      res.redirect("/urls");
    }
  }
});

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (!user) {
    res.status(403);
    res.render("login", getTemplateVars(req, alertMessage('NO SUCH EMAIL', 403)));
  } else {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id;
      res.redirect("/urls/");
    } else {
      res.status(403);
      res.render("login", getTemplateVars(req, alertMessage('INCORRECT PASSWORD', 403)));
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
  if (urlDatabase[req.params.shortURL]) {
    if (userIsLoggedIn(req.session.user_id, users)) {
      delete urlDatabase[req.params.shortURL];
    } else {
      res.status(403).end();
    }
    res.redirect("/urls/");
  } else {
    res.status(403).end();
  }
}
);

app.post("/urls/:shortURL", (req, res) => {
  if (userIsLoggedIn(req.session.user_id, users)) {
    urlDatabase[req.params.shortURL]["longURL"] = [checkIfHttpExists(req.body.newURL)];
  } else {
    res.status(403).end();
  }
  res.redirect("/urls/");
});

// Get routes

app.get("/login", (req, res) => {
  res.render("login", getTemplateVars(req));
});

app.get("/urls", (req, res) => {
  if (userIsLoggedIn(req.session.user_id, users)) {
    res.render("urls_index", getTemplateVars(req));
  } else {
    res.status(403);
    res.render("login", getTemplateVars(req, alertMessage('You must be logged in!', 403)));
  }
});

app.get("/register", (req, res) => {
  res.render("urls_registration", getTemplateVars(req));
});

app.get("/urls/new", (req, res) => {
  if (userIsLoggedIn(req.session.user_id, users)) {
    res.render("urls_new", getTemplateVars(req));
  } else {
    res.status(403);
    res.render("login", getTemplateVars(req, alertMessage('You must be logged in!', 403)));
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    if (req.session.user_id === urlDatabase[req.params.shortURL].userId) {
      res.render("urls_show", getTemplateVars(req));
    } else {
      res.status(403);
      res.render("urls_index", getTemplateVars(req, alertMessage("Hey BUDDY!!! That's not yours!", 403)));
    }
  } else {
    res.status(403);
    res.render("urls_index", getTemplateVars(req, alertMessage("Hey BUDDY!!! Shouldn't you be logged in for that?", 403)));
  }
});

app.get("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    if (req.session.user_id === urlDatabase[req.params.shortURL].userId) {
      res.render("urls_show", getTemplateVars(req));
    } else {
      res.status(403);
      res.render("login", getTemplateVars(req, alertMessage("Hey BUDDY!!! That's not yours!", 403)));
    }
  } else {
    res.status(403);
    res.render("login", getTemplateVars(req, alertMessage("Hey BUDDY!!! Shouldn't you be logged in for that?", 403)));
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.status(403);
    res.render("login", getTemplateVars(req, alertMessage('That link is broken 😢', 403)));
  }
});

app.get("/", (req, res) => {
  res.redirect("register");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
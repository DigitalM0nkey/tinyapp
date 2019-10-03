const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const crypto = require("crypto");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// users

const users = {
  "userRandomID": {
    id: "userRandomID",
    username: "greenFox",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// check if address contains HTTP:// or HTTPS://, if not, add HTTP:// to it
const checkIfHttpExists = (input) => {
  if (!input.startsWith('http') || !input.startsWith('https')) {
    return input = 'http://' + input;
  } else {
    return input;
  }
};

// Check if an email address exists - return true/false
const getUserByEmail = (email) => {
  for (const id in users) {
    //   console.log("email: ", email);
    const user = users[id];
    if (email === user.email) {
      //    console.log("DATABASE TRUE: ", user);
      return user;
    } else {
      //  console.log("DATABASE FALSE: ", user);
    }
  }
};
console.log(getUserByEmail("user2@example.com"));

app.post("/register", (req, res) => {
  const uniqueID = generateRandomString();
  // check if fields are empty
  if (req.body.email.length === 0 || req.body.password.length === 0 || req.body.username.length === 0) {
    console.log("ERROR 400");
    res.status(400);
    res.send('ERROR 400');
  } else {
    // Check if email is in the database
    if (getUserByEmail(req.body.email)) {
      console.log("ERROR 400");
      res.status(400);
      res.send('ERROR 400');
    } else {
      users[uniqueID] = {
        id: uniqueID,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      };
      res.cookie('user_id', uniqueID);
      console.log(users);
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
    console.log("user.password = ", user.password, "   User =  ", req.body.password);

    if (user.password !== req.body.password) {
      res.status(403);
      res.send('ERROR 403 - PASSWORD INCORRECT');
    } else {
      res.cookie('user_id', user.id);
      res.redirect("/urls/");
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls/");
});

app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  const address = checkIfHttpExists(req.body.longURL);
  console.log("req.body : ", req.body);  // Log the POST request body to the console
  urlDatabase[randomString] = address;
  res.redirect("/urls/" + randomString);
  // res.send(urls);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls/");
});

app.post("/urls/:shortURL", (req, res) => {
  console.log(req.body.newURL);
  urlDatabase[req.params.shortURL] = [checkIfHttpExists(req.body.newURL)];
  res.redirect("/urls/");
});


const generateRandomString = () => {
  return crypto.randomBytes(3).toString('hex');
};

// console.log(generateRandomString());

const getTemplateVars = (req) => {
  const userId = req.cookies["user_id"];
  const shortURL = req.params.shortURL;
  console.log(userId);
  const user = users[userId];
  let templateVars = {
    urls: urlDatabase,
    user: user,
    shortURL: shortURL,
    longURL: urlDatabase[shortURL]
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
  res.render("urls_new", getTemplateVars(req));
});

app.get("/urls/:shortURL", (req, res) => {
  res.render("urls_show", getTemplateVars(req));
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
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
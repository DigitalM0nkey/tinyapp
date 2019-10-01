const express = require("express");
const crypto = require("crypto");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const checkIfHttpExists = (input) => {
  if (!input.startsWith('http') || !input.startsWith('https')) {
    return input = 'http://' + input;
  } else {
    return input;
  }
};


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


const generateRandomString = () => {
  return crypto.randomBytes(3).toString('hex');
};

// console.log(generateRandomString());


app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL]/* What goes here? */ };
  res.render("urls_show", templateVars);
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
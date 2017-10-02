var express = require("express");
var app = express(); //express now is a function
var PORT = process.env.PORT || 8080;
var bodyParser = require("body-parser")//access POST request parameters e.g. req.body.longURL
var cookieParser = require('cookie-parser');

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {
  "userRandomID": {
    username: "abd",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    username: "123",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}
function generateRandomString() {//***whats the limitation
  var shortURL = "" ;
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++)
    shortURL += possible.charAt(Math.floor(Math.random() * possible.length));
  return shortURL;
}
function generateRandomUsersId() {
  var usersRandomId = "" ;
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++)
    usersRandomId += possible.charAt(Math.floor(Math.random() * possible.length));
  return usersRandomId;
}
function checkforEmail(emailToCheck){
  for (user in users){
    if (users[user].email === emailToCheck) {
      return true;
    }
  }
  return false;
}
function checkforUsername(UsernameToCheck){
  for (user in users){
    if (users[user].username === UsernameToCheck) {
      return user;
    }
  }
  return false;
}
function checkforPassword(PasswordToCheck){
  for (user in users){
    if (users[user].password === PasswordToCheck) {
      return user;
    }
  }
  return false;
}

app.get("/", (req, res) => {
  res.end("<html><center>Hello!</center></html>"); //can be a string or HTML
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); //is an object
});

//REGISTRATION
app.get("/urls/register", (req, res) => {
  let templateVars = {
    username: req.cookies.username,
  };
  res.render("urls_regist", templateVars);
});

//HOME page - Library
app.get("/urls", (req, res) => {
  let randomId = generateRandomUsersId()
  let user = checkforUsername(req.cookies.username)
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies.username,
    user: user,
  };
  res.render("urls_index", templateVars);
});

//long URLs FORM submission page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: req.cookies.users,
    username: req.cookies.username,
  };
  res.render("urls_new", templateVars);
});

//Editing a single shortened URL
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies.username,
  };
  res.render("urls_show", templateVars);
});

//redirecting shortURL to longURL page
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]//req.params to grab the generated shortURL
  let templateVars = {
    username: req.cookies.username,
  };
  res.redirect(longURL);
});

/************************POST Request******************************/

//POST form request add to the library on /urls
app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL;//from urls_new.ejs form
  res.redirect("/urls");
});

//DELETE
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id] //deleting the value = delete the item from obj
  res.redirect("/urls");
});

//COOKIE
app.post("/urls/login", (req, res) => {

  if(req.body.username.length < 1 || req.body.password.length < 1 ){
    res.redirect("/urls/register");
    //register with an existing user's email,
  } else if(!(checkforUsername(req.body.username)) || !(checkforPassword(req.body.password))){
    res.redirect("/urls/register");
  } else if(checkforUsername(req.body.username) && checkforPassword(req.body.password)){
    res.cookie("username", req.body.username);
    res.redirect("/urls");
  }
});

//Logout
app.post("/urls/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

//REGISTRATION HANDLER
app.post("/urls/register", (req, res) => {
  let newUserId = generateRandomUsersId()

  if(req.body.email.length < 1 || req.body.password.length < 1 ){
    res.status(400).send('please input something!');

    //register with an existing user's email,
  } else if(checkforEmail(req.body.email)){
    res.status(400).send('please input another email!');
  } else {
    users[newUserId] = {
      id: newUserId,
      email: req.body.email,
      password: req.body.password
    }
  }
  //console.log("yayyyyy" + JSON.stringify(users));
  res.cookie("username", newUserId);
  res.redirect("/urls");
});

//UPDATE PLACEHOLDER >:id needs to be in the bottom
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.update
  res.redirect("/urls");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

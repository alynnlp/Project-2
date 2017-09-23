//I am working with express and ejs, from the Node_module
// what send to the server will not be displayed to the browser as a reponse
// so we need to set the request as a variable = templateVARS
var express = require("express");
var cookieParser = require('cookie-parser');
var app = express(); //express now is a function
var PORT = process.env.PORT || 8080; // default port 8080, to listen to it so we can view on browser
app.set("view engine", "ejs") //template needs a template engine
//Middleware - access POST request parameters e.g. req.body.longURL
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//req.body.longURL >> which we will store in a var = urlDatabase (later)
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

function generateRandomString() {
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
    if (user.email === emailToCheck) {
      return true;
    }
  return false;
  }
}
function checkforUsername(UsernameToCheck){
  for (user in users){
    if (user.username === UsernameToCheck) {
      return user;
    }
  }
  return false;
}

//at registers a handler on the root path, "/".
app.get("/", (req, res) => {
  res.end("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); //is an object
});

app.get("/urls", (req, res) => {
  let randomId = generateRandomUsersId()
  let user = checkforUsername(req.cookies.username)
  let templateVars = {
    urls: urlDatabase,
    user: user,
    userObject: users[1]
  };
  res.render("urls_index", templateVars);
});

//FORM page
app.get("/urls/new", (req, res) => {
  let templateVars = { user: req.cookies.users,
  };
  res.render("urls_new", templateVars);
});

//REGISTRATION
app.get("/urls/register", (req, res) => {
  let templateVars = {
    username: req.cookies.username}
    //userObject: users[1]};
  res.render("urls_regist", templateVars);
});

app.get("/urls/:id", (req, res) => {
  //:id in this case = <%=shortURL%>
  let templateVars = { shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies.username,
    userObject: users[1]};
    console.log(templateVars);
  res.render("urls_show", templateVars);
});

//your server will need to send a response back to the client.
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});
/******************************************************/

//template that we created uses method="post". POST request to submit form data.
app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
//adding the new generated string to the object once I submitted the longURL
  urlDatabase[generateRandomString()] = req.body.longURL; //where I call the generated short string
  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

//DELETE: form only support get and post, so post will do the delete operation
// to remove existing shortened URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect("/urls");
});

//COOKIE
app.post("/urls/login", (req, res) => {
  res.cookie("user", req.body.username);
  res.redirect("/urls");
});

app.post("/urls/logout", (req, res) => {
  res.clearCookie('user');
  res.redirect("/urls");
});

//REGISTRATION HANDLER
app.post("/urls/register", (req, res) => {
  let newUserId = generateRandomUsersId()

  if(req.body.email.length < 1 || req.body.password.length < 1 ){
    res.sendStatus(400).send('please input something!');

    //register with an existing user's email,
  } else if(checkforEmail(req.body.email)){
    res.sendStatus(400).send('please input another email!');
  } else {
    users[newUserId] = {
      id: newUserId,
      email: req.body.email,
      password: req.body.password
    }
  }
  //console.log("yayyyyy" + JSON.stringify(users));
  res.cookie("user_id", newUserId);
  res.redirect("/urls");

});

//UPDATE rmb this has a PLACEHOLDER for POST
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.update
  res.redirect("/urls");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

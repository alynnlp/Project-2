//I am working with express and ejs, i need to requrie it from the Node_module
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

function generateRandomString() {
  var shortURL = "" ;
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++)
    shortURL += possible.charAt(Math.floor(Math.random() * possible.length));
  return shortURL;
}

//at registers a handler on the root path, "/".
app.get("/", (req, res) => {
  res.end("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); //is an object
});
// //html is not able to show
// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello<b>World</b></body></html>");
// });

//***(1)this will first give me a blank page until I add something in the body of the ejs template
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
    username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

//FORM page
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

//a second route
// what send to the server will not be displayed to the browser as a reponse
// so we need to set the request as a variable = templateVARS
//
app.get("/urls/:id", (req, res) => {
  //req.params is grabbing the end point of the link above
  //:id in this case = <%=shortURL%>
  let templateVars = { shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
      username: req.cookies["username"]};
      console.log(templateVars);
  res.render("urls_show", templateVars);
});

//template that we created uses method="post". POST request to submit form data.
//This corresponds with the app.post(...) on the server-side code!
app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
//adding the new generated string to the object once I submitted the longURL
  urlDatabase[generateRandomString()] = req.body.longURL; //where I call the generated short string
  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

//your server will need to send a response back to the client.
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

//DELETE: form only support get and post, so post will do the delete operation
// to remove existing shortened URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect("/urls");
});

//set cookie
app.post("/urls/login", (req, res) => {
  //right is where it coming from
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});
//logout
app.post("/urls/logout", (req, res) => {
  res.clearCookie('username', {path:'/urls/logout' });
  res.redirect("/urls");
});

//UPDATE:
app.post("/urls/:id", (req, res) => {
  //right is where it coming from
  urlDatabase[req.params.id] = req.body.update
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

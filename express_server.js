const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

//define url database
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  "9sm5xK": {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//set view engine and middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//generate a random short url id
function generateRandomString() {
  const length = 6;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// post route for login
app.post("/login", (req, res) => {
  const { userID } = req.body;
  res.cookie("username", userID);
  res.redirect("/urls");
});

// POST route to remove URL
app.post("/urls/:id/delete", (req, res) => {
  const shortID = req.params.id;
  if (urlDatabase[shortID]) {
    delete urlDatabase[shortID];
    res.redirect("/urls");
  } else {
    // If the URL does not exist
    res.status(404).send("URL not found");
  }
});

//updates URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.newLongURL;
  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(404).send("URL not found");
  }
  const loggedInUserID = req.cookies.user;
  if (!loggedInUserID) {
    return res.status(401).send("You are not logged in.");
  }
  if (url.userID !== loggedInUserID) {
    return res.status(403).send("You do not own this URL.");
  }
  url.longURL = newLongURL;
  res.redirect("/urls");
});

function urlsForUser(id) {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
}

//pass in the username
app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urlsForUser: urlsForUser(req.cookies["username"]),
  };
  res.render("urls_index", templateVars);
});

// GET route to show page
app.get("/urls/new", (req, res) => {
  if (req.cookies.user) {
    res.render("urls_new");
  } else {
    return res.redirect("/login");
  }
});

//new route to render urls_show.ejs
app.get("/urls/:id", (req, res) => {
  const userID = req.params.id;
  const urlEntry = urlDatabase[userID];

  if (!req.cookies.userId) {
    return res.status(401).send("You are not logged.");
  }
  if (urlEntry.userId !== req.cookies.userId) {
    return res.status(403).send("You do not own this URL.");
  }
  const templateVars = {
    id: userID,
    longURL: urlEntry.longURL,
    user: req.cookies.user,
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

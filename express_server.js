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

//get/post to edit URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.newLongURL;
  if (urlDatabase.hasOwnProperty(id)) {
    urlDatabase[id].longURL = newLongURL;
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found");
  }
});

app.get("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const urlData = urlDatabase[id];
  if (urlData) {
    res.render("urls_show", {
      id: id,
      longURL: urlData.longURL,
      shortURL: urlData.short,
    });
  } else {
    res.status(404).send("URL not found");
  }
});

app.get("/urls/:id", (req, res) => {
  const username = req.cookies.username;
  const urlData = urlDatabase[req.params.id];
  if (!urlData) {
    return res.status(404).send("URL not found");
  }
  res.render("urls_show", { url: urlData, username: username });
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

// Function to get URLs for a specific user
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
    username: req.cookies.username,
    urls: urlDatabase,
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
  const username = req.params.id;
  const urlData = urlDatabase[username];

  if (!req.cookies.user) {
    return res.status(401).send("You are not logged in.");
  }
  if (urlData.username !== req.cookies.user) {
    return res.status(403).send("You do not own this URL.");
  }
  const templateVars = {
    id: username,
    longURL: urlData.longURL,
    user: req.cookies.user,
  };
  res.render("urls_show", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const shortID = req.params.id;
  const longURL = urlDatabase[shortID];
  const templateVars = { id: shortID, longURL: longURL };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

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
  const { username } = req.body;
  res.cookie("username", username);
  res.redirect("/urls");
});

// POST route to remove URL
app.post("/urls/:id/delete", (req, res) => {
  const shortID = req.params.id;
  if (urlDatabase[shortID]) {
    delete urlDatabase[shortID].longURL;
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
  if (url) {
    url.longURL = newLongURL;
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found");
  }
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
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

// GET route to show page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//new route to render urls_show.ejs
app.get("/urls/:id", (req, res) => {
  const givenID = req.params.id;
  const urlEntry = urlDatabase[shortID];

  if (!req.session.userId) {
    return res.status(401).send("You are not logged in.");
  }
  if (urlEntry.ownerId !== req.session.userId) {
    return res.status(403).send("You do not own this URL.");
  }
  const templateVars = {
    id: givenID,
    longURL: urlEntry.longURL,
    user: req.session.user,
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

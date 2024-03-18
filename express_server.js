const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const { getUserByEmail } = require("./helpers.js");

const app = express();
const PORT = 8080;

//define url database
const urlDatabase = {
  b6UTxQ: {
    longUrl: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longUrl: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
  user3RandomID: {
    id: "user3RandomID",
    email: "bob@example.com",
    password: bcrypt.hashSync("password", 10),
  },
};

//set view engine and middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

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

//Get route, redirect for login status
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// // redirect logged in users
const loggedIn = (req, res, next) => {
  const user_id = req.session.user_id;
  if (user_id) {
    next();
  } else {
    res.status(403).send("You must be logged in to access this page.");
  }
};

// get register route
app.get("/register", (req, res) => {
  res.render("register");
});

// Post register endpoint
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  const saltRounds = 10;
  const hashedPassword = bcrypt.hashSync(password, saltRounds);

  if (!hashedPassword) {
    return res.status(500).send("Error hashing password");
  }
  if (!email || !password) {
    return res.status(400).send("Email or password missing");
  }
  for (const userId in users) {
    if (users[userId].email === email) {
      return res.status(400).send("Email already in use");
    }
  }

  // Create a new user object
  const userID = generateRandomString();
  const newUser = {
    id: userID,
    email,
    password: hashedPassword,
  };
  users[userID] = newUser;
  req.session.user_id = userID;
  res.redirect("/urls");
});

// post route for login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if (!user) {
    return res.status(403).send("User not found.");
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Wrong password.");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

//get route for login
app.get("/login", (req, res) => {
  res.render("login");
});

// GET route to show page
app.get("/urls/new", loggedIn, (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];

  const templateVars = {
    user: user,
  };

  if (!user_id) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

// POST route to remove URL
app.post("/urls/:id/delete", loggedIn, (req, res) => {
  const shortID = req.params.id;
  const urlData = urlDatabase[shortID];
  const user_id = req.session.user_id;

  if (!urlData) {
    return res.status(404).send("URL not found");
  }
  if (urlData.userID !== user_id) {
    return res.status(403).send("You do not own this URL.");
  }
  delete urlDatabase[shortID];
  res.redirect("/urls");
});

//get/post to edit URL
app.post("/urls/:id/edit", (req, res) => {
  const shortUrl = req.params.id;
  const newLongUrl = req.body.newLongUrl;
  const url = urlDatabase[shortUrl];

  if (!url) {
    return res.status(404).send("URL not found");
  }
  const loggedInUserID = req.session.user_id;

  if (!loggedInUserID) {
    return res.status(401).send("You are not logged in.");
  }
  if (url.userID !== loggedInUserID) {
    return res.status(403).send("You do not own this URL.");
  }
  url.longUrl = newLongUrl;
  res.redirect("/urls");
});

app.get("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const urlData = urlDatabase[id].longUrl;

  if (urlData) {
    res.render("urls_show", {
      id: id,
      longUrl: urlData,
      shortUrl: id,
    });
  } else {
    res.status(404).send("URL not found");
  }
});

app.get("/urls/:id", loggedIn, (req, res) => {
  const user_id = req.session.user_id;
  const urlData = urlDatabase[req.params.id];

  if (!urlData) {
    return res.status(404).send("URL not found");
  }
  if (!user_id) {
    return res.status(401).send("Please log in to see URL");
  }
  if (url.userID !== user_id) {
    return res.status(403).send("You do not own this URL.");
  }
  res.render("urls_show", { url: urlData, user_id: user_id });
});

// Function to get URLs for a specific user
function urlsForUser(id) {
  const userUrls = {};

  for (const shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === id) {
      userUrls[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return userUrls;
}

//pass in the user ID
app.get("/urls", loggedIn, (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];

  if (!user) {
    return res.status(403).send("You must be signed in.");
  }
  const templateVars = {
    user: user,
    urls: urlsForUser(user_id),
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", loggedIn, (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  const longUrl = req.body.longUrl;
  const shortUrl = generateRandomString();

  if (!longUrl) {
    res.status(400).send("URL cannot be empty.");
  }

  urlDatabase[shortUrl] = {
    longUrl: longUrl,
    userID: user_id,
  };

  res.redirect("/urls");
});

//new route to render urls_show.ejs
app.get("/urls/:id", (req, res) => {
  const userData = users[req.session.user_id];
  const urlData = urlDatabase[req.params.id];

  if (!req.session.user_id) {
    return res.status(401).send("You are not logged in.");
  }
  if (urlData.userID !== req.session.user_id) {
    return res.status(403).send("You do not own this URL.");
  }
  const templateVars = {
    id: req.session.user_id,
    longUrl: urlData.longUrl,
    user: req.session.user_id,
  };
  res.render("urls_show", templateVars);
});

//post to logout and clear cookies
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

module.exports = app;

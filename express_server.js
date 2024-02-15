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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
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

// redirect logged in users
const loggedIn = (req, res, next) => {
  const user_id = req.cookies.user_id;
  if (user_id) {     
    res.redirect('/urls');
  } else {
    res.status(403).send("You must be logged in to access this page.");
  }
};


// post route for login
app.post("/login", (req, res) => {
  const { userID } = req.body;
  const getUserByEmail(email);
if (!user) {
  return res.status(403).send("User not found."); 
}
if (user,password !== password) {
  return res.status(403).send("Wrong password.");
}
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

//get route for login
app.get("/login", loggedIn, (req, res) => {
  res.render("login");
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
  const user_id = req.cookies.user_id;
  const urlData = urlDatabase[req.params.id];
  if (!urlData) {
    return res.status(404).send("URL not found");
  }
  res.render("urls_show", { url: urlData, user_id: user_id });
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

//pass in the user ID
app.get("/urls", loggedIn, (req, res) => {
const user_id = req.cookies.user_id;
  const user = users[user_id];
  if (!user) {
    return res.status(403).send("You must be signed in.");
  }
  const templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
}
);

// GET route to show page
app.get("/urls/new", loggedIn, (req, res) => {
const user_id = req.cookies.user_id;
  if (!user_id) {
    return res.redirect("/login");
  }
    res.render("urls_new");
});

//new route to render urls_show.ejs
app.get("/urls/:id", (req, res) => {
  const users[req.cookies.user_id];
  const urlData = urlDatabase[req.params.id];
  if (!req.cookies.user) {
    return res.status(401).send("You are not logged in.");
  }
  if (urlData.user_id !== req.cookies.user) {
    return res.status(403).send("You do not own this URL.");
  }
  const templateVars = {
    id: user_id,
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

//post to logout and clear cookies
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//GET register user
app.get('/register', loggedIn, (req, res) => {
  res.render('register');
});

// check for current users' email
function getUserByEmail(email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

//Post register endpoint
app.post("/register", (req, res) => {
  const { email, password } = req.body;
   if (!email || !password) {
    return res.status(400).send("Email or password missing");
  }
    for (const userId in users) {
    if (users[userId].email === email) {
      return res.status(400).send("Email already in use");
    }
  }
  // Generate a random user ID
  const userID = generateRandomString();
  // Create a new user object
  const newUser = {
    id: userID,
    email,
    password,
  };
  users[userID] = newUser;
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

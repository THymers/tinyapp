const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080; // default port 8080

//define url database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
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
const loggedIn = (req, res) => {
  const user_id = req.cookies.user_id;
  
  if (user_id) {     
    res.redirect('/urls');
  } else {
    res.status(403).send("You must be logged in to access this page.");
  }
};


// post route for login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);

  if (!user) {
  return res.status(403).send("User not found."); 
}
if (user.password !== password) {
  return res.status(403).send("Wrong password.");
}
 if (!bcrypt.compareSync(password, user.password)) {
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
app.post("/urls/:id/delete", loggedIn, (req, res) => {
  const shortID = req.params.id;
  const urlData = urlDatabase[shortID];
  const user_id = req.cookies.user_id;
  
  if (!urlData) {
    return res.status(404).send("URL not found");
  }
  if (!user_id) {
    return res.status(401).send("Please log in to see URL");
  }
if (url.userID !== user_id) {
    return res.status(403).send("You do not own this URL.");
}
  }
  delete urlDatabase[shortID];
  res.redirect("/urls");
);

//get/post to edit URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongUrl = req.body.newLongUrl;
  
  if (urlDatabase.hasOwnProperty(id)) {
    urlDatabase[id].longUrl = newLongUrl;
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found");
  }
});

app.get("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const urlData = urlDatabase[id].longUrl;
  
  if (urlData) {
    res.render("urls_show", {
      id: id,
      longURL: urlData.longUrl,
      shortURL: urlData.short,
    });
  } else {
    res.status(404).send("URL not found");
  }
});

app.get("/urls/:id", loggedIn, (req, res) => {
  const user_id = req.cookies.user_id;
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

//updates URL
app.post("/urls/:shortURL", (req, res) => {
  const shortUrl = req.params.shortUrl;
  const newLongUrl = req.body.newLongUrl;
  const url = urlDatabase[shortUrl];
  
  if (!url) {
    return res.status(404).send("URL not found");
  }
  const loggedInUserID = req.cookies.user_id;
  
  if (!loggedInUserID) {
    return res.status(401).send("You are not logged in.");
  }
  if (url.userID !== loggedInUserID) {
    return res.status(403).send("You do not own this URL.");
  }
  url.longURL = newLongUrl;
  res.redirect("/urls");
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
  if (!req.cookies.user_id) {
    return res.status(401).send("You are not logged in.");
  }
  if (urlData.userID !== req.cookies.user_id) {
    return res.status(403).send("You do not own this URL.");
  }
  const templateVars = {
    id: req.cookies.user_id,
    longURL: urlData.longUrl,
    user: req.cookies.user,
  };
  res.render("urls_show", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const shortID = req.params.id;
  const longUrl = urlDatabase[shortID];
  const templateVars = { id: shortID, longUrl: longUrl };
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

  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  let hashedPassword = bcrypt.hashSync(password, salt);
const newPassword = bcrypt.compareSync(password, hashedPassword);
    
if (err) {
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
  // Generate a random user ID
  const userID = generateRandomString();
  // Create a new user object
  const newUser = {
    id: userID,
    email,
    password: hashedPassword,
  };
  users[userID] = newUser;
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
// GET route to show form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
//New route to render urls_show.ejs
app.get("/urls/:id", (req, res) => {
  const shortID = req.params.id;
  const longURL = urlDatabase[shortID]; // Accessing the long URL using the short ID from urlDatabase
  const templateVars = { id: shortID, longURL: longURL };
  res.render("urls_show", templateVars);
});

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });
// //additional endpoints
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });
// //send HTML code
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

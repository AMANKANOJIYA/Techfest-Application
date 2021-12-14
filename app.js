require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const router = require('./routes/routes');
const app = express();

app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(bodyParser.urlencoded());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

app.use('/', router);

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect("/profile");
  });
  res.redirect(`/`);
});

app.listen(process.env.PORT, () => console.log(`Server is listening on port ${process.env.PORT}`));

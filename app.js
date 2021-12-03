require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const app = express();
const appId = process.env.APPID;

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/views"));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: Date.now() + 24 * 60 * 60 * 1000,
    },
  })
);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  const state = crypto.randomBytes(12).toString("hex");
  req.session.state = state;
  res.redirect(
    `${process.env.MIC_URL}/appId=${appId}&sensitive=false&state=${state}`
  );
});

app.post("/callback", (req, res) => {
  const token = req.body.token || req.query.token;
  if (!token) {
    res.redirect("/");
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    if (decoded.appId !== appId && decoded.state !== req.session.state) {
      res.redirect("/");
    }
    req.session.user = decoded.userInfo;
    req.session.save();
  } catch (err) {
    res.redirect("/");
  }
  res.redirect("/profile");
});

app.get("/callback", (req, res) => {
  res.redirect("/profile");
});

app.get("/profile", (req, res) => {
  if (req.session.user) {
    res.render("profile");
  }
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect("/profile");
  });
  res.redirect(`/`);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is listening on port 3000");
});

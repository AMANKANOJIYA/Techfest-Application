require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const app = express();
const fs = require('fs');
const cors = require('cors');
const appId = process.env.APPID;

const tokenKey = fs.readFileSync(process.env.TOKEN_KEY);

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/views"));
app.use(bodyParser.urlencoded());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
  })
);

app.get("/",cors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204,
    "credentials": true
}), (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  const state = crypto.randomBytes(12).toString("hex");
  req.session.state = state;
  res.redirect(
    `${process.env.MIC_URL}/?app_id=${appId}&sensitive=false&state=${state}`
  );
});

app.post("/callback",cors({
    "origin": "http://microservice.com:3000",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204,
    "credentials": true
}),(req, res) => {
  const token = req.body.token;
  if (!token) {
    res.end();
    return;
  }
  try {
    const decoded = jwt.verify(token, tokenKey);
    console.log(decoded);
    if (decoded.appId !== appId && decoded.state !== req.session.state) {
        res.status(500).end();
        return;
    }
    req.session.userId = decoded.userInfo.id;
    req.session.userEmail = decoded.userInfo.email;
    req.session.userFirstName = decoded.userInfo.firstName;
    req.session.userFamilyName = decoded.userInfo.familyName;
    console.log(req.session);
    res.end();
  } catch (err) {
      console.log(err);
      res.status(500).end();
  }
});

app.get("/callback", (req, res) => {
  res.redirect("/profile");
});

app.get("/profile", (req, res) => {
    res.render("profile", {
        name: "Shreyansh Jain"
    });
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

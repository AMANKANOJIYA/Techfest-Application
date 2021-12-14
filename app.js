require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const https = require("https");
// const jwt = require("jsonwebtoken");
// const crypto = require("crypto");
const app = express();
// const fs = require("fs");
// const cors = require("cors");
// const appId = process.env.APPID;

// const tokenKey = fs.readFileSync(process.env.TOKEN_KEY);

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/views"));
app.use(bodyParser.urlencoded());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/verification", (req, res) => {
  res.render("mfa");
});

app.post("/verification", (req, res) => {
  const options = {
    hostname: "",
    port: "3000",
    path: "/api/verification",
    method: "POST",
    header: req.header,
  };
  https.request(options, (resq) => {
    if (resq.header.success) {
      res.redirect("/login");
    }
    res.redirect("/signup");
  });
});

app.post("/signup", (req, res) => {
  const options = {
    hostname: "",
    port: "3000",
    path: "/api/register",
    method: "POST",
    header: req.header,
  };
  https.request(options, (resq) => {
    if (resq.header.success) {
      res.redirect("/login");
    }
    res.redirect("/signup");
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const options = {
    hostname: "",
    port: "3000",
    path: "/api/login",
    method: "POST",
    header: req.header,
  };
  https.request(options, (resq) => {
    const ServerData = resq.header;
    if (ServerData.success) {
      req.session.userInfo = ServerData;
      console.log(req.session);
      res.redirect("/profile");
    }
    res.redirect("/login");
  });
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/profile", (req, res) => {
  res.render("profile", { name: req.session.uesrInfo.name });
});

// app.get("/",cors({
//     "origin": "*",
//     "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
//     "preflightContinue": false,
//     "optionsSuccessStatus": 204,
//     "credentials": true
// }), (req, res) => {
//   res.render("home");
// });

// app.get("/login", (req, res) => {
//   const state = crypto.randomBytes(12).toString("hex");
//   req.session.state = state;
//   res.redirect(
//     `${process.env.MIC_URL}/?app_id=${appId}&sensitive=false&state=${state}`
//   );
// });

// app.post("/callback",cors({
//     "origin": "http://microservice.com:3000",
//     "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
//     "preflightContinue": false,
//     "optionsSuccessStatus": 204,
//     "credentials": true
// }),(req, res) => {
//   const token = req.body.token;
//   if (!token) {
//     res.end();
//     return;
//   }
//   try {
//     const decoded = jwt.verify(token, tokenKey);
//     console.log(decoded);
//     if (decoded.appId !== appId && decoded.state !== req.session.state) {
//         res.status(500).end();
//         return;
//     }
//     req.session.userId = decoded.userInfo.id;
//     req.session.userEmail = decoded.userInfo.email;
//     req.session.userFirstName = decoded.userInfo.firstName;
//     req.session.userFamilyName = decoded.userInfo.familyName;
//     console.log(req.session);
//     res.end();
//   } catch (err) {
//       console.log(err);
//       res.status(500).end();
//   }
// });

// app.get("/callback", (req, res) => {
//   res.redirect("/profile");
// });

// app.get("/profile", (req, res) => {
//     res.render("profile", {
//         name: "Shreyansh Jain"
//     });
// });

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

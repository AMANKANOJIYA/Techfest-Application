require('dotenv').config();
const express = require('express');
const session = require('express-session')
const cookieParser = require('cookie-parser')
const app = express();
const appId = process.env.APPID

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views'))
app.use(cookieParser())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: Date.now() + (24 * 60 * 60 * 1000)
    }
}))

app.get('/',  (req, res)=> {
    res.render('home');
});

app.get('/login', (req, res)=> {
  res.redirect(`https://microservice/appId=${appId}&sensitive=true`);
});

app.post('/callback', (req, res) => {
    req.session.user = req.body.user;
    req.session.save();
    res.redirect('/profile')
})

app.get('/profile', (req, res) => {
    res.render('profile')
})

app.get('/logout', (req,res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/');
    });
    res.redirect('/login')
})

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is listening on port 3000');
});

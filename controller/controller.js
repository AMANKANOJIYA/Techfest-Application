const sendRequest = require('../util/sendRequest');
const endpoints = require('../util/endpoints');
const crypto = require('crypto');

function render( viewName ) {
    return (req, res) => {
        res.render(viewName);
    }
}

function profile( req, res ) {
    res.render('profile', {
        name: req.session.profile.firstName
    });
}

async function signIn(req, res) {
    req.session.state = crypto.randomBytes(5).toString('hex');
    res.redirect(process.env.SSO_URL + `?redirect_uri=${process.env.SELF_URL}callback&state=${req.session.state}`);
}

async function callback(req, res) {
    let authCode = req.query.code;
    let state = req.query.state;

    if ( req.session.state !== state ) {
        res.redirect('/');
        return;
    }

    let token = await sendRequest(endpoints.Token, JSON.stringify({
        code: authCode
    }));
    token = JSON.parse(token);
    
    let profile = await sendRequest(endpoints.VerifyToken, JSON.stringify(token));
    profile = JSON.parse(profile);

    req.session.profile = profile;
    res.redirect('/profile');
}

async function signup( req, res ) {
    let response = await sendRequest(endpoints.Register, JSON.stringify(req.body));
    response = JSON.parse(response);

    if ( response.success ) {
        req.session.userId = response.userId;
        res.redirect('/activate');
    } else {
        res.redirect('/signup');
    }
}

async function login( req, res ) {
    let response = await sendRequest(endpoints.Login, JSON.stringify(req.body));
    response = JSON.parse(response);

    if ( response.success ) {
        req.session.userId = response.userId;
        req.session.userName = response._links.user.name;
        res.redirect("/profile");
    } else {
        res.redirect("/login");
    }
}

async function verification( req, res ) {
    let response = await sendRequest(endpoints.MFA, JSON.stringify({
        userId: req.session.userId,
        otp: req.body.code
    }));
    response = JSON.parse(response);
    
    if ( response.success ) {
        res.redirect('/profile');
    } else {
        res.redirect('/verification');
    }
}

async function activate( req, res ) {
    let response = await sendRequest(endpoints.AccountActivate, JSON.stringify({
        userId: req.session.userId,
        otp: req.body.code
    }));
    response = JSON.parse(response);
    
    if ( response.success ) {
        res.redirect('/login');
    } else {
        res.redirect('/activation');
    }
}

module.exports = {
    profile,
    render,
    signup,
    login,
    verification,
    activate,
    signIn,
    callback
}
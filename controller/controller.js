const sendRequest = require('../util/sendRequest');
const endpoints = require('../util/endpoints');

function render( viewName ) {
    return (req, res) => {
        res.render(viewName);
    }
}

function profile( req, res ) {
    res.render('profile', {
        name: req.session.userName
    });
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
    activate
}
const sendRequest = require('../util/sendRequest');
const endpoints = require('../util/endpoints');
const crypto = require('crypto');

function render( viewName ) {
    return (req, res) => {
        res.render(viewName);
    }
}

function profile( req, res ) {
    if ( req.session.profile ) {
        res.render('profile', {
            firstName: req.session.profile.firstName,
            familyName: req.session.profile.familyName
        });
    } else {
        res.redirect('/');
    }
}

function sensitive( req, res ) {
    if ( req.session.profile && req.session.mfa ) {
        res.render('sensitive', {
            firstName: req.session.profile.firstName,
            email: req.session.profile.email
        });
    } else {
        req.session.state = crypto.randomBytes(5).toString('hex');
        res.redirect(process.env.SSO_URL + `?redirect_uri=${process.env.SELF_URL}callback&state=${req.session.state}&mfa=1`);
    }
}

async function signIn(req, res) {
    req.session.state = crypto.randomBytes(5).toString('hex');
    res.redirect(process.env.SSO_URL + `?redirect_uri=${process.env.SELF_URL}callback&state=${req.session.state}`);
}

async function callback(req, res) {
    let authCode = req.query.code;
    let state = req.query.state;
    let mfa = req.query.mfa;

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
    req.session.mfa = (mfa === '1');
    delete req.session.state;

    if ( req.session.mfa ) {
        res.redirect('/sensitive');
    } else {
        res.redirect('/profile');
    }
}

module.exports = {
    profile,
    render,
    signIn,
    callback,
    sensitive
}
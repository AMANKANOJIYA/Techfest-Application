const endpoints = {
    MFA: '/api/mfa/verify',
    AccountActivate: '/api/activate',
    Register: '/api/register',
    Login: '/api/login',
    Token: '/api/sso/token',
    VerifyToken: '/api/sso/verify'
};

for ( endpoint in endpoints ) {
    endpoints[endpoint] = process.env.MICROSERVICE_URL + endpoints[endpoint];
}

module.exports = endpoints;
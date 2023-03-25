const jsdom = require('jsdom');
const axioRequest = require('../axioRequest');

const { getDOM, submitForm, extractStart } = require('./api');
const { errors } = require('../errors');

async function login(url, account, username, password)
{
    const jar = new jsdom.CookieJar();
    const res = await axioRequest({
        url: 'https://educonnect.education.gouv.fr/idp/profile/SAML2/Unsolicited/SSO?providerId=' +
            'https%3A%2F%2Fmon.lyceeconnecte.fr%2Fauth%2Fsaml%2Fmetadata%2Fidp.xml',
        method: 'GET',
        jar
    });

    let dom = await getDOM({
        url: 'https://educonnect.education.gouv.fr/idp/profile/SAML2/Redirect/SSO?' +
            res.headers.location.split('?')[1],
        method: 'POST',
        jar,
        data: {
            'j_username': username,
            'j_password': password,
            '_eventId_proceed': ''
        },
        followRedirects: true
    });

    if (!dom.window.document.querySelector('input[name=SAMLResponse]')) {
        throw errors.WRONG_CREDENTIALS.drop();
    }

    dom = await submitForm({ dom, jar, followRedirects: false });

    return extractStart(await getDOM({
        url: `${url}${account.value}.html`,
        jar,
        asIs: true
    }));
}

module.exports = login;

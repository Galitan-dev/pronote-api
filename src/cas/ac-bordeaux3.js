const jsdom = require('jsdom');
const axioRequest = require('../axioRequest')
const { getDOM, submitForm, extractStart } = require('./api');
const educonnect = require('./generics/educonnect');

async function login(url, account, username, password) {
    const jar = new jsdom.CookieJar();
    let dom = await getDOM({
        // eslint-disable-next-line max-len
        url: 'https://ds.ac-bordeaux.fr/discovery/WAYF?entityID=https%3A%2F%2Fent2d.ac-bordeaux.fr%2Fshibboleth&return=https%3A%2F%2Fent2d.ac-bordeaux.fr%2FShibboleth.sso%2FLogin%3FSAMLDS%3D1%26target%3Dhttps%253A%252F%252Fent2d.ac-bordeaux.fr%252Fshibcas%252Flogin%253Fservice%253Dhttps%253A%25252F%25252F0331623K.index-education.net%25252Fpronote%25252Feleve.html',
        jar
    });

    dom = await submitForm({
        dom,
        jar,
        actionRoot: 'https://ds.ac-bordeaux.fr/',
        method: 'GET'
    });

    dom = await submitForm({
        dom,
        jar
    });

    dom = await educonnect({ dom, jar, url, account, username, password });

    let redirectURL = dom.window.document.getElementsByTagName('a')[0].href

    let response = await axioRequest({
        url: redirectURL,
        jar
    });

    redirectURL = response.headers.location;

    response = await axioRequest({
        url: redirectURL,
        jar
    });

    redirectURL = response.headers.location;

    return extractStart(await getDOM({
        url: redirectURL,
        jar,
        asIs: true
    }))
}

module.exports = login;

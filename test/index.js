/* eslint-disable no-process-env */
/* eslint-disable no-console */
const pronote = require('../index.js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
    path: path.resolve(__dirname, '../.env')
});

const url = process.env.URL;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const cas = process.env.CAS;

async function main() {
    const session = await pronote.login(url, username, password, cas);

    console.log(session.user.name, session.user.studentClass.name);
    console.log(await session.timetable());
    console.log(await session.marks());

    const now = new Date();
    console.log(await session.homeworks(now, new Date(now.valueOf() + 15 * 24 * 3600 * 1000)));
}

main().catch(err => {
    if (err.code === pronote.errors.WRONG_CREDENTIALS.code) {
        console.error('Mauvais identifiants');
    } else if (!process.argv.includes('-q')) {
        console.error(err);
    }
});

const { toPronoteWeek } = require('../data/dates');
const { getFileURL } = require('../data/files');
const fromHTML = require('../data/html');

const getHomeworks = require('./pronote/homeworks');

async function homeworks(session, user, from = new Date(), to = null, showDone = false)
{
    if (!to || to < from) {
        to = new Date(from.getTime());
        to.setDate(to.getDate() + 1);
    }

    const fromWeek = toPronoteWeek(session, from);
    const toWeek = toPronoteWeek(session, to);

    const homeworks = await getHomeworks(session, user, fromWeek, toWeek);
    if (!homeworks) {
        return null;
    }

    const result = [];

    for (const homework of homeworks) {
        if (homework.for < from || homework.for > to) {
            continue;
        }

        if (showDone || !homework.done) {
            result.push({
                description: fromHTML(homework.description),
                htmlDescription: homework.description,
                subject: homework.subject.name,
                givenAt: homework.givenAt,
                for: homework.for,
                done: homework.done,
                color: homework.color,
                files: homework.files.map(f => ({ name: f.name, url: getFileURL(session, f) }))
            });
        }
    }

    return result.sort((a, b) => a.for - b.for);
}

module.exports = homeworks;

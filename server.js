/*
  Nodejs Server for hosting the website.

 */

const port = 8080;

const express = require('express');
const { uuid } = require('uuidv5');
const app = express();
const cors = require('cors');
const fs = require('fs');

app.use(express.static('content'));
app.use(express.json());
app.use(cors({
    origin: '*'
}));

let data = {};

const _def_console_log = console.log;
console.log = (...args) => _def_console_log(`${new Date().toLocaleString('nl-NL')} |`, ...args);

/* Startup the server on the predefined port at address 0.0.0.0 */
app.listen(port, async () => {
    console.log(`Server has started on port ${port}`);
    fs.readdirSync('./data/').forEach(file => {
        let name = file.substring(0, file.indexOf('.'));
        for (let i = 0; i < name.length; i++) {
            if (name.charAt(i) === '-' || name.charAt(i) === '_') {
                name = name.substring(0, i) + name.charAt(i + 1).toUpperCase() + name.substring(i + 2, name.length);
            }
        }
        data[name] = fs.readFileSync(`./data/${file}`,  { encoding: 'utf8', flag: 'r' });
    });

});


app.post('/api/content', (req, res) => {
    console.log(`Received request for ${req.body.content ?? 'none'}`);
    if (req.body.hasOwnProperty('content') && typeof data[req.body.content] !== 'undefined') {
        res.status(200).json(data[req.body.content]);
        return;
    }
    res.status(400).json({message: "Content does not exist."});
});
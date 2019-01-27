import express from 'express';
import bodyParser from 'body-parser';

const app = express()
const io = require('socket.io-client');
const socket = io('http://127.0.0.1:4001');
app.set('port', process.env.PORT || 80);
app.use(bodyParser.json());

app.get('/', (req, res) => {
    // res.send('Hello World!')
    res.sendStatus(200);
});

app.post('/', (req, res) => {
    console.log(req.body);
    // res.send('Hello World!')
    res.sendStatus(200);
});

socket.on("test", data => {
    console.log(data);
});

app.listen(app.get('port'), () => {
    console.log(`Server listening on port ${app.get('port')}`);
}); 
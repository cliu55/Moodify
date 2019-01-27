import express from 'express';
import bodyParser from 'body-parser';

const app = express()
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

app.listen(app.get('port'), () => {
    console.log(`Server listening on port ${app.get('port')}`);
}); 
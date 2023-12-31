import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync } from 'node:fs';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('json spaces', 2);
app.use(cors({
    origin: '*'
}));

const router = express.Router();

router.get('/', async (req, res) => {
    const data = readFileSync('data.json');
    return res.status(200).json(JSON.parse(data));
});

router.post('/', async (req, res) => {
    const { token } = req.body;
    if (typeof token !== 'string' || !token.trim().length) {
        return res.sendStatus(404);
    }

    const data = JSON.parse(readFileSync('data.json'));
    const tokens = data.tokens;
    if (tokens.find(t => t === token)) {
        return res.sendStatus(409);
    }

    tokens.push(token);
    writeFileSync('data.json', JSON.stringify(data, 2, 2, 2));
    return res.status(200).json(data);
});

router.patch('/', async (req, res) => {
    const { token } = req.body;
    if (typeof token !== 'string' || !token.trim().length) {
        return res.sendStatus(404);
    }

    const data = JSON.parse(readFileSync('data.json'));
    let tokens = data.tokens;
    if (!tokens.find(t => t === token)) {
        return res.sendStatus(404);
    }

    tokens = tokens.filter(t => t !== token);
    data.tokens = tokens;
    writeFileSync('data.json', JSON.stringify(data, 2, 2, 2));
    return res.status(200).json(data);
});

router.get('/check/:token', async (req, res) => {
    const { token } = req.params;
    const data = JSON.parse(readFileSync('data.json'));
    if (data.tokens.find(t => t === token)) return res.sendStatus(200);
    return res.sendStatus(400);
});

app.use('/tokens', router);

app.all('*', (req, res) => res.sendStatus(404));

const server = app.listen(process.env.PORT, () => console.log("Server is online"));
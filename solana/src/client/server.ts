import { fetchTask, fetchAndCompleteTask } from "./main";

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/hello', (req: any, res: { send: (arg0: { express: string; }) => void; }) => {
  res.send({ express: 'Hello From MapTask App' });
});

app.get('/api/fetchTask', async (req: any, res: { send: (arg0: string) => void; }) => {
  res.send(JSON.stringify(await fetchTask()));
});

app.post('/api/completeTask', async (req: { body: { post: any; }; }, res: { send: (arg0: string) => void; }) => {
  console.log(req.body);
  const task = await fetchAndCompleteTask(req.body);
  res.send(
    JSON.stringify(task) ,
  );
});

app.listen(port, () => console.log(`Listening on port ${port}`));
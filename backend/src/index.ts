import express from 'express';
import { Config } from "./common/config";

const app = express();
const PORT = Config.port;

app.get('/', (req, res) => {
  res.send('Hello, TypeScript Node.js!');
});

app.listen(PORT, () => {
  console.log("listening on port " + PORT);
});
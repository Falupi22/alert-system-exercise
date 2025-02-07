import express from 'express';
import { Settings } from "./config";

const app = express();
const PORT = Settings.port;
console.log("PORT: " + process.env.PORT);
app.get('/', (req, res) => {
  res.send('Hello, TypeScript Node.js!');
});

app.listen(PORT, () => {
  console.log("listening on port " + PORT);
});
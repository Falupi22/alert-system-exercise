import express from 'express';
import { Settings } from './config';
import { router } from './routers';
import { connectRabbit } from "./common";

const app = express();
app.use(express.json());
app.set("trust proxy", 1)
app.use('/api', router);

app.listen(Settings.port, "0.0.0.0", async() => {
    console.log('Alert Listerner - listening on port ' + Settings.port);
    await connectRabbit();
});

import express from 'express';
import { Settings } from './config';
import { router } from './routers';

const app = express();
const PORT = Settings.port;

app.use(express.json());
app.set("trust proxy", 1)
app.use('/api', router);

app.listen(PORT, "0.0.0.0", () => {
    console.log('Alert Listerner - listening on port ' + PORT);
});

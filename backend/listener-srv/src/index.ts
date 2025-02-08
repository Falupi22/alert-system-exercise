import express from 'express';
import { Settings } from './config';
import { router } from './routers';

const app = express();
const PORT = Settings.port;

app.use(express.json());
app.use('/api', router);

app.listen(PORT, () => {
    console.log('Alert Listerner - listening on port ' + PORT);
});

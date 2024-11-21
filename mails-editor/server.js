import createMails from '@openagenda/mails';
import createApp from './app.js';

const mails = await createMails({ disableVerify: true });
const app = await createApp(mails);

app.listen(3000);

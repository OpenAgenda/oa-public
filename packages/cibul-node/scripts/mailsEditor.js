import path from 'node:path';
import { registerComponent } from 'mjml-core';
import { registerDependencies } from 'mjml-validator';
import createMails from '@openagenda/mails';
import createApp from '@openagenda/mails-editor';
import MjMarkdown from '../services/mails/components/MjMarkdown.js';
import MjContent from '../services/mails/components/MjContent.js';
import MjPrev from '../services/mails/components/MjPrev.js';

const mjmlComponents = [MjMarkdown, MjContent, MjPrev];

// register ESM components manually
for (const component of mjmlComponents) {
  registerComponent(component);
  if (component.dependencies) {
    registerDependencies(component.dependencies);
  }
}

const mails = await createMails({
  templatesDir: path.join(import.meta.dirname, '../services/mails/templates'),
  disableVerify: true,
});
const app = await createApp(mails);

app.listen(3000);

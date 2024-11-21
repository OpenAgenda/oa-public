import { fromMarkdownToHTML } from '@openagenda/md';
import linkValidator from '@openagenda/validators/link.js';
import emailValidator from '@openagenda/validators/email.js';

const linkValidate = linkValidator();
const emailValidate = emailValidator();

export default (text) => {
  let markIt = true;

  // if is not a string, do not treat as markdown
  if (typeof text !== 'string') return text;

  // if is a bare link, do not treat as markdown
  try {
    linkValidate(text);

    markIt = false;
  } catch (e) {
    //
  }

  // if is a bare email, do not treat as markdown
  try {
    emailValidate(text);

    markIt = false;
  } catch (e) {
    //
  }

  if (!markIt) return text;

  const rendered = fromMarkdownToHTML(text).replace(/^<p>|<\/p>\n$/g, '');

  return rendered;
};

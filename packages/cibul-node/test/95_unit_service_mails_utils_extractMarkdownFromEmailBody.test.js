import extractMarkdownFromEmailBody from '../services/mails/lib/extractMarkdownFromEmailBody.js';

describe('95 - services mails unit - extractMarkdownFromEmailBody', () => {
  it('basic', () => {
    const body = {
      'stripped-html':
        '<body>\n  <div>\n\n    <h2>Blah</h2><br><br>\n\n    <hr>Date: Tue, 22 May 2012 18:29:16 -0600<br>\n    To: xx@hotmail.ca<br>\n    From: quickemail@ashleymadison.com<br>\n    Subject: You Have New Mail From x!<br><br>\n\n  </div>\n</body>',
    };
    const respBody = extractMarkdownFromEmailBody(body);
    expect(respBody).toEqual('## Blah');
  });
});

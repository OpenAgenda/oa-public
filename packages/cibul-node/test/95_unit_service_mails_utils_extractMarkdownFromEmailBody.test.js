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

  it('message footer is removed', () => {
    const responseBody = extractMarkdownFromEmailBody({
      'stripped-html':
        '<html xmlns="http://www.w3.org/1999/xhtml" lang="fr" dir="ltr"><head>\n\n<meta name="viewport" content="width=device-width, initial-scale=1"><title>Crisp Email</title></head><body style="font-weight: 400;"><div dir="auto" style="font-size: 1em;">Bonjour,<span style="display: block; line-height: .5em;"><br style="display: block; padding: .25em 0;"></span><span style="display: block; line-height: .5em;"><br style="display: block; padding: .25em 0;"></span>C\'est corrig&#233;.<span style="display: block; line-height: .5em;"><br style="display: block; padding: .25em 0;"></span><span style="display: block; line-height: .5em;"><br style="display: block; padding: .25em 0;"></span>Bonne journ&#233;e!</div><br><div><br><br><div><img alt="" src="https://links.message.openagenda.com/image/avatar/operator/a379ba92-e56d-42fa-a133-95e234a82186/92/?1730966138772" style="background-size: contain; background-repeat: no-repeat; background-position: center; background-color: #EBEBEB; width: 2em; height: 2em; max-width: 30px; max-height: 30px; margin-right: .5em; vertical-align: middle; display: inline-block; border-radius: 2em;"><strong>Kaor&#233;</strong><span> </span>de<span> </span><a href="http://openagenda.com/" target="_blank">OpenAgenda</a>.</div><br><div style="margin-top: .75em; font-size: .9em; color: #7b7b7b;"><div style="margin-top: .25em;">Il y a 2 participants<span> </span>(reply+4ede8acf-5ded-45dc-bbac-1979ce541813@mail.openagenda.com, support@openagenda.com).</div></div></div><div style="font-size: .95em; margin-top: 1em;"><br><div style="color: #6B095D; border-left: 1px solid #D0D0D0; margin: 0 .5em; padding: 0 .6em;"></div></div></body></html>',
    });

    expect(JSON.stringify(responseBody, null, 2)).toBe(
      '"Bonjour,  \\n  \\nC\'est corrigé.  \\n  \\nBonne journée!"',
    );
  });
});

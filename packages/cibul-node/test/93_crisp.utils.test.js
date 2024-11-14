import isEmailFromCrisp from '../services/mails/lib/isEmailFromCrisp.js';

describe('Crisp utils', () => {
  test('isEmailFromCrisp', () => {
    expect(
      isEmailFromCrisp({
        'Mime-Version': '1.0 (Crisp Mailer)',
        'X-Crisp-Shard-Type': 'transactional',
        'X-Crisp-Website-Id': 'xxx',
        'X-Envelope-From': 'bxxxe800@message.openagenda.com',
      }),
    ).toBe(true);
  });
});

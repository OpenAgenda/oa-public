export default function isEmailFromCrisp(body) {
  const hasCrispKeys = !!Object.keys(body).filter(
    (key) => key.indexOf('X-Crisp') === 0,
  ).length;

  const isCrispMailer = body['Mime-Version'].indexOf('Crisp Mailer') !== -1;

  return hasCrispKeys && isCrispMailer;
}

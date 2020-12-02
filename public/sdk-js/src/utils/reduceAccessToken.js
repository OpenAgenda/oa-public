export default function reduceAccessToken(token) {
  return token.split('').reduce((accu, next) => accu + next.charCodeAt(0), 0);
}

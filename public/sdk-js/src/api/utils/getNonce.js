import _ from 'lodash';

export default function getNonce(reducedAccessToken, requestTokenTime) {
  const ms = new Date().getTime() - requestTokenTime;

  return parseInt(`${_.random(10 ** 3)}${reducedAccessToken}${ms}`, 10);
}

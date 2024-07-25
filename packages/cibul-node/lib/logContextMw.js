import { randomBytes } from 'node:crypto';
import context from '@openagenda/logs/context.js';

export function withContext(req, res, next) {
  const requestId = randomBytes(8).toString('hex');

  context.run({ requestId }, next);
}

export function withUserUid(req, res, next) {
  const store = context.getStore();

  if (store && req.user?.uid) {
    store.userUid = req.user.uid;
  }

  next();
}

import _ from 'lodash';
import jwt from 'jsonwebtoken';
import { BadRequest } from '@openagenda/verror';

function createToken({ secret }, payload) {
  return jwt.sign(payload, secret);
}

function isDbToken(token) {
  return token.split('-').length === 5;
}

async function getDbValues(knex, token) {
  const row = await knex('unsubscription_link')
    .first(['target', 'rule'])
    .where('token', token);

  if (!row) {
    throw new BadRequest('Invalid token');
  }

  const { email, entityName, identifier } = JSON.parse(row.target);

  return {
    target: email ? `email:${email}` : `${entityName}:${identifier}`,
    rule: JSON.parse(row.rule),
  };
}

async function parseToken({ secret, knex }, token) {
  return isDbToken(token)
    ? getDbValues(knex, token)
    : _.omit(jwt.verify(token, secret, { ignoreExpiration: true }), ['iat']);
}

export default function Tokens(params) {
  return {
    create: createToken.bind(null, params),
    parse: parseToken.bind(null, params),
  };
}

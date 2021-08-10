import text from './text';
import link from './link';
import ip from './ip';
import email from './email';
import phone from './phone';
import list from './list';
import number from './number';
import integer from './integer';
import date from './date';
import boolean from './boolean';
import labels from './labels';
import set from './set';
import stream from './stream';
import object from './object';
import latitude from './latitude';
import longitude from './longitude';
import pass from './pass';
import multilingual from './multilingual';
import regex from './regex';
import choice from './choice';

export default {
  text,
  link,
  ip,
  email,
  phone,
  list,
  number,
  integer,
  date,
  boolean,
  labels,
  set,
  stream,
  object,
  latitude,
  longitude,
  pass,
  multilingual,
  regex,
  choice
};

module.exports = {
  text: require( './text' ),
  link: require( './link' ),
  ip: require( './ip' ),
  email: require( './email' ),
  phone: require( './phone' ),
  list: require( './list' ),
  number: require( './number' ),
  integer: require( './integer' ),
  date: require( './date' ),
  boolean: require( './boolean' ),
  labels: require( './labels' ),
  set: require( './set' ),
  stream: require( './stream' ),
  object: require( './object' ),
  latitude: require( './latitude' ),
  longitude: require( './longitude' ),
  pass: require( './pass' ),
  multilingual: require( './multilingual' ),
  regex: require( './regex' ),
  choice: require( './choice' )
}

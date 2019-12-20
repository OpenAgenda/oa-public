'use strict';

const should = require('should');
const redis = require('redis');
const sCache = require('../');
const config = require('../testconfig');

describe('simple-cache - functional (service): set', function() {
  this.timeout(4000);

  let cache, cli;

  before(() => {
    cli = redis.createClient(config.redis.port, config.redis.host);
  });

  before(() => {
    cache = sCache(config);
  });

  beforeEach(done => {
    cli.keys(config.prefix + '*', (err, keys) => {
      cli.del(keys.join( ' ' ), done);
    });
  });

  it('set stores value in specific namespace, id, key redis key', done => {

    cli.get(config.prefix + 'agenda:123', (err, value) => {
      should(value).equal( null );

      cache('agenda', 123).set('http://ponceau.paris', '<html>Chiiriie!</html>', 1000, err => {
        cli.get(config.prefix + 'agenda:123:http://ponceau.paris', (err, value) => {

          value.should.equal('<html>Chiiriie!</html>');

          done();
        });
      });
    });

  });

  it('set stores value with defined ttl', done => {

    cache('agenda', 123).set('http://ponceau.paris', '<html>Blob</html>', 1, err => {

      setTimeout(() => {

        cli.get(config.prefix + 'agenda:123:http://ponceau.paris', (err, value) => {
          should(value).equal(null);

          done();
        });

      }, 2000);

    });

  });

} );

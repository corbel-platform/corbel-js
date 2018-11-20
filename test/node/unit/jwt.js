'use strict';

var corbel = require('../../../dist/corbel.js'),
  chai = require('chai'),
  expect = chai.expect;

describe('JWT module', function() {

  var CLIENT_ID = 'CLIENT_ID';
  var SCOPES = 'scope1 scope2';

  it('exists and is an object', function() {
    expect(corbel.jwt).to.be.an('object');
  });

  it('has all namespace properties', function() {
    expect(corbel.jwt).to.include.keys(
      'generate'
    );
  });

  it('generates a valid JWT', function() {
    var secret = 'secret',
      claims = {
        'iss': CLIENT_ID,
        'aud': 'http://iam.corbel.io',
        'exp': 1391535,
        'scope': SCOPES,
        'version': '1.0.0'
      };
    var EXPECTED_ASSERTION = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJDTElFTlRfSUQiLCJhdWQiOiJodHRwOi8vaWFtLmNvcmJlbC5pbyIsImV4cCI6MTM5MTUzNSwic2NvcGUiOiJzY29wZTEgc2NvcGUyIiwidmVyc2lvbiI6IjEuMC4wIn0.Lkr2LKGv-qyPX6wW30rIB7xHU2svwIYeCx22aegtrJE';

    // without alg
    var assertion = corbel.jwt.generate(claims, secret);
    expect(assertion).to.be.equal(EXPECTED_ASSERTION);

    // with alg
    assertion = corbel.jwt.generate(claims, secret, 'HS256');
    expect(assertion).to.be.equal(EXPECTED_ASSERTION);

    // with array scopes
    claims.scope = ['scope1', 'scope2'];
    assertion = corbel.jwt.generate(claims, secret);
    expect(assertion).to.be.equal(EXPECTED_ASSERTION);
  });

  it('decodes expected values', function() {
    var secret = 'secret',
      claims = {
        iss: 'clientId',
        aud: 'http://iam.corbel.io',
        exp: 12345,
        scope: 'scope:example1 scope:example2'
      };

    var EXPECTED = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJjbGllbnRJZCIsImF1ZCI6Imh0dHA6Ly9pYW0uY29yYmVsLmlvIiwiZXhwIjoxMjM0NSwic2NvcGUiOiJzY29wZTpleGFtcGxlMSBzY29wZTpleGFtcGxlMiJ9.I8wVQbmqoX5LlXHrRzbp5mzaUMBqu6zLhhAvyyNJI6g';

    var assertion = corbel.jwt.generate(claims, secret);
    expect(assertion).to.be.equal(EXPECTED);

    // with array scopes
    claims.scope = ['scope:example1', 'scope:example2'];
    assertion = corbel.jwt.generate(claims, secret);
    var jwtDecoded = corbel.jwt.decode(assertion);
    expect(jwtDecoded).to.be.an('object');

    expect(jwtDecoded.typ).to.be.equal('JWT');
    expect(jwtDecoded.alg).to.be.equal('HS256');

    expect(jwtDecoded.iss).to.be.equal('clientId');
    expect(jwtDecoded.aud).to.be.equal('http://iam.corbel.io');
    expect(jwtDecoded.exp).to.be.equal(12345);
    expect(jwtDecoded.scope).to.be.equal('scope:example1 scope:example2');
  });

  it('throws exception with invalid assertion', function() {
    expect(function() {
      corbel.jwt.decode('invalid_assertion');
    }).to.throw('corbel:jwt:decode:invalid_assertion');
  });

  describe('when generating claims', function() {

    it('iss are required', function() {

      expect(function() {
        corbel.jwt.generate();
      }).to.throw('jwt:undefined:iss');

    });

    it('aud are required', function() {

      expect(function() {
        corbel.jwt.generate({
          iss: 'myiss'
        });
      }).to.throw('jwt:undefined:aud');

    });


  });

});

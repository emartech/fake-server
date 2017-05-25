'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const FakeServer = require('./');

function requestFake(config) {
  const app = FakeServer.createApp(config);

  return request(app.listen());
}

function getConfig(config = {}) {
  return _.merge(
    {},
    {
      url: '/home',
      response: {
        payload: { status: true }
      }
    },
    config);
}

describe('FakeServer', function() {
  describe('requests and responses', function() {
    it('should respond to health check', async function() {
      let response = await requestFake()
        .get('/health-check')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).to.eql({ success: true });
    });

    it('should respond to the configured endpoints', async function() {
      const config = getConfig({
        response: {
          status: 200
        }
      });

      let response = await requestFake([config])
        .get(config.url)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).to.eql(config.response.payload);
    });

    it('should respond to the configured endpoints with any HTTP method', async function() {
      const config = getConfig({
        method: 'post'
      });

      let response = await requestFake([config])
        .post(config.url)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).to.eql(config.response.payload);
    });

    it('should respond to the configured endpoints with the given HTTP status', async function() {
      const config = getConfig({
        response: {
          status: 202
        }
      });

      let response = await requestFake([config])
        .get(config.url)
        .expect('Content-Type', /json/)
        .expect(202);
      expect(response.body).to.eql(config.response.payload);
    });

    it('should respond to the configured endpoints with the result of the given function', async function() {
      const config = getConfig({
        response: {
          payload: function() {
            return { dynamicStatus: true }
          }
        }
      });

      let response = await requestFake([config])
        .get(config.url)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).to.eql({ dynamicStatus: true });
    });

    it('should respond to the configured endpoints with the result of the given function', async function() {
      const config = getConfig({
        url: '/home/:status',
        response: {
          payload: function (ctx) {
            return { dynamicStatus: parseInt(ctx.params.status, 10) };
          }
        }
      });

      let response = await requestFake([config])
        .get('/home/5')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).to.eql({ dynamicStatus: 5 });
    });

    it('should respond differently if called multiple times', async function() {
      const config = getConfig({
        response: {
          payload: { result: true },
          status: 202
        },
        responseForCalls: {
          1: {
            payload: { dynamicStatus: 5 },
            status: 200
          }
        }
      });

      let fakeRequest = await requestFake([config]);
      let response = await fakeRequest.get(config.url)
        .expect('Content-Type', /json/)
        .expect(202);
      expect(response.body).to.eql(config.response.payload);

      response = await fakeRequest.get(config.url)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).to.eql(config.responseForCalls[1].payload);
    });

    it('should throw an error because of invalid HTTP method', async function() {
      const config = getConfig({
        method: 'invalid'
      });

      try {
        requestFake([config])
      } catch(error) {
        expect(error.message).to.eql('Unsupported http method: invalid');
      }
    });

    it('should respond with dynamic payload if called multiple times', async function() {
      const config = getConfig({
        url: '/home/:status',
        response: {
          status: 202
        },
        responseForCalls: {
          1: {
            payload: function (ctx) {
              return { dynamicStatus: parseInt(ctx.params.status, 10) };
            }
          }
        }
      });

      let fakeRequest = await requestFake([config]);
      let response = await fakeRequest
        .get('/home/5')
        .expect('Content-Type', /json/)
        .expect(202);
      expect(response.body).to.eql(config.response.payload);

      response = await fakeRequest
        .get('/home/6')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).to.eql({ dynamicStatus: 6});
    });

    it('should return 200 if no status is defined in responseForCalls', async function() {
      const config = getConfig({
        url: '/home/:status',
        responseForCalls: {
          0: {
            payload: (ctx) => {
              return { dynamicStatus: parseInt(ctx.params.status, 10) };
            }
          }
        }
      });

      await requestFake([config]).get('/home/5')
        .expect('Content-Type', /json/)
        .expect(200);
    });

    it('should return dynamic status', async function() {
      const config = getConfig({
        url: '/home/:status',
        responseForCalls: {
          0: {
            payload: {},
            status: (ctx) => parseInt(ctx.params.status, 10)
          }
        }
      });

      await requestFake([config])
        .get('/home/200')
        .expect('Content-Type', /json/)
        .expect(200);
    });

    it('should return default response when the call count is exceeded', async function() {
      const config = getConfig({
        responseForCalls: {
          0: {
            payload: {},
            status: 202
          }
        }
      });

      let fakeRequest = await requestFake([config]);
      await fakeRequest.get(config.url)
        .expect('Content-Type', /json/)
        .expect(202);

      let response = await fakeRequest
        .get('/home')
        .expect(200);
      expect(response.body).to.eql(config.response.payload);
    });

    it('should set header values for single calls', async function() {
      const config = getConfig({
        response: {
          headers: {
            'header1': 'first-value',
            'header2': 'second-value'
          }
        }
      });

      await requestFake([config])
        .get(config.url)
        .expect('Content-Type', /json/)
        .expect('header1', 'first-value')
        .expect('header2', 'second-value');
    });

    it('should set header values for multiple calls', async function() {
      const config = getConfig({
        response: {
          status: 202,
          headers: { 'header1': 'first-value' }
        },
        responseForCalls: {
          1: {
            payload: {},
            headers: { 'header2': 'second-value' }
          }
        }
      });

      let fakeRequest = await requestFake([config]);
      await fakeRequest
        .get(config.url)
        .expect('Content-Type', /json/)
        .expect(202)
        .expect('header1', 'first-value');

      await fakeRequest
        .get(config.url)
        .expect(200)
        .expect('header2', 'second-value');
    });

    it('should work with multiple config', async function() {
      const config = [getConfig(), getConfig({
        url: '/home2',
        response: {
          payload: {success: false}
        }
      })];

      let fakeRequest = await requestFake(config);
      let response = await fakeRequest
        .get(config[0].url)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).to.eql(config[0].response.payload);

      response = await fakeRequest
        .get(config[1].url)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).to.eql(config[1].response.payload);
    });
  });

  describe('JWT authentication', function () {
    it('should use authentication', async function() {
      const secret = 'test-secret';
      const token = jwt.sign({ user: 'test user' }, secret);
      const config = getConfig({
        url: '/protected',
        authentication: {
          jwt: { secret: secret }
        }
      });

      let response = await requestFake([config])
        .get(config.url)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/);
      expect(response.body).to.eql(config.response.payload);
    });

    it('should use wrong authentication and respond 401', async function() {
      const secret = 'test-secret';
      const token = jwt.sign({ user: 'test user' }, `${secret}make-it-wrong`);
      const config = getConfig({
        url: '/protected',
        response: {
          payload: { secureStatus: true }
        },
        authentication: {
          jwt: { secret: secret }
        }
      });

      await requestFake([config])
        .get(config.url)
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });

    it('should use authentication but it is missing', async function() {
      const config = getConfig({
        url: '/protected',
        response: {
          payload: { secureStatus: true }
        },
        authentication: {
          jwt: { secret: 'test-secret' }
        }
      });

      await requestFake([config])
        .get(config.url)
        .expect(401);
    });
  });
});

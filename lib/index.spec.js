'use strict';

const request = require('supertest');
const FakeServer = require('./');

function requestFake(config) {
  const app = FakeServer.createApp(config);

  return request(app.listen());
}

describe('FakeServer', function() {
  it('should respond to health check', async function() {
    await requestFake()
      .get('/health-check')
      .expect('Content-Type', /json/)
      .expect(
        200,
        { success: true }
      );
  });

  it('should respond to the configured endpoints', async function() {
    const config = {
      url: '/home',
      response: {
        payload: { homeStatus: true },
        status: 200
      }
    };

    await requestFake([config])
      .get(config.url)
      .expect('Content-Type', /json/)
      .expect(
        200,
        config.response.payload
      );
  });

  it('should respond to the configured endpoints with any HTTP method', async function() {
    const config = {
      url: '/home',
      method: 'post',
      response: {
        payload: { homeStatus: true }
      }
    };

    await requestFake([config])
      .post(config.url)
      .expect('Content-Type', /json/)
      .expect(
        200,
        config.response.payload
      );
  });

  it('should respond to the configured endpoints with the given HTTP status', async function() {
    const config = {
      url: '/home',
      response: {
        payload: { homeStatus: true },
        status: 202
      }
    };

    await requestFake([config])
      .get(config.url)
      .expect('Content-Type', /json/)
      .expect(
        202,
        config.response.payload
      );
  });

  it('should respond to the configured endpoints with the result of the given function', async function() {
    const config = {
      url: '/home',
      response: {
        payload: function() {
          return { dynamicStatus: true }
        }
      }
    };

    await requestFake([config])
      .get(config.url)
      .expect('Content-Type', /json/)
      .expect(
        200,
        { dynamicStatus: true }
      );
  });

  it('should respond to the configured endpoints with the result of the given function', async function() {
    const config = {
      url: '/home/:status',
      response: {
        payload: function (ctx) {
          return { dynamicStatus: parseInt(ctx.params.status, 10) };
        }
      }
    };

    await requestFake([config])
      .get('/home/5')
      .expect('Content-Type', /json/)
      .expect(
        200,
        { dynamicStatus: 5 }
      );
  });

  it('should respond differently if called multiple times', async function() {
    const config = {
      url: '/home',
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
    };

    let fakeRequest = await requestFake([config]);
    await fakeRequest.get('/home')
      .expect('Content-Type', /json/)
      .expect( 202, { result: true });

    let response = await fakeRequest.get('/home')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).to.eql(config.responseForCalls[1].payload);
  });

  it('should throw an error because of invalid HTTP method', async function() {
    const config = {
      url: '/home',
      method: 'invalid',
      response: { homeStatus: true }
    };

    try {
      requestFake([config])
    } catch(error) {
      expect(error.message).to.eql('Unsupported http method: invalid');
    }
  });

  it('should respond with dynamic payload if called multiple times', async function() {
    const config = {
      url: '/home/:status',
      response: {
        payload: { result: true },
        status: 202
      },
      responseForCalls: {
        1: {
          payload: function (ctx) {
            return { dynamicStatus: parseInt(ctx.params.status, 10) };
          }
        }
      }
    };

    let fakeRequest = await requestFake([config]);
    await fakeRequest.get('/home/5')
      .expect('Content-Type', /json/)
      .expect( 202, { result: true });

    let response = await fakeRequest.get('/home/6')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).to.eql({ dynamicStatus: 6});
  });

  it('should return 200 if no status is defined in responseForCalls', async function() {
    const config = {
      url: '/home/:status',
      responseForCalls: {
        0: {
          payload: (ctx) => {
            return { dynamicStatus: parseInt(ctx.params.status, 10) };
          }
        }
      }
    };

    await requestFake([config]).get('/home/5')
      .expect('Content-Type', /json/)
      .expect(200);
  });

  it('should return dynamic status', async function() {
    const config = {
      url: '/home/:status',
      responseForCalls: {
        0: {
          payload: {},
          status: (ctx) => parseInt(ctx.params.status, 10)
        }
      }
    };

    await requestFake([config]).get('/home/200')
      .expect('Content-Type', /json/)
      .expect(200);
  });

  it('should return default response when the call count is exceeded', async function() {
    const config = {
      url: '/home',
      response: {
        payload: { success: true },
      },
      responseForCalls: {
        0: {
          payload: {},
          status: 202
        }
      }
    };

    let fakeRequest = await requestFake([config]);
    await fakeRequest.get('/home')
      .expect('Content-Type', /json/)
      .expect(202);

    let response = await fakeRequest.get('/home')
      .expect(200);

    expect(response.body).to.eql({ success: true });
  });


  it.only('should set header values for single calls', async function() {
    const config = {
      url: '/home',
      response: {
        payload: { homeStatus: true },
        status: 200,
        headers: {
          'header1': 'first-value',
          'header2': 'second-value'
        }
      }
    };

    await requestFake([config])
      .get(config.url)
      .expect('Content-Type', /json/)
      .expect('header1', 'first-value')
      .expect('header2', 'second-value');
  });
});

'use strict';

const Logger = require('./logger');

describe('Logger', function () {
  const now = new Date();
  let fakeNext = async function() {};

  beforeEach(function() {
    sinon.useFakeTimers(now.getTime());
  });

  it('should log', async function () {
    const ctx = {
      url: '/home',
      method: 'POST',
      status: 200,
      request: {
        body: { test: 'example' }
      },
      body: { success: true }
    };
    const expectedObj = {
      timeStamp: now.toISOString(),
      url: ctx.url,
      method: ctx.method,
      status: ctx.status,
      requestPayload: ctx.request.body,
      body: ctx.body
    };
    const logger = Logger.create();
    let middleware = logger.middleware();

    await middleware(ctx, fakeNext);

    expect(logger.getLogs()).to.eql([expectedObj]);
  });

  it('should logs the failed requests too', async function () {
    const error = new Error('something wrong');
    error.status = 499;
    const ctx = {
      url: '/home',
      method: 'POST',
      status: 200,
      request: {
        body: { test: 'example' }
      },
      body: { success: true }
    };

    const logger = Logger.create();
    let middleware = logger.middleware();

    try {
      await middleware(ctx, async () => {
        throw error;
      });
    } catch(thrownError) {
      expect(thrownError).to.equal(error);
    }

    expect(logger.getLogs()).to.eql([{
      timeStamp: now.toISOString(),
      url: ctx.url,
      method: ctx.method,
      status: error.status,
      requestPayload: ctx.request.body,
      body: error.message
    }]);
  });
});

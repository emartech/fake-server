'use strict';

const sinon = require('sinon');
const Logger = require('./logger');

describe('Logger', function () {
  const now = new Date();
  let fakeNext = async function() {};
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers(now.getTime());
  });

  it('should log', async function () {
    const ctx = {
      url: '/home',
      method: 'POST',
      status: 200,
      body: { success: true }
    };
    const expectedObj = {
      timeStamp: now.getTime(),
      url: ctx.url,
      method: ctx.method,
      status: ctx.status,
      body: ctx.body
    };
    const logger = Logger.create();
    let middleware = logger.middleware();

    await middleware(ctx, fakeNext);

    expect(logger.getLogs()).to.eql([expectedObj]);
  });

  afterEach(() => {
    clock.restore();
  });
});

'use strict';

const RequestHandlerFactory = require('./request-handler-factory');

describe('RequestHandlerFactory', function () {
  let callCount = 0;

  beforeEach(() => {
    callCount = 0;
  });

  it('should create a request handler', function () {
    const config = {};

    let requestHandler = RequestHandlerFactory.createRequestHandler({config, callCount});

    expect(typeof requestHandler).to.eql('function');
  });

  it('should have the configured response on the body of the context', function () {
    const config = {
      response: {
        payload: { success: true }
      }
    };
    let spyCtx = {};

    let requestHandler = RequestHandlerFactory.createRequestHandler({config, callCount});
    requestHandler(spyCtx);

    expect(spyCtx.body).to.eql(config.response.payload);
  });

  it('should have the configured status of the context', function () {
    const config = {
      response: {
        status: 202
      }
    };
    let spyCtx = {};

    let requestHandler = RequestHandlerFactory.createRequestHandler({config, callCount});
    requestHandler(spyCtx);

    expect(spyCtx.status).to.eql(config.response.status);
  });
});

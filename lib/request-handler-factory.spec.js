'use strict';

const sinon = require('sinon');
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

  it('should set headers', function () {
    const config = {
      response: {
        headers: {
          'header1': 'first-value',
          'header2': 'second-value'
        }
      }
    };
    let firstKey = Object.keys(config.response.headers)[0];
    let secondKey = Object.keys(config.response.headers)[1];
    let spyCtx = {
      set: sinon.spy()
    };

    let requestHandler = RequestHandlerFactory.createRequestHandler({config, callCount});
    requestHandler(spyCtx);

    expect(spyCtx.set).to.have.been.calledTwice;
    expect(spyCtx.set.firstCall).to.have.been.calledWithExactly(firstKey, config.response.headers[firstKey]);
    expect(spyCtx.set.secondCall).to.have.been.calledWithExactly(secondKey, config.response.headers[secondKey]);
  });
});

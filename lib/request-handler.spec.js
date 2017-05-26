'use strict';

const sinon = require('sinon');
const RequestHandler = require('./request-handler');

describe('RequestHandler', function () {
  it('should create a request handler instance', function () {
    const config = {};

    let requestHandlerInstance = new RequestHandler(config);
    let requestHandler = requestHandlerInstance.getHandler();

    expect(requestHandlerInstance).to.be.an.instanceof(RequestHandler);
    expect(typeof requestHandler).to.eql('function');
  });

  it('should have the configured response on the body of the context', function () {
    const config = {
      response: {
        payload: { success: true }
      }
    };
    let spyCtx = {};

    let requestHandler = new RequestHandler(config).getHandler();
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

    let requestHandler = new RequestHandler(config).getHandler();
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

    let requestHandler = new RequestHandler(config).getHandler();
    requestHandler(spyCtx);

    expect(spyCtx.set).to.have.been.calledTwice;
    expect(spyCtx.set.firstCall).to.have.been.calledWithExactly(firstKey, config.response.headers[firstKey]);
    expect(spyCtx.set.secondCall).to.have.been.calledWithExactly(secondKey, config.response.headers[secondKey]);
  });
});

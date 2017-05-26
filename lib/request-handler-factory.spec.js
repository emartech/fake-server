'use strict';

const RequestHandlerFactory = require('./request-handler-factory');

describe('RequestHandlerFactory', function () {
  it('should create a request handler', function () {
    const config = {};

    let requestHandler = RequestHandlerFactory.createRequestHandler(config);

    expect(typeof requestHandler).to.eql('function');
  });
});

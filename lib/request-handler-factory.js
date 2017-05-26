'use strict';

const RequestHandler = require('./request-handler');

class RequestHandlerFactory {
  static createRequestHandler(config) {
    return new RequestHandler(config).getHandler();
  }
}

module.exports = RequestHandlerFactory;

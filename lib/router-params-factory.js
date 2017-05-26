'use strict';

const koaJwt = require('./jwt-auth');
const RequestHandler = require('./request-handler');

class RouterParamsFactory {
  static createRouterParams(config) {
    let routerParams = [];

    routerParams.push(config.url);

    if(config.authentication && config.authentication.jwt) {
      routerParams.push(koaJwt(config));
    }

    routerParams.push(new RequestHandler(config).getHandler());

    return routerParams;
  }
}

module.exports = RouterParamsFactory;

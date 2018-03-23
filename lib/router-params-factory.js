'use strict';

const koaJwt = require('./jwt-auth');
const RequestHandler = require('./request-handler');
const escherAuth = require('./escher-auth');

class RouterParamsFactory {
  static createRouterParams(config) {
    let routerParams = [];

    routerParams.push(config.url);

    if(config.authentication && config.authentication.jwt) {
      routerParams.push(koaJwt(config));
    }

    if(config.authentication && config.authentication.escher) {
      routerParams.push(escherAuth(config.authentication.escher));
    }

    routerParams.push((new RequestHandler(config)).getHandler());

    return routerParams;
  }
}

module.exports = RouterParamsFactory;

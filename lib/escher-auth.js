'use strict';

const { Authenticator } = require('koa-escher-auth').lib;

module.exports = (config) => {
  return async (context, next) => {
    context.escherData = Promise.resolve(context.request.rawBody);
    const authenticator = new Authenticator(config, context);

    try {
      await authenticator.authenticate();
    } catch (error) {
      context.throw(401, error.message);
    }
    await next();
  }
};

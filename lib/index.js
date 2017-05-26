'use strict';
const Koa = require('koa');
const Router = require('koa-router');
const _ = require('lodash');
const RequestHandlerFactory = require('./request-handler-factory');
const koaJwt = require('./jwt-auth');

const availableMethods = ['get', 'post', 'put', 'patch', 'delete', 'del'];

class FakeServer {
  static createApp(configList = []) {
    const app = new Koa();
    const router = new Router();

    configList
      .map(this._buildHandlerForRouter.bind(this))
      .map(({ method, routerParams }) => router[method](...routerParams));

    this._registerHealthCheck(router);

    app.use(router.routes());
    return app;
  }

  static _buildHandlerForRouter(endpointConfig) {
    const config = this._extendWithDefaultValues(endpointConfig);

    this._validateConfig(config);

    let routerParams = [];
    routerParams.push(config.url);

    if(config.authentication && config.authentication.jwt) {
      routerParams.push(koaJwt(config));
    }

    routerParams.push(RequestHandlerFactory.createRequestHandler(config));

    return {
      method: config.method,
      routerParams
    };
  }

  static _registerHealthCheck(router) {
    router.get('/health-check', (ctx) => {
      ctx.body = { success: true };
    });
  }

  static _validateConfig(config) {
    if (!availableMethods.includes(config.method)) {
      throw new Error(`Unsupported http method: ${config.method}`);
    }
  }

  static _extendWithDefaultValues(config) {
    return _.merge({
      method: 'get',
      response: {
        status: 200
      }
    }, config);
  }
}

module.exports = FakeServer;

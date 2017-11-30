'use strict';
const Koa = require('koa');
const Router = require('koa-router');
const koaCors = require('@koa/cors');
const _ = require('lodash');
const Logger = require('./logger');
const RouterParamsFactory = require('./router-params-factory');

const availableMethods = ['get', 'post', 'put', 'patch', 'delete', 'del'];

class FakeServer {
  static createApp(configList = []) {
    const app = new Koa();
    const router = new Router();
    const logger = Logger.create();

    configList
      .map(this._buildHandlerForRouter.bind(this))
      .map(({ method, routerParams }) => router[method](...routerParams));

    this._registerHealthCheck(router);

    app
      .use(koaCors())
      .use(logger.middleware())
      .use(router.routes());

    return app;
  }

  static _buildHandlerForRouter(endpointConfig) {
    const config = this._extendWithDefaultValues(endpointConfig);

    this._validateConfig(config);

    return {
      method: config.method,
      routerParams: RouterParamsFactory.createRouterParams(config)
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

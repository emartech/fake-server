'use strict';
const Koa = require('koa');
const Router = require('koa-router');
const _ = require('lodash');

const availableMethods = ['get', 'post', 'put', 'patch', 'delete', 'del'];

class FakeServer {
  static createApp(configList = []) {
    const app = new Koa();
    const router = new Router();

    configList.forEach((endpointConfig) => {
      const config = this._extendWithDefaultValues(endpointConfig);

      this._validateConfig(config);

      let callCount = 0;

      router[config.method](config.url, (ctx) => {
        ctx.status = this._generateStatus({
          defaultStatus: config.response.status,
          responseForCalls: config.responseForCalls
        });
        ctx.body = this._generateBody({
          defaultResponse: config.response.payload,
          responseForCalls: config.responseForCalls,
          ctx,
          callCount
        });

        callCount++;
      });
    });

    router.get('/health-check', (ctx) => {
      ctx.body = { success: true };
    });

    app.use(router.routes());
    return app;
  }

  static _generateStatus({defaultStatus, responseForCalls, callCount}) {
    return defaultStatus;
  }

  static _generateBody({defaultResponse, responseForCalls, ctx, callCount}) {



    if (typeof defaultResponse === 'function') {
      return defaultResponse(ctx);
    }

    return defaultResponse;
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
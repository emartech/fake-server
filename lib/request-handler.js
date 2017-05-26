'use strict';

class RequestHandler {
  constructor(config) {
    this._config = config;
    this._callCount = 0;
  }

  getHandler() {
    return (ctx) => {
      ctx.status = this._generateStatus(ctx);
      ctx.body = this._generateBody(ctx);
      this._setHeaders(ctx);
      this._callCount++;
    };
  }

  _setHeaders(ctx) {
    let headers = this._config.responseForCalls && this._config.responseForCalls[this._callCount] ?
      this._config.responseForCalls[this._callCount].headers :
      this._config.response.headers;

    if (!headers) return;

    Object.keys(headers).forEach((key) => {
      ctx.set(key.toLowerCase(), headers[key]);
    });
  }

  _generateStatus(ctx) {
    if (this._config.responseForCalls && this._config.responseForCalls[this._callCount]) {
      return this._computeDynamicValue(this._config.responseForCalls[this._callCount].status, ctx) || 200;
    }

    return this._computeDynamicValue(this._config.response.status, ctx);
  }

  _generateBody(ctx) {
    if (this._config.responseForCalls && this._config.responseForCalls[this._callCount]) {
      return this._computeDynamicValue(this._config.responseForCalls[this._callCount].payload, ctx);
    }

    return this._computeDynamicValue(this._config.response.payload, ctx);
  }

  _computeDynamicValue(rawValue, ctx) {
    if (typeof rawValue === 'function') {
      return rawValue(ctx);
    }

    return rawValue;
  }
}

module.exports = RequestHandler;

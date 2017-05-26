'use strict';

class RequestHandlerFactory {
  static createRequestHandler({config, callCount}) {
    return (ctx) => {
      ctx.status = this._generateStatus({
        defaultStatus: config.response.status,
        responseForCalls: config.responseForCalls,
        ctx,
        callCount
      });

      ctx.body = this._generateBody({
        defaultResponse: config.response.payload,
        responseForCalls: config.responseForCalls,
        ctx,
        callCount
      });

      this._setHeaders({
        defaultHeaders: config.response.headers,
        responseForCalls: config.responseForCalls,
        ctx,
        callCount
      });

      callCount++;
    };
  }

  static _setHeaders({ defaultHeaders, responseForCalls, ctx, callCount }) {
    let headers = responseForCalls && responseForCalls[callCount] ?
      responseForCalls[callCount].headers :
      defaultHeaders;

    if (!headers) return;

    Object.keys(headers).forEach((key) => {
      ctx.set(key.toLowerCase(), headers[key]);
    });
  }

  static _generateStatus({defaultStatus, responseForCalls, ctx, callCount}) {
    if (responseForCalls && responseForCalls[callCount]) {
      return this._computeDynamicValue(responseForCalls[callCount].status, ctx) || 200;
    }

    return this._computeDynamicValue(defaultStatus, ctx);
  }

  static _generateBody({defaultResponse, responseForCalls, ctx, callCount}) {
    if (responseForCalls && responseForCalls[callCount]) {
      return this._computeDynamicValue(responseForCalls[callCount].payload, ctx);
    }

    return this._computeDynamicValue(defaultResponse, ctx);
  }

  static _computeDynamicValue(rawValue, ctx) {
    if (typeof rawValue === 'function') {
      return rawValue(ctx);
    }

    return rawValue;
  }
}

module.exports = RequestHandlerFactory;

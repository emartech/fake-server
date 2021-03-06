'use strict';

class Logger {
  constructor(url = '/call-log') {
    this._url = url;
    this._logs = [];
  }

  middleware() {
    return async (ctx, next) => {
      if (ctx.url.includes(this._url)) {
        ctx.body = this.getLogs();
      } else {
        await this._buildLog(ctx, next);
      }
    };
  }

  getLogs() {
    return this._logs;
  }

  async _buildLog(ctx, next) {
    let log = {
      timeStamp: new Date().toISOString(),
      url: ctx.url,
      method: ctx.method,
      requestPayload: ctx.request.body
  };

    try {
      await next();
      log.status = ctx.status;
      log.body = ctx.body;
    } catch(error) {
      log.status = error.status || ctx.status;
      log.body = error.message;

      throw error;
    } finally {
      this._logs.push(log);
    }
  }

  static create(url) {
    return new Logger(url);
  }
}

module.exports = Logger;

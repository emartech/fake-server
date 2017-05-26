'use strict';

class Logger {
  constructor(url = '/call-log') {
    this._url = url;
    this._logs = [];
  }

  middleware() {
    let re = new RegExp(this._url);
    let middleware = async function(ctx, next) {
      if (ctx.url.match(re)) {
        ctx.body = this.getLogs();
      } else {
        let log = {
          timeStamp: new Date().getTime(),
          url: ctx.url,
          method: ctx.method
        };

        await next();

        log.status = ctx.status;
        log.body = ctx.body;

        this._logs.push(log);
      }
    };

    return middleware.bind(this);
  }

  getLogs() {
    return this._logs;
  }

  static create(url) {
    return new Logger(url);
  }
}

module.exports = Logger;

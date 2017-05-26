'use strict';

class Logger {
  constructor() {
    this._logs = []
  }

  middleware() {
    let middleware = async function(ctx, next) {
      if (ctx.url.match(/\/call-log/)) {
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

  static create() {
    return new Logger();
  }
}

module.exports = Logger;

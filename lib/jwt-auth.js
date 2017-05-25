'use strict';

const koaJwt = require('koa-jwt');

module.exports = config => {
  return koaJwt({
    secret: config.authentication.jwt.secret
  });
};

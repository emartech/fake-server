'use strict';
const FakeServer = require('../lib');
const jwt = require('jsonwebtoken');

const jwtSecret = 'token';
const jwtToken = jwt.sign({ user: 'test user' }, jwtSecret);

const app = FakeServer.createApp([
  {
    url: '/handshake',
    response: { payload: jwtToken }
  },
  {
    url: '/get-list',
    response: {
      payload: { list: ['test', 'example'] }
    },
    authentication: {
      jwt: { secret: jwtSecret }
    }
  }
]);

app.listen(9999);

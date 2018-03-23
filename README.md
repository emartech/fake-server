# fake-server

## Example

### Usage with Escher and JWT authentication
```
'use strict';
const FakeServer = require('../lib');

const jwtSecret = 'token';
const jwtToken = jwt.sign({ user: 'test user' }, jwtSecret);

const app = FakeServer.createApp([
  {
    url: '/handshake',
    authentication: {
      escher: {
        credentialScope: 'eu/fake-server/test_request',
        keyPool: JSON.stringify([{
            keyId: 'my-test-key-id_v1',
            secret: 'my-secret',
            acceptOnly: 0
         }])
      }
    }
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
```
_Note: You don't have to provide the `credentialScope` or `keyPool` for escher configuration. The defaults for these properties are the `SUITE_ESCHER_KEY_POOL` and `SUITE_ESCHER_CREDENTIAL_SCOPE` environment variables._

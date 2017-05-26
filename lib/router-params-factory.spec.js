'use strict';

const RouterParamsFactory = require('./router-params-factory');

describe('RouterParamsFactory', function () {
  it('should create router params', function () {
    const config = {
      url: '/home',
      response: {
        payload: {},
        status: 200
      },
      authentication: {
        jwt: {
          secret: 'secret'
        }
      }
    };

    let routerParams = RouterParamsFactory.createRouterParams(config);

    expect(routerParams.length).to.eql(3);
    expect(routerParams[0]).to.eql(config.url);
    expect(typeof routerParams[1]).to.eql('function');
    expect(typeof routerParams[2]).to.eql('function');
  });
});

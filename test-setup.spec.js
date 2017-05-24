'use strict';

let sinon = require('sinon');

let chai = require('chai');
let sinonChai = require('sinon-chai');

chai.use(sinonChai);
global.expect = chai.expect;
global.sinon = sinon;

beforeEach(function() {
  this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
  this.sandbox.restore();
});
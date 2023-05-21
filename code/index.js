const serverless = require('@serverless-devs/fc-http');
const { default: app } = require('./dist/index');

exports.handler = serverless(app);

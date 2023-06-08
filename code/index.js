const serverless = require('@serverless-devs/fc-http');
const { default: app } = require('./dist/index');
const { saveStore } = require('./dist/util');

exports.handler = serverless(app);

module.exports.preStop = function (context, callback) {
  saveStore({}, true).then(() => {
    console.log('销毁前上传数据');
    callback(null, '');
  })
};

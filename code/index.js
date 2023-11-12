const { getDataByHttp } = require('./dist/index');
const { saveStore } = require('./dist/util');

exports.handler = async (event, context, callback) => {
  const eventObj = JSON.parse(event.toString());
  // const password = eventObj?.queryParameters?.p || '';
  // const token = eventObj?.queryParameters?.token || '';
  // const responseData = getDataByHttp({ password, token });
  callback({
    statusCode: 200,
    body: 'data',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });
};

exports.preStop = function (context, callback) {
  saveStore({}, true).then(() => {
    console.log('销毁前上传数据');
    callback(null, '');
  });
};

const { getDataByHttp } = require('./dist/getFootBall');
const { saveStore } = require('./dist/util');
exports.handler = async (event, context, callback) => {
  try {
    const eventObj = JSON.parse(event.toString());
    const password = eventObj?.queryParameters?.p || '';
    const token = eventObj?.queryParameters?.token || '';
    // const responseData = await getDataByHttp({ password, token });
    callback(null, {
      statusCode: 200,
      body: {password, token},
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    callback(null, {
      statusCode: 500,
      body: error.message,
    });
  }
};

exports.preStop = function (context, callback) {
  saveStore({}, true).then(() => {
    console.log('销毁前上传数据');
    callback(null, '');
  });
};

const { getData } = require('./dist/getFootBall');
exports.handler = async (event, context, callback) => {
  try {
    await getData('peng902', 'Jxd9061912')
    callback(null, 'success');
  } catch (error) {
    callback(null, {
      statusCode: 500,
      body: error.message,
    });
  }
};
const { getData } = require('./dist/getFootBall');
exports.handler = async (event, context, callback) => {
  try {
    const data = await getData('peng902', 'Aakk8899')
    callback(null, {
      statusCode: 500,
      body: data,
    });
  } catch (error) {
    callback(null, {
      statusCode: 500,
      body: error.message,
    });
  }
};

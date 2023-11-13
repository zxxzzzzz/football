const { getDataByHttp } = require('./dist/getFootBall');
const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');

exports.static = (event, context, callback) => {
  try {
    const eventObj = JSON.parse(event.toString());
    const rawPath = eventObj.rawPath ||  eventObj?.requestContext?.http?.path ||'';
    const requestEtag = eventObj?.headers?.['If-None-Match'] || '';
    const hash = createHash('sha256');
    let responseBody = '';
    let contentType = 'text/html;charset=UTF-8';
    if (!rawPath || rawPath === '/') {
      responseBody = fs.readFileSync(path.resolve(__dirname, './public/index.html'), { encoding: 'utf-8' });
    } else {
      responseBody = fs.readFileSync(path.resolve(__dirname, './public' + rawPath), { encoding: 'utf-8' });
    }
    if (rawPath.endsWith('.js')) {
      contentType = 'application/x-javascript';
    }
    if (rawPath.endsWith('.css')) {
      contentType = 'text/css';
    }
    const hashText = hash.update(responseBody, 'utf-8').digest('hex');
    if (requestEtag === hashText) {
      callback(null, {
        statusCode: 304,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache',
          ETag: hashText,
        },
      });
      return;
    }
    callback(null, {
      statusCode: 200,
      body: responseBody,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        ETag: hashText,
      },
    });
  } catch (error) {
    callback(null, {
      statusCode: 200,
      body: error.message,
    });
  }
};



exports.data = async (event, context, callback) => {
  try {
    const eventObj = JSON.parse(event.toString());
    const password = eventObj?.queryParameters?.p || '';
    const token = eventObj?.queryParameters?.token || '';
    const responseData = await getDataByHttp({ password, token });
    callback(null, {
      statusCode: 200,
      body: responseData,
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

exports.dataUpdate = async (event, context, callback) => {
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

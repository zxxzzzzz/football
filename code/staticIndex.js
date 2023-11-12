const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');

exports.handler = (event, context, callback) => {
  try {
    const rawPath = event.rawPath || '';
    const requestEtag = event?.headers?.['If-None-Match'] || '';
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
      console.log(123);
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

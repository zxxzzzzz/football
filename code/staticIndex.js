const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');

exports.handler = (event, context, callback) => {
  try {
    const hash = createHash('sha256');
    const eventObj = JSON.parse(event);

    let body = 'Hello World!';
    // get http request body
    if ('body' in eventObj) {
      body = eventObj.body;
      if (eventObj.isBase64Encoded) {
        body = Buffer.from(body, 'base64').toString('utf-8');
      }
    }
    const html = fs.readFileSync(path.resolve(__dirname, './public/index.html'), { encoding: 'utf-8' });
    const hashText = hash.update(html, 'utf-8').digest('hex');
    callback(null, {
      statusCode: 200,
      body: html,
      headers: {
        'Content-Type:': 'text/html;charset=UTF-8',
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

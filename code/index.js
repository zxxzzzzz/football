const { getCacheData, getData } = require('./dist/getFootBall');
const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');

// {
//   "version": "v1",
//   "rawPath": "/my/path",
//   "httpMethod": "POST",
//   "headers": {
//       "header1": "value1,value2",
//       "header2": "value2"
//   },
//   "queryParameters": {
//       "param1": "value1,value2",
//       "param2": "value2"
//   },
//   "body": "hello from client",
//   "isBase64Encoded": false,
//   "requestContext": {
//       "accountId": "12345678",
//       "domainName": "my-domain.com",
//       "domainPrefix": "prefix",
//       "requestId": "abcd-efgh",
//       "time": "2023-09-01T14:17:23+08:00",
//       "timeEpoch": 1693549043255,
//       "http": {
//           "method": "GET",
//           "path": "/my/path",
//           "protocol": "http",
//           "sourceIP": "39.40.41.42",
//           "userAgent": "go-sdk/1.0"
//       }
//   }
// }

const pipe = async (event, context, callback, funcList = []) => {
  const request = JSON.parse(event.toString());
  const response = {};
  try {
    for (const func of funcList) {
      await func(request, response);
    }
  } catch (error) {
    callback(null, { statusCode: 500, body: error.message });
  }
  callback(null, response);
};

const useCache = (request, response) => {
  const hash = createHash('sha256');
  const requestEtag = request?.headers?.['If-None-Match'] || '';
  const body = typeof response.body === 'string' ? response.body : JSON.stringify(response.body);
  const hashText = hash.update(body, 'utf-8').digest('hex');
  response.headers = {
    ...(response.headers || {}),
    'Cache-Control': 'no-cache',
    ETag: hashText,
  };
  if (requestEtag && hashText === requestEtag) {
    response.statusCode = 304;
    response.body = '';
  }
};

const useStatic = (request, response) => {
  const rawPath = request.rawPath || request?.requestContext?.http?.path || '';
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
  response.statusCode = 200;
  response.body = responseBody;
  response.headers = {
    ...(response.headers || {}),
    'Content-Type': contentType,
    'Cache-Control': 'no-cache',
  };
};

exports.static = (_event, content, callback) => pipe(_event, content, callback, [useStatic, useCache]);

const useData = async (request, response) => {
  const password = request?.queryParameters?.p || '';
  const token = request?.queryParameters?.token || '';
  const responseData = await getCacheData({ password, token });
  response.statusCode = 200;
  response.body = responseData;
  response.headers = {
    ...(response.headers || {}),
    'Content-Type': 'application/json',
  };
};

exports.data = (_event, content, callback) => pipe(_event, content, callback, [useData, useCache]);

exports.dataUpdate = async (event, context, callback) => {
  try {
    const { log } = await getData('peng902', 'Aakk8899');
    callback(null, {
      statusCode: 500,
      body: log,
    });
  } catch (error) {
    callback(null, {
      statusCode: 500,
      body: error.message,
    });
  }
};

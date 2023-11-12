// import fs from 'fs';

exports.handler = (event, context, callback) => {
  const eventObj = JSON.parse(event);

  let body = 'Hello World!';
  // get http request body
  if ("body" in eventObj) {
    body = eventObj.body;
    if (eventObj.isBase64Encoded) {
      body = Buffer.from(body, 'base64').toString('utf-8');
    }
  }
  // const html = fs.readFileSync('./public/index.html', {encoding:'utf-8'})
  callback(null, {
    'statusCode': 200,
    'body': 'hello word'
  });
}
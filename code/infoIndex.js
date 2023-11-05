const _fetch = import('node-fetch');

exports.handler = (event, context, callback) => {
  _fetch.then((_) => {
    // http://todolist.football.1048992591952509.cn-hangzhou.fc.devsapp.net/data?p=test_123@&token=10.314474100696579
    const fetch = _.default
    fetch("http://todolist.football.1048992591952509.cn-hangzhou.fc.devsapp.net/data?p=trigger_123@", {
      "headers": {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "proxy-connection": "keep-alive",
        "cookie": "password=test_123@",
        "Referer": "http://todolist.football.1048992591952509.cn-hangzhou.fc.devsapp.net/?spm=5176.fcnext.0.0.56c878c82a6wDw",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": null,
      "method": "GET"
    })
    setTimeout(() => {
      callback(null, '');
    }, 1000);
  })
  return true
}

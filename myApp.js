const express = require('express');
const helmet = require('helmet');
const app = express();
app.use(helmet.hidePoweredBy());
// deny, someorigin, allow-from
app.use(helmet.frameguard({ action: 'deny'}));           // <iframe>は完全に禁止
// app.use(helmet.frameguard({ action: 'sameorigin'}));  // 自サイト内でのみ許可

module.exports = app;
const api = require('./server.js');
app.use(express.static('public'));
app.disable('strict-transport-security');
app.use('/_api', api);
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

let port = process.env.PORT || 3000;  // ランダムに割り当てられるポートにも対応
app.listen(port, () => {
  console.log(`👹TEST APP!! ${port}`);
});

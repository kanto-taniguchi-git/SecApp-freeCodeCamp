const express = require('express');
const helmet = require('helmet');
const app = express();
// HTTPヘッダーからX-Powered-Byを削除
app.use(helmet.hidePoweredBy());

/*
X-Frame-Options(deny, someorigin, allow-from)
クリックジャッキング対策
クリックジャッキングとはユーザーが意図しないリアクションを実行させられるセキュリティ攻撃
*/
app.use(helmet.frameguard({ action: 'deny'}));           // 全てのブラウザでサイトをフレーム内に表示することをブロック
// app.use(helmet.frameguard({ action: 'sameorigin'}));  // 自サイト内でのみ許可

/*
サニタイズ
XSS対策
悪意のあるスクリプトを脆弱なページに挿入するもの
*/
app.use(helmet.xssFilter());

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

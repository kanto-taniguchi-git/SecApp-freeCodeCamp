const express = require('express');
const helmet = require('helmet');
const app = express();
// HTTPヘッダーからX-Powered-Byを削除
app.use(helmet.hidePoweredBy());

/*
クリックジャッキング対策
クリックジャッキングとはユーザーが意図しないリアクションを実行させられるセキュリティ攻撃
あくまで自分のWebサイトの表示を制御するためのもの
*/
app.use(helmet.frameguard({ action: 'deny'}));           // 全てのブラウザで自分のWebサイトをフレーム内に表示することをブロック
// app.use(helmet.frameguard({ action: 'sameorigin'}));  // 自分のWebサイトで自分のWebサイトをフレーム内に表示することを許可

/*
XSS対策
悪意のあるスクリプトを脆弱なページに挿入するもの
*/
app.use(helmet.xssFilter());

/*
MIMEスニッフィング対策
https://techblog.gmo-ap.jp/2022/12/09/mime_sniffing/
*/
app.use(helmet.noSniff());

/*
IEでダウンロードしたHTMLファイルが実行される問題の対策
*/
app.use(helmet.ieNoOpen());

/*
指定された期間はHTTPSを常に使用するようにする設定
forceは既存の設定を上書きする
*/
const nintyDaysSeconds = 90 * 24 * 60 * 60;
app.use(helmet.hsts({ maxAge: nintyDaysSeconds, force: true }));

/*
DNSプリフェッチ制御
・DNSプリフェッチとは、リンク先のドメイン名に対して事前にDNS解決を行うこと
・DNSプリフェッチを行うことで、リンク先（ページ内リンク）のページを表示する際に、DNS解決にかかる時間を短縮することができる
・ユーザーが実際には訪問していないウェブページの情報をDNSサーバーが取得することになるため、プライバシーの問題が発生する可能性がある
・無効にすると対策ができるがパフォーマンスは低下する
*/
app.use(helmet.dnsPrefetchControl({ allow: false })); 

/*
キャッシュの無効化
ユーザーが古い情報をロードすることを防ぐ
*/
app.use(helmet.noCache());

/*
CSP
様々な攻撃からWebアプリケーションを保護できる
意図しないものがページに挿入されることを防ぐ
ソースの許可リストは配列
*/
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],                    // 他のドメインからのリソースをブロック
    scriptSrc: ["'self'", "trusted-cdn.com"],  // 自サイトのJavaScriptとtrusted-cdn.comからのスクリプトのみ許可
  }
}));

/* 
app.use(helmet());はnoCashとcontentSecurityPolicyを除外して設定
helmet()のconfigオブジェクトを使って個別に設定することもできる
例えば、以下のように設定することもできる
app.use(helmet({
  frameguard: {
    action: 'deny' 
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "trusted-cdn.com"],
    }
  },
  dnsPrefetchControl: false
}));
あくまでもhelmet()がベースの設定で、個別に設定することもできる
設定内容は、curl --dump-header - http://localhost:起動ポート番号
*/

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

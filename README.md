# mowaソリューションズ ITなんでも屋

熊本の商店・農場・個人事業の方向けの、IT相談サイトです。  
GitHub Pages で、`main` ブランチのルートから公開します。公開先は `https://it.mowasol.com/` です。

金額と写真は、まだ仮です。連絡先は入っています。

## 料金を変える

`index.html` の `section id="prices"`（コメント「料金（仮）」）だけを編集します。  
金額は税込の仮です。税別にするときは、そのセクション先頭の説明文も一緒に直してください。

入口（診断・設定）を低く、足す分はオプション、続ける分は月額、という並びにしてあります。

## 連絡先

いまの内容です。変えるときは、`index.html` の会社情報と、直後の JSON-LD（LocalBusiness）を同じ文言にしてください。

| 項目 | 内容 |
| --- | --- |
| 名前 | mowaソリューションズ |
| 代表 | 玉木智和 |
| 電話 | 096-282-8122 |
| メール | ttamaki@mowasol.com（ページの mailto） |
| 所在地 | 〒869-1217 熊本県菊池郡大津町森729-41 |
| 受付 | メール・SNSは24時間365日。事務所は年中無休 9:00〜17:00 |

JSON-LD の `openingHours` は事務所の時間で、`Mo-Su 09:00-17:00`（年中無休 9:00〜17:00）です。メールとSNSが24時間365日であることは `description` と `contactPoint` に書いてあります。

## フォームのURLと通知先

`site.js` の `FORM_URL` に、埋め込み用のURLを貼ります。空のままだと、ページ上の案内が出ます。

```javascript
var FORM_URL = "https://docs.google.com/forms/d/e/________/viewform?embedded=true";
```

回答の通知は、`FORM_NOTIFY` の両方に届くようにしてください。

- ttamaki@mowasol.com
- satokana@mowasol.com

Googleフォームなら、回答の通知先にこの2つを追加します。片方だけでは足りません。`https://` から始まるURLだけをページに埋め込みます。

フォームがまだ無いとき、ページのメール控えは `ttamaki@mowasol.com` への mailto です。

## 写真とロゴ

公式ロゴは `assets/` です。

| ファイル | 使いどころ |
| --- | --- |
| `assets/mowa_neko_logo.jpg` | ヘッダーのロゴ（緑の猫と mowa solutions） |
| `assets/mowa_logomark.png` | ファビコン、フッターの小マーク |
| `assets/ogp.png` | SNSでリンクを貼ったときの画像（1200×630、小マークを使用） |

ロゴを差し替えるときは、同じファイル名で上書きしてください。サイトの緑は、猫の体 `#63ed4a` と、ロゴの s の `#0d683e` です。

事例と会社紹介の写真は `assets/photos/` です。幅1200pxの WebP で、ぼかしを削る切り抜きはしていません。代替テキストは、納品時の manifest の文を使っています。

まだ仮なのは、代表の写真と 3Dプリンタ（P2S）だけです。ファイルは `images/owner-placeholder.svg` と `images/p2s-placeholder.svg` です。

## 公開（GitHub Pages）

キーホルダー基板のサイト（`keychain.mowasol.com`）と同じやり方です。

1. リポジトリの Settings → Pages を開く
2. Build and deployment は「Deploy from a branch」
3. Branch は `main`、フォルダは `/ (root)`
4. Custom domain は `it.mowasol.com`（`CNAME` ファイルに入っています）
5. DNSで、`it.mowasol.com` の CNAME を `mowasol.github.io` に向ける
6. 証明書の準備ができたら Enforce HTTPS をオンにする

反映には数分かかることがあります。

## ファイル

| ファイル | 役割 |
| --- | --- |
| `index.html` | ページ本体 |
| `styles.css` | 見た目 |
| `site.js` | フォームURLと、携帯メニューを閉じる処理だけ |
| `CNAME` | `it.mowasol.com` |
| `404.html` | 見つからないとき |
| `assets/mowa_neko_logo.jpg` | ヘッダーの公式ロゴ |
| `assets/mowa_logomark.png` | ファビコンと小マーク |

取引先の名前や、その案件の名前は書かないでください。

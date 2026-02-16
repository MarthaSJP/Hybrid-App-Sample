# Hybrid App Sample (Swift + Angular WebView)

最小構成のWebViewハイブリッド実装です。

## 構成

- `ios/NativeBridgeCore`
  - ネイティブ機能共有モジュール（コマンドディスパッチ型）
  - `getDeviceInfo` / `triggerHaptic` を実装
- `ios/AppShell`
  - Webアプリ一覧（タイル）から選択起動するアプリシェル
  - 各Webアプリごとのホワイトリストによる遷移制御
  - JSブリッジ `nativeBridge` の受信と `window.onNativeMessage` 返却
- `web/packages/native-bridge-sdk`
  - 内部npm SDK（`@internal/native-bridge-sdk`）
  - `send`, `getDeviceInfo`, `triggerHaptic`, `getMobileAgentContext` を提供
- `web/apps/hybrid-web`
  - Angular SPA本体（Standalone + Router）
  - RouteChange/Ajax/JavaScript Errorを再現するデモ画面
- `api`
  - カードデータを返すバックエンドAPI（Express）

## ブリッジ仕様

### JS -> Native

```ts
window.webkit.messageHandlers.nativeBridge.postMessage({
  id: string,
  method: string,
  payload?: unknown
});
```

### Native -> JS

```ts
window.onNativeMessage({
  id: string,
  ok: boolean,
  result?: Record<string, unknown>,
  error?: { code: string; message: string }
});
```

## デモで確認できるイベント

- Route Change
  - ナビゲーション: `Home` / `Products` / `Checkout`
- Ajax / Fetch
  - `Fetch Success`（`/api/cards`）
  - `Fetch 404`（`/api/not-found`）
  - `Fetch Abort`（`/api/slow` + AbortController）
- JavaScript Error
  - `Throw Error`（未定義関数呼び出し）
  - `Unhandled Rejection`（未処理Promise拒否）
- Native Bridge
  - `getDeviceInfo`
  - `triggerHaptic(light)`
  - `getMobileAgentContext`（起動時に `mobileSessionId` / `mobileUuid` をBrowserへ連携）

## テスト

### iOS (NativeBridgeCore)

```bash
cd ios/NativeBridgeCore
swift test
```

### Web

```bash
cd web
npm run build:web
```

New Relicライセンス分離ビルド:

```bash
cd web
npm run build:web:app-a
npm run build:web:app-b
```

`APP_VARIANT` 指定ビルド:

```bash
cd web
APP_VARIANT=app-a npm run build:web:variant
APP_VARIANT=app-b npm run build:web:variant
```

Angular SPAのローカル実行:

```bash
cd web
npm run dev:web
```

variant指定で起動:

```bash
cd web
npm run dev:web:app-a
npm run dev:web:app-b
```

SDKテスト:

```bash
cd web
npm test
```

### Web (Docker)

```bash
docker compose up -d api web
docker compose logs -f web
```

SDKテストをコンテナ内で実行:

```bash
docker compose exec web npm test
```

ブラウザ確認:

```bash
open http://localhost:4200/
```

停止する場合:

```bash
docker compose down
```

## New Relic設定（必須項目）

設定先:

- `web/apps/hybrid-web/src/environments/environment.ts`（ローカル用・Git管理外）
- `web/apps/hybrid-web/src/environments/environment.app-a.ts`
- `web/apps/hybrid-web/src/environments/environment.app-b.ts`

設定する値:

- `monitoring.enabled`
  - `true` で計測有効
- `monitoring.info.licenseKey`
  - `NRJS-` プレフィックス付きキーを設定
  - 例: `NRJS-xxxxxxxxxxxxxxxx`
- `monitoring.info.applicationID`
- `monitoring.info.beacon`
  - US: `bam.nr-data.net`
  - EUリージョンを利用する場合はEUエンドポイントを設定
- `monitoring.info.errorBeacon`
  - `beacon` と同じリージョンを設定
- `monitoring.loaderConfig.accountID`
- `monitoring.loaderConfig.trustKey`
- `monitoring.loaderConfig.agentID`
- `monitoring.loaderConfig.licenseKey`
  - `info.licenseKey` と同じ値
- `monitoring.loaderConfig.applicationID`
  - `info.applicationID` と同じ値

確認ポイント:

- ブラウザConsole: `typeof window.newrelic` が `object`
- Network: `https://bam...nr-data.net` への `POST` が `200` または `202`
- `403` の場合:
  - `licenseKey` 形式（`NRJS-` 付き）を確認
  - `applicationID` と `licenseKey` の組み合わせを確認
  - US/EUエンドポイント不一致を確認

Git運用:

- `environment.ts` は Git 管理しません
- 作成元: `web/apps/hybrid-web/src/environments/environment.template.ts`

```bash
cp web/apps/hybrid-web/src/environments/environment.template.ts web/apps/hybrid-web/src/environments/environment.ts
```

## New Relic Mobile設定（必須項目）

設定ファイル:

- `ios/AppShell/Config/Secrets.template.xcconfig`（Git管理）
- `ios/AppShell/Config/Secrets.xcconfig`（Git管理外）

手順:

1. テンプレートをコピー

```bash
cp ios/AppShell/Config/Secrets.template.xcconfig ios/AppShell/Config/Secrets.xcconfig
```

2. `ios/AppShell/Config/Secrets.xcconfig` の `NEW_RELIC_APP_TOKEN` に実値を設定

```xcconfig
NEW_RELIC_APP_TOKEN = <YOUR_NEW_RELIC_MOBILE_APP_TOKEN>
```

確認ポイント:

- `NEW_RELIC_APP_TOKEN` が未設定またはプレースホルダの場合、Mobile Agentは起動しません。
- `AppDelegate` でアプリ起動時に自動初期化されます。

## iOSプロジェクト生成と起動

`ios/AppShell` は `xcodegen` で再生成可能です。

```bash
cd ios/AppShell
xcodegen generate
open AppShell.xcodeproj
```

`xcodebuild` を使う場合、初回のみ以下が必要です。

```bash
sudo xcodebuild -license accept
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

## 注意点

- `ios/AppShell/Info.Debug.plist` / `ios/AppShell/Info.Release.plist` の `WEB_APPS` に、起動対象Webアプリを定義します。
- `WEB_APPS` には `iconSymbolName`, `accentColorHex`, `accentColorHexSecondary`, `badgeText` を追加するとタイル表示をカスタムできます。
- `ios/AppShell/Info.Debug.plist`: 開発用HTTP許可
- `ios/AppShell/Info.Release.plist`: HTTPSのみ
- `ios/AppShell/project.yml` を編集してから `xcodegen generate` すると設定を再現できます。

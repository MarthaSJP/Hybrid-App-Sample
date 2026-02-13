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
  - `send`, `getDeviceInfo`, `triggerHaptic` を提供
- `web/apps/hybrid-web`
  - Angular SPA本体（Standalone + Router）
  - RouteChange/Ajax/JavaScript Errorを再現するデモ画面
- `api`
  - カードデータを返すバックエンドAPI（Express）

## ブリッジ契約

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
Angular SPAのローカル実行:

```bash
cd web
npm run dev:web
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

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@1natsu/wait-element` — ブラウザDOMに要素が出現するのを検知するPromiseベースのライブラリ。MutationObserverで監視し、querySelectorで検出する。AbortSignalによるキャンセル、カスタムdetector、プロセス統合(unifyProcess)をサポート。

## Commands

- **パッケージマネージャ**: pnpm（`packageManager`フィールドで固定）
- **テスト**: `pnpm test`（watchモード）、`pnpm test-ci`（単発実行）
- **単一テスト実行**: `pnpm vitest run src/index.test.ts`（ファイル指定）
- **型チェック**: `pnpm typecheck`
- **Lint/Format**: `pnpm biome`（Biome — check --write ./src）
- **ビルド**: `pnpm build`（unbuildでESM出力、dist/へ）
- **リリース**: `pnpm release`（np経由、prerelease時にunbuild実行）

## Architecture

### エントリポイントと公開API

2つのexportパスを持つESMオンリーパッケージ:
- `@1natsu/wait-element` → `src/index.ts`: `waitElement`, `createWaitElement`, `getDefaultOptions`
- `@1natsu/wait-element/detectors` → `src/detectors.ts`: `isExist`, `isNotExist`

### コア構造

- **`src/index.ts`**: `createWaitElement`がファクトリ関数。MutationObserverの生成・接続、AbortSignal処理、`unifyProcess`キャッシュ（`ManyKeysMap`）を内包。`waitElement`はデフォルトオプションで生成済みのインスタンス。
- **`src/detectors.ts`**: `Detector`型と組み込みdetector。detectorは `(element) => DetectorResultType<Result>` 形式で、async対応。
- **`src/options.ts`**: `Options`型定義、`getDefaultOptions`、`mergeOptions`（`defu`でdeep merge）。ジェネリクスで`Result`と`QuerySelectorResult`を伝播。
- **`src/types.ts`**: `HasQuerySelector`, `NodeLike`, `QuerySelectorReturn`等の基本型。

### 型設計のポイント

`createWaitElement`と`waitElement`はジェネリクスが連鎖する設計。`detector`オプションの返り値型から`Result`が推論され、`waitElement`の返り値型`Promise<Result>`に伝播する。`defu`のマージ結果がユニオン型になるため`src/index.ts:42`でキャストしている。

## Testing

- **環境**: jsdom（vitest.config.tsで設定）
- **型テスト**: `*.test-d.ts`ファイルで`expectTypeOf`を使用（vitest typecheck有効）
- **DOMテストの注意**: jsdomはテスト間でグローバルDOMを共有するため、各テストでサンドボックス要素(`test-sandbox`)をbeforeEachでクリーン・再生成している（`describe.shuffle`で順序非依存を保証）
- テストタイムアウトは50秒に設定

## Code Style

- **インデント**: タブ（.editorconfigで規定、YAMLのみスペース2）
- **Linter/Formatter**: Biome（recommended rules + organizeImports）
- **import拡張子**: `.js`サフィックスを使用（ESMモジュール解決）

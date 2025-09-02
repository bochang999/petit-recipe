# 🍳 Petit Recipe

**RecipeBox UI統合レシピアプリ** - HTML/CSS/JS → PWA → Android APK

25種類の厳選レシピ内蔵、検索・分量調整機能付きの実用的な料理アプリです。

## ✨ 主な機能

- 📖 **25レシピ内蔵** - 豚の角煮、玄米甘酒、カスタードプリンなど多彩なレシピ
- 🔍 **高速検索** - レシピ名・材料名による瞬時検索
- 📊 **スマート分量調整** - 1〜4人前まで自動計算
- 🎨 **RecipeBox UI** - 美しい紫グラデーションテーマ
- 📱 **PWA対応** - オフライン利用可能
- 🤖 **Android APK** - GitHub Actionsによる自動ビルド
- ⚡ **高速動作** - バニラJavaScript実装

## 🏗️ 技術スタック

- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **PWA**: Service Worker, Manifest
- **モバイル**: Capacitor.js
- **ビルド**: GitHub Actions
- **UI/UX**: RecipeBox統合デザイン

## 🎯 対応プラットフォーム

- ✅ Web ブラウザ (Chrome, Firefox, Safari, Edge)
- ✅ Android APK (7.0+)
- ✅ PWA インストール
- ✅ オフライン動作

## 🚀 使い方

### Web版
1. https://bochang999.github.io/petit-recipe でアクセス
2. ブラウザでPWAとしてインストール可能

### Android版
1. [Releases](https://github.com/bochang999/petit-recipe/releases)からAPKダウンロード
2. インストール・実行

## 🧪 開発・ビルド

```bash
# 開発サーバー起動
python -m http.server 8000

# APKビルド (GitHub Actions)
git push origin main
# → 自動でAPK生成・リリース
```

## 📁 プロジェクト構造

```
petit-recipe/
├── index.html          # メインHTMLファイル
├── script.js           # アプリケーションロジック
├── recipes-data.js     # レシピデータ(APK安全)
├── style.css           # RecipeBoxテーマCSS
├── src/data/           # 元レシピJSONデータ
├── icons/              # PWA/APKアイコン
├── capacitor.config.ts # Capacitor設定
└── android/           # Androidビルド
```

## 🍽️ レシピ一覧

1. **豚の角煮** (中級・90分) - 本格的な和食の定番
2. **玄米甘酒** (初級・10時間) - 発酵食品
3. **塩ダレ** (初級・5分) - 万能調味料
4. **カスタードプリン** (中級・45分) - 手作りデザート
5. **チョコレートムース** (初級・15分) - 簡単スイーツ
6. **カラメルソース** (中級・15分) - デザート用
7. **うなぎの蒲焼のタレ** (初級・10分) - 専門店の味
8. **至高の沼** (初級・60分) - 話題の健康料理

## 🔧 技術詳細

- **データ読み込み**: 3段階フォールバック方式
  1. グローバル埋め込みデータ (APK安全)
  2. Capacitor Filesystem API (ネイティブ)
  3. fetch API (Web)
- **UI**: safe-area-inset対応、ステータスバー重複回避
- **検索**: リアルタイム絞り込み
- **ソート**: 時系列・あいうえお・人気順

## 📱 APK詳細

- **ターゲット**: Android 7.0 (API 24)+
- **サイズ**: ~10MB
- **権限**: インターネット、ストレージ
- **署名**: GitHub Actions自動署名

## 📲 APK更新手順（ユーザー向け）

### 更新の確認方法
1. [Releases](https://github.com/bochang999/petit-recipe/releases) ページでバージョンを確認
2. インストール済みアプリのバージョンと比較

### 更新手順
1. **バックアップ（推奨）**: 現在のアプリデータを確認
2. **APKダウンロード**: 最新リリースからAPKファイルを取得
3. **インストール実行**:
   - ダウンロードしたAPKファイルをタップ
   - 「不明なソース」を許可（初回のみ）
   - 「更新」をタップして上書きインストール
4. **動作確認**: アプリを起動して正常動作を確認

### 注意事項
- ⚠️ **同一署名**: GitHub Actions署名により、上書き更新が可能
- ⚠️ **データ保持**: 通常はデータ消失なし（念のためバックアップ推奨）
- ⚠️ **Android設定**: 「不明なソース」許可が必要
- ⚠️ **互換性**: Android 7.0+ で動作確認済み

### トラブルシューティング
**「アプリがインストールされませんでした」エラー**:
- 署名の不一致: 古いアプリをアンインストール後、再インストール
- 容量不足: ストレージ容量を確認
- Playプロテクト: 一時的に無効化を検討

## 🤝 貢献・開発

このプロジェクトは実用的なレシピアプリの開発事例として公開されています。

- Issue・PR歓迎
- レシピ追加提案歓迎
- UI/UX改善提案歓迎

---

**🤖 Generated with [Claude Code](https://claude.ai/code)**

© 2024 Bochang Lab. MIT License.
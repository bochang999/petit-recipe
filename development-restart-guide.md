# 🔄 Petit Recipe 開発再開用クイックスタートガイド

## 📋 再開時の手順

### STEP 1: 環境確認
```bash
# プロジェクトディレクトリに移動
cd /data/data/com.termux/files/home/petit-recipe

# Git状態確認
git status
git log --oneline -5

# 最新コード確認
ls -la
wc -l script.js  # 現在約2000行
```

### STEP 2: 動作確認
```bash
# 品質チェック
npx eslint script.js

# ビルド確認
npm run build

# 主要ファイル確認
head -20 index.html    # 設定ボタン存在確認
grep -n "exportData\|importData" script.js  # BOC-100機能確認
```

### STEP 3: アーキテクチャ理解
```bash
# 主要クラス構造確認
grep -n "class .*{" script.js
grep -n "// ▼▼▼ BOC-" script.js  # 各マイルストーン実装箇所

# データストレージ確認
grep -n "localStorage" script.js | head -5
grep -n "STORAGE_KEY" script.js
```

### STEP 4: Linear履歴確認
```bash
# 過去のIssue確認
doit BOC-100 --interactive  # 完成済み機能の詳細確認
# BOC-97, BOC-98, BOC-99の実装履歴も参照可能
```

## 🎯 新機能開発の開始方法

### 1. Linear Issue作成
- **BOC-101以降**の番号で新Issue作成
- **実装前仕様**を詳細に記述
- **既存アーキテクチャとの統合方針**を明確化

### 2. 実装方針決定
- **LocalRecipeDatabase拡張** vs **新クラス作成**
- **PetitRecipeApp UI拡張**の方法
- **CSS統合**での北欧ブルーテーマ維持
- **localStorage設計**への影響

### 3. 品質保証準備
- ESLint設定確認: `npx eslint --version`
- ビルドシステム確認: `npm run build`
- Git管理準備: 適切なブランチ戦略

## 🚨 重要な注意事項

### データ互換性
- **既存ユーザーデータ**の保護を最優先
- **localStorage構造変更**時は必ずマイグレーション実装
- **バックアップ機能**でのデータ救済手段確保

### コード品質
- **ESLintエラー0**を維持
- **重複メソッド名**の回避
- **既存命名規則**の継承
- **コメント記述**はBOC-XXX形式で統一

### アーキテクチャ一貫性
- **3層構造**の維持: データ層・UI層・ネイティブ層
- **エラーハンドリング**の統一: try-catch + showErrorMessage
- **CSS設計**の継承: CSS Variables活用

## 💡 推奨する次期開発テーマ

### 短期(BOC-101~105)
- レシピカテゴリ・タグ機能
- レシピ検索機能強化
- 画像アップロード対応
- UI/UXの微調整

### 中期(BOC-106~110)
- 栄養情報・カロリー計算
- ショッピングリスト生成
- レシピ共有機能
- パフォーマンス最適化

### 長期(BOC-111~)
- クラウド同期
- マルチデバイス対応
- AI機能統合
- レシピレコメンデーション

**🎯 開発再開時は、このガイドを参照してスムーズに作業を開始してください！**
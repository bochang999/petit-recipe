# WORKFLOW PHASE 5: トラブルシューティング

## 🚨 一般的な問題と解決方法

### JSON関連の問題

#### 問題1: JSON構文エラー
```bash
# 症状
./recipe-json-manager.sh save
# → "❌ Error: Invalid JSON in staging area"

# 診断
jq empty .recipes_staging.json
# → "parse error: Invalid numeric literal"

# 解決方法
# 1. 手動でJSONを修正
# 2. またはステージング破棄
./recipe-json-manager.sh discard

# 3. バックアップから復元
cp backups/recipes_backup_20250123_143022.json recipes.json
```

#### 問題2: 文字エンコーディング問題
```bash
# 症状: 日本語が文字化け

# 確認
file recipes.json
# → "UTF-8 Unicode text"を確認

# 修正（必要な場合）
iconv -f SHIFT_JIS -t UTF-8 recipes.json > recipes_utf8.json
mv recipes_utf8.json recipes.json
```

### ファイル操作の問題

#### 問題3: 権限エラー
```bash
# 症状
./recipe-json-manager.sh add "新レシピ"
# → "Permission denied"

# 解決
chmod +x recipe-json-manager.sh
chmod 644 recipes.json
```

#### 問題4: ディスク容量不足
```bash
# 診断
df -h
# → 使用率99%など

# 解決
# 1. 古いバックアップ削除
find backups/ -name "*.json" -mtime +30 -delete

# 2. 不要ファイル削除
rm -f .recipes_staging.json .changes_log.txt
```

### データ整合性の問題

#### 問題5: 重複ID・重複レシピ名
```bash
# 診断
jq '.recipes | group_by(.id) | map(select(length > 1))' recipes.json
jq '.recipes | group_by(.name) | map(select(length > 1))' recipes.json

# 解決（Claude実行推奨）
# 1. 重複レシピの特定
# 2. 手動でIDまたは名前を修正
# 3. データの統合または削除
```

#### 問題6: 必須フィールド欠損
```bash
# 診断
jq '.recipes[] | select(.name == null or .ingredients == null or .steps == null) | .id' recipes.json

# 解決
./recipe-json-manager.sh edit "対象レシピ" "欠損フィールドを追加"
```

## 🔧 システム復旧手順

### 完全復旧パターン1: バックアップからの復元
```bash
# 1. 最新バックアップ確認
ls -la backups/ | head -5

# 2. 正常なバックアップ選択
cp backups/recipes_backup_20250123_143022.json recipes.json

# 3. 整合性確認
jq empty recipes.json && echo "JSON正常"
./recipe-json-manager.sh list

# 4. ステージング削除
rm -f .recipes_staging.json .changes_log.txt
```

### 完全復旧パターン2: Git履歴からの復元
```bash
# 1. git履歴確認
git log --oneline recipes.json | head -5

# 2. 正常な状態に戻す
git checkout HEAD~2 recipes.json

# 3. 確認・コミット
git add recipes.json
git commit -m "🔧 Restore recipes.json from git history"
```

## 🎯 予防保守パターン

### 定期メンテナンス
```bash
# 週次実行推奨
#!/bin/bash
# maintenance.sh

echo "🔧 petit-recipe 定期メンテナンス"

# 1. JSON構文チェック
if ! jq empty recipes.json; then
    echo "❌ JSON構文エラー検出"
    exit 1
fi

# 2. データ整合性チェック
MISSING_FIELDS=$(jq '.recipes[] | select(.name == null or .ingredients == null or .steps == null) | .id' recipes.json)
if [ -n "$MISSING_FIELDS" ]; then
    echo "⚠️ 必須フィールド欠損: $MISSING_FIELDS"
fi

# 3. 古いバックアップ削除
find backups/ -name "*.json" -mtime +30 -delete

# 4. バックアップ作成
cp recipes.json "backups/recipes_maintenance_$(date +%Y%m%d).json"

echo "✅ メンテナンス完了"
```

### AI操作の安全性確保
```bash
# AI実行前の確認習慣
# 1. 現状バックアップ
cp recipes.json "recipes_before_ai_$(date +%Y%m%d_%H%M%S).json"

# 2. AI実行

# 3. 結果確認
./recipe-json-manager.sh changes
jq empty recipes.json

# 4. 問題があれば即座にロールバック
```

## 🚀 パフォーマンス最適化

### 大容量ファイル対応
```bash
# ファイルサイズ確認
ls -lh recipes.json

# 100KB超の場合の最適化
# 1. 不要なwhitespace削除
jq -c . recipes.json > recipes_compact.json
mv recipes_compact.json recipes.json

# 2. バックアップ圧縮
gzip backups/recipes_backup_*.json
```

### 操作速度改善
```bash
# jqインストール確認（高速化）
which jq || pkg install jq

# bashプロファイル最適化
echo 'alias r="./recipe-json-manager.sh"' >> ~/.bashrc

# 使用例
r list          # ./recipe-json-manager.sh list
r save          # ./recipe-json-manager.sh save
```

## 🔍 高度なデバッグ技術

### ログ分析
```bash
# 変更履歴の分析
if [ -f .changes_log.txt ]; then
    echo "📋 最近の変更:"
    tail -10 .changes_log.txt
fi

# git による変更追跡
git log --oneline recipes.json | head -10
git diff HEAD~1 recipes.json
```

### ステージング状態の詳細確認
```bash
# ステージングファイル存在確認
[ -f .recipes_staging.json ] && echo "ステージング有" || echo "ステージング無"

# ステージングと本番の差分
if [ -f .recipes_staging.json ]; then
    diff <(jq -S . recipes.json) <(jq -S . .recipes_staging.json)
fi
```

## ⚡ 緊急時対応プロトコル

### 緊急復旧手順（5分以内）
```bash
# 1. 即座にバックアップ確認
ls -la backups/ | head -3

# 2. 最新の正常バックアップを復元
cp backups/recipes_backup_YYYYMMDD_HHMMSS.json recipes.json

# 3. 最低限の動作確認
./recipe-json-manager.sh list | head -3

# 4. ステージング削除
rm -f .recipes_staging.json .changes_log.txt

# 5. git でコミット
git add recipes.json && git commit -m "🚨 Emergency restore"
```

### 完全リセット手順（最終手段）
```bash
# 警告: 未保存の変更はすべて失われます
# 1. 全ステージング削除
rm -f .recipes_staging.json .changes_log.txt

# 2. 最後の正常なgit状態に戻す
git checkout HEAD recipes.json

# 3. または、確実に正常なバックアップから復元
cp backups/recipes_backup_KNOWN_GOOD.json recipes.json

# 4. 動作確認
./recipe-json-manager.sh help
./recipe-json-manager.sh list
```

## 📋 トラブルシューティング チェックリスト

### 問題発生時の確認順序
- [ ] JSON構文エラー: `jq empty recipes.json`
- [ ] ファイル権限: `ls -la recipes.json recipe-json-manager.sh`
- [ ] ディスク容量: `df -h .`
- [ ] バックアップ存在: `ls -la backups/`
- [ ] ステージング状態: `./recipe-json-manager.sh changes`
- [ ] git状態: `git status`
- [ ] 最後の正常動作時点: `git log --oneline -5`

### 復旧優先順位
1. **即座復旧**: バックアップからの復元
2. **段階復旧**: git履歴からの復元
3. **手動復旧**: JSONの手動修正
4. **完全リセット**: 初期状態からの再構築

## 🎯 完了確認
✅ すべてのフェーズのワークフロー理解完了
✅ システム全体の運用方法習得完了
✅ トラブル対応能力確保完了

→ **petit-recipe マスターワークフロー達成**

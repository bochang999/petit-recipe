# WORKFLOW PHASE 2: 基本操作ワークフロー

## 🛠️ recipe-json-manager.sh 基本使用法

### Excel-like操作の基本概念
1. **編集フェーズ**: 複数の変更をステージング
2. **確認フェーズ**: 変更内容の確認
3. **保存フェーズ**: 一括保存またはキャンセル

## 📝 基本操作コマンド

### 1. ヘルプ・状況確認
```bash
./recipe-json-manager.sh help          # 使用方法表示
./recipe-json-manager.sh list          # 全レシピ一覧
./recipe-json-manager.sh changes       # 未保存変更確認
```

### 2. 表示・検索操作
```bash
./recipe-json-manager.sh view "豚の角煮"     # 特定レシピ表示
./recipe-json-manager.sh view "1"           # ID指定でも可能
./recipe-json-manager.sh list               # 一覧表示
```

### 3. 編集操作（ステージング）
```bash
# 新規追加
./recipe-json-manager.sh add "新レシピ: 唐揚げ"

# 既存編集
./recipe-json-manager.sh edit "豚の角煮" "材料に大根追加"

# 削除予約
./recipe-json-manager.sh delete "古いレシピ"
```

### 4. 保存・破棄操作
```bash
./recipe-json-manager.sh changes       # 変更確認
./recipe-json-manager.sh save          # 全変更保存
./recipe-json-manager.sh discard       # 全変更破棄
```

## 🔍 操作例：実際のワークフロー

### 例1: 単一レシピ編集
```bash
# 1. 現在の状況確認
./recipe-json-manager.sh changes
# → "📝 No pending changes"

# 2. レシピ編集
./recipe-json-manager.sh edit "豚の角煮" "調理時間を45分に変更"
# → "✅ Recipe changes staged"

# 3. 変更確認
./recipe-json-manager.sh changes
# → 変更ログ表示

# 4. 保存
./recipe-json-manager.sh save
# → バックアップ作成→保存完了
```

### 例2: 複数レシピ同時編集
```bash
# 1. 複数編集
./recipe-json-manager.sh add "新レシピ: 味噌汁"
./recipe-json-manager.sh edit "カレー" "スパイス追加"
./recipe-json-manager.sh delete "古いパスタ"

# 2. 全変更確認
./recipe-json-manager.sh changes

# 3. 一括保存
./recipe-json-manager.sh save
```

## ⚠️ 重要な注意点

### ステージング状態の理解
- **編集中**: `.recipes_staging.json` に一時保存
- **変更ログ**: `.changes_log.txt` で追跡
- **保存前**: 元ファイルは変更されない
- **保存後**: ステージングエリア自動削除

### エラー対処
- **JSON破損**: 保存時に検証、エラー時はロールバック
- **ファイル消失**: バックアップから復元可能
- **権限エラー**: chmod +x recipe-json-manager.sh

## 🎯 成功パターン確認

### ✅ 正常な流れ
1. list で現状確認
2. edit/add/delete で編集
3. changes で変更確認
4. save で保存
5. バックアップ自動作成

### ❌ 避けるべきパターン
- saveせずに終了（変更消失）
- 直接recipes.json編集（整合性破綻）
- バックアップ無視（復旧不可）

## 次フェーズ準備
✅ 基本操作習得完了
➡️ PHASE 3: AI統合ワークフローへ

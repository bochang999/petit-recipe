# WORKFLOW PHASE 4: 高度な編集パターン

## 🎯 複雑なレシピ編集ワークフロー

### 大規模レシピ改良パターン

#### パターン1: レシピの構造化・詳細化
```bash
# 目標: シンプルなレシピを詳細な3段階構造に変更

# ステップ1: 現状確認
./recipe-json-manager.sh view "煮干しラーメンスープ"

# ステップ2: 構造化編集（Claude実行）
# - 材料を【出汁用】【タレ用】【香味油用】に分類
# - 手順を段階別に詳細化
# - 調理時間の正確化

# ステップ3: 検証・保存
./recipe-json-manager.sh changes
./recipe-json-manager.sh save
```

#### パターン2: 複数レシピの一括更新
```bash
# 目標: 全レシピの栄養情報追加

# ステップ1: 段階的編集
./recipe-json-manager.sh edit "豚の角煮" "カロリー情報追加: 約450kcal/人"
./recipe-json-manager.sh edit "カレー" "カロリー情報追加: 約520kcal/人"
./recipe-json-manager.sh edit "ハンバーグ" "カロリー情報追加: 約380kcal/人"

# ステップ2: 一括保存
./recipe-json-manager.sh save
```

## 🔧 JSON構造の高度な操作

### 新フィールド追加パターン
```json
// 既存構造
{
  "name": "レシピ名",
  "ingredients": [...],
  "steps": [...]
}

// 拡張構造例
{
  "name": "レシピ名",
  "category": "和食",           // 新規追加
  "difficulty": "中級",         // 新規追加
  "calories": 450,             // 新規追加
  "tags": ["煮物", "家庭料理"], // 新規追加
  "ingredients": [...],
  "steps": [...]
}
```

### 材料構造の標準化
```json
// 統一形式の徹底
{
  "name": "具体的な材料名",
  "amount": 数値,
  "unit": "統一された単位"
}

// 良い例
{"name": "醤油", "amount": 30, "unit": "ml"}
{"name": "玉ねぎ", "amount": 1, "unit": "個"}

// 避ける例（旧形式）
{"name": "醤油 大さじ2", "amount": 1, "unit": "個"}
```

## 🎮 実用的な編集シナリオ

### シナリオ1: レシピのプロ仕様化
```bash
# 1. 基本レシピから出発
./recipe-json-manager.sh view "ハンバーグ"

# 2. プロの技術を追加
./recipe-json-manager.sh edit "ハンバーグ" "
- 牛ひき肉と豚ひき肉の比率を7:3に変更
- パン粉を牛乳でふやかす工程追加
- 焼き方を中火→弱火→蒸し焼きに詳細化
- 仕上げのデミグラスソース作成工程追加
"

# 3. 保存
./recipe-json-manager.sh save
```

### シナリオ2: 健康志向レシピ変換
```bash
# 1. 既存レシピの健康版作成
./recipe-json-manager.sh add "低糖質ハンバーグ"

# 2. 健康要素の詳細追加
./recipe-json-manager.sh edit "低糖質ハンバーグ" "
- パン粉を豆腐とおからに変更
- 付け合わせを野菜中心に変更
- カロリー情報: 通常版より30%減
- 糖質情報: 1人前5g以下
"
```

## 🚀 AI活用の高度パターン

### パターン1: レシピの自動分析・改善
```bash
# Gemini への指示例
gemini "全レシピを分析して、調理時間が実際と合わないものを特定して修正して"

# AI が実行する流れ:
# 1. 全レシピの調理時間を分析
# 2. 不合理な時間設定を特定
# 3. 実際の調理時間に基づいて修正
# 4. 複数のeditコマンドで一括修正
```

### パターン2: レシピの関連性整理
```bash
# Claude への指示例
"似たようなレシピをグループ化して、バリエーションとして整理して"

# Claude が実行:
# 1. レシピの類似性分析
# 2. 基本レシピとバリエーションの関係整理
# 3. JSON構造にvariation字段追加
# 4. 関連レシピのリンク構造作成
```

## 🔍 品質管理の高度パターン

### データ整合性チェック
```bash
# 1. JSON構文チェック
jq empty recipes.json

# 2. 必須フィールドチェック
jq '.recipes[] | select(.name == null or .ingredients == null or .steps == null)' recipes.json

# 3. 材料構造チェック
jq '.recipes[].ingredients[] | select(.name == null or .amount == null or .unit == null)' recipes.json

# 4. 重複チェック
jq '.recipes | group_by(.name) | map(select(length > 1))' recipes.json
```

### バックアップ戦略
```bash
# 重要な変更前の手動バックアップ
cp recipes.json "recipes_manual_backup_$(date +%Y%m%d_%H%M%S).json"

# 定期的な外部バックアップ
tar -czf "petit_recipe_backup_$(date +%Y%m%d).tar.gz" *.json *.sh *.md

# git によるバージョン管理
git add -A && git commit -m "レシピ大規模更新: $(date)"
```

## 🎯 高度な操作のベストプラクティス

### 大規模変更の推奨手順
1. **事前バックアップ**: 手動バックアップ作成
2. **段階実行**: 小さな変更を積み重ね
3. **中間確認**: changes コマンドで内容確認
4. **テスト保存**: 小規模変更で動作確認
5. **本格実行**: 大規模変更の実行
6. **最終検証**: JSON構文・内容の確認

### エラー復旧パターン
```bash
# JSON破損時の復旧
cp backups/recipes_backup_YYYYMMDD_HHMMSS.json recipes.json

# ステージング破損時の復旧
./recipe-json-manager.sh discard

# git によるロールバック
git checkout HEAD~1 recipes.json
```

## 次フェーズ準備
✅ 高度編集パターン習得完了
➡️ PHASE 5: トラブルシューティングへ

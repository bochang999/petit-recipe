# WORKFLOW PHASE 1: petit-recipe システム概要

## プロジェクト構造理解

### 🎯 プロジェクト目的
- ファイルベースレシピ管理システム
- Excel/Word並みのシンプル操作性
- AI（Gemini CLI + Claude）による効率的レシピ管理

### 📁 重要ファイル構成
```
petit-recipe/
├── recipes.json                    # メインデータファイル（27レシピ）
├── recipe-json-manager.sh          # CLI管理ツール（Excel-like）
├── convert-to-json.js              # データ変換・検証ツール
├── generate-recipes-json.html      # ブラウザ変換UI
├── script.js                       # Webアプリロジック
├── index.html                      # メインWebアプリ
├── style.css                       # スタイリング
└── backups/                        # 自動バックアップ
    └── recipes_backup_*.json
```

### 🔧 システム特徴
1. **ステージング方式**: 編集→編集→一括保存
2. **JSON構造**: 統一された{name, amount, unit}形式
3. **自動バックアップ**: 保存時に自動生成
4. **AI対応**: GeminiCLI + Claude完全統合

### ⚡ 動作環境
- **プラットフォーム**: Termux (Android Linux)
- **ツール**: bash, jq, git
- **AI**: Gemini CLI, Claude Code
- **データ形式**: JSON (recipes.json)

## データ構造理解

### レシピJSONフォーマット
```json
{
  "version": "1.0",
  "lastUpdated": "2025-01-28T...",
  "recipes": [
    {
      "id": "1",
      "name": "レシピ名",
      "servings": 4,
      "cookTime": "30分",
      "ingredients": [
        {
          "name": "材料名",
          "amount": 100,
          "unit": "g"
        }
      ],
      "steps": [
        "手順1の説明",
        "手順2の説明"
      ]
    }
  ]
}
```

### 💡 重要な設計原則
- **一意性**: idとnameで識別
- **構造化**: 材料は必ずname/amount/unit
- **拡張性**: 新フィールド追加可能
- **AI可読性**: 自然言語とJSONの両立

## 次フェーズ準備
✅ システム構造理解完了
➡️ PHASE 2: 基本操作ワークフローへ

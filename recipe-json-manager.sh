#!/bin/bash
# BOC-108: Recipe JSON Manager - Gemini CLI Integration
# Direct manipulation of recipes.json for AI-powered recipe management

RECIPE_FILE="/data/data/com.termux/files/home/petit-recipe/recipes.json"
BACKUP_DIR="/data/data/com.termux/files/home/petit-recipe/backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Helper function: Create backup
create_backup() {
    if [ -f "$RECIPE_FILE" ]; then
        local timestamp=$(date +"%Y%m%d_%H%M%S")
        local backup_file="$BACKUP_DIR/recipes_backup_$timestamp.json"
        cp "$RECIPE_FILE" "$backup_file"
        echo -e "${GREEN}✅ Backup created: $backup_file${NC}"
    fi
}

# Helper function: Validate JSON
validate_json() {
    local file="$1"
    if command -v jq >/dev/null 2>&1; then
        if jq empty "$file" 2>/dev/null; then
            return 0
        else
            return 1
        fi
    else
        # Basic validation without jq
        if [ -f "$file" ] && [ -s "$file" ]; then
            return 0
        else
            return 1
        fi
    fi
}

# Function: Add recipe
add_recipe() {
    local recipe_text="$1"

    if [ -z "$recipe_text" ]; then
        echo -e "${RED}❌ Error: Recipe text is required${NC}"
        echo "Usage: $0 add \"Recipe text here\""
        exit 1
    fi

    echo -e "${BLUE}🔄 Adding recipe using Gemini CLI...${NC}"
    create_backup

    # Use Gemini CLI to process the recipe
    local temp_input=$(mktemp)
    local temp_output=$(mktemp)

    echo "$recipe_text" > "$temp_input"

    # Gemini CLI prompt for adding recipe
    gemini -p "以下のレシピテキストを既存のrecipes.jsonファイルに追加してください。

既存ファイル: $RECIPE_FILE

新しいレシピ:
$recipe_text

要件:
1. 既存のJSONファイルの構造を維持
2. 新しいレシピに適切なIDを割り当て (既存の最大ID + 1)
3. ingredients配列は{name, amount, unit}形式で作成
4. steps配列は文字列配列として作成
5. 完全なJSONファイルを出力してください

エラーのない有効なJSONファイルとして出力してください。" "$RECIPE_FILE" > "$temp_output"

    if validate_json "$temp_output"; then
        mv "$temp_output" "$RECIPE_FILE"
        echo -e "${GREEN}✅ Recipe added successfully!${NC}"
        echo -e "${YELLOW}💡 Use window.forceReloadRecipes() in the app to see changes${NC}"
    else
        echo -e "${RED}❌ Error: Generated JSON is invalid${NC}"
        echo "Restoring from backup..."
        if [ -f "$BACKUP_DIR/recipes_backup_$(date +"%Y%m%d")*.json" ]; then
            cp "$BACKUP_DIR"/recipes_backup_*.json "$RECIPE_FILE" 2>/dev/null || true
        fi
    fi

    rm -f "$temp_input" "$temp_output"
}

# Function: Edit recipe
edit_recipe() {
    local recipe_id="$1"
    local changes="$2"

    if [ -z "$recipe_id" ] || [ -z "$changes" ]; then
        echo -e "${RED}❌ Error: Recipe ID and changes are required${NC}"
        echo "Usage: $0 edit \"recipe_id\" \"changes description\""
        exit 1
    fi

    echo -e "${BLUE}🔄 Editing recipe ID: $recipe_id...${NC}"
    create_backup

    # Use Gemini CLI to edit the recipe
    local temp_output=$(mktemp)

    gemini -p "recipes.jsonファイルのID \"$recipe_id\" のレシピを以下の通り編集してください:

変更内容: $changes

要件:
1. 指定されたIDのレシピのみを変更
2. 他のレシピは変更しない
3. JSONファイル構造を維持
4. ingredients配列は{name, amount, unit}形式を維持
5. 完全なJSONファイルを出力

エラーのない有効なJSONファイルとして出力してください。" "$RECIPE_FILE" > "$temp_output"

    if validate_json "$temp_output"; then
        mv "$temp_output" "$RECIPE_FILE"
        echo -e "${GREEN}✅ Recipe edited successfully!${NC}"
        echo -e "${YELLOW}💡 Use window.forceReloadRecipes() in the app to see changes${NC}"
    else
        echo -e "${RED}❌ Error: Generated JSON is invalid${NC}"
    fi

    rm -f "$temp_output"
}

# Function: Delete recipe
delete_recipe() {
    local recipe_id="$1"

    if [ -z "$recipe_id" ]; then
        echo -e "${RED}❌ Error: Recipe ID is required${NC}"
        echo "Usage: $0 delete \"recipe_id\""
        exit 1
    fi

    echo -e "${BLUE}🔄 Deleting recipe ID: $recipe_id...${NC}"
    create_backup

    # Use Gemini CLI to delete the recipe
    local temp_output=$(mktemp)

    gemini -p "recipes.jsonファイルからID \"$recipe_id\" のレシピを削除してください。

要件:
1. 指定されたIDのレシピのみを削除
2. 他のレシピはそのまま維持
3. JSONファイル構造を維持
4. recipes配列から対象レシピを除去
5. 完全なJSONファイルを出力

エラーのない有効なJSONファイルとして出力してください。" "$RECIPE_FILE" > "$temp_output"

    if validate_json "$temp_output"; then
        mv "$temp_output" "$RECIPE_FILE"
        echo -e "${GREEN}✅ Recipe deleted successfully!${NC}"
        echo -e "${YELLOW}💡 Use window.forceReloadRecipes() in the app to see changes${NC}"
    else
        echo -e "${RED}❌ Error: Generated JSON is invalid${NC}"
    fi

    rm -f "$temp_output"
}

# Function: List recipes
list_recipes() {
    echo -e "${BLUE}📋 Current recipes in recipes.json:${NC}"

    if [ -f "$RECIPE_FILE" ]; then
        if command -v jq >/dev/null 2>&1; then
            jq -r '.recipes[] | "\(.id): \(.name)"' "$RECIPE_FILE"
        else
            grep -o '"id":"[^"]*"' "$RECIPE_FILE" | head -20
        fi
    else
        echo -e "${RED}❌ recipes.json not found${NC}"
    fi
}

# Function: Show usage
show_usage() {
    echo -e "${BLUE}BOC-108: Recipe JSON Manager${NC}"
    echo ""
    echo "Usage:"
    echo "  $0 add \"Recipe text\"       - Add new recipe"
    echo "  $0 edit \"ID\" \"changes\"     - Edit existing recipe"
    echo "  $0 delete \"ID\"             - Delete recipe"
    echo "  $0 list                    - List all recipes"
    echo ""
    echo "Examples:"
    echo "  $0 add \"カルボナーラ\n材料: パスタ200g, ベーコン100g\n作り方: 1.パスタを茹でる\""
    echo "  $0 edit \"5\" \"調理時間を20分に変更\""
    echo "  $0 delete \"3\""
    echo ""
    echo -e "${YELLOW}💡 After any changes, run window.forceReloadRecipes() in the app${NC}"
}

# Main script logic
case "${1:-help}" in
    "add")
        add_recipe "$2"
        ;;
    "edit")
        edit_recipe "$2" "$3"
        ;;
    "delete")
        delete_recipe "$2"
        ;;
    "list")
        list_recipes
        ;;
    "help"|*)
        show_usage
        ;;
esac

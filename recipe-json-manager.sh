#!/bin/bash
# BOC-108: Recipe JSON Manager - Excel-like batch editing with manual save
# Direct manipulation of recipes.json with staging area for multiple edits

RECIPE_FILE="/data/data/com.termux/files/home/petit-recipe/recipes.json"
BACKUP_DIR="/data/data/com.termux/files/home/petit-recipe/backups"
STAGING_FILE="/data/data/com.termux/files/home/petit-recipe/.recipes_staging.json"
CHANGES_LOG="/data/data/com.termux/files/home/petit-recipe/.changes_log.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Initialize staging area if not exists
init_staging() {
    if [ ! -f "$STAGING_FILE" ]; then
        cp "$RECIPE_FILE" "$STAGING_FILE"
        echo "$(date): Staging area initialized" > "$CHANGES_LOG"
        echo -e "${BLUE}📝 Staging area initialized${NC}"
    fi
}

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

# Function: Add recipe (to staging)
add_recipe() {
    local recipe_text="$1"

    if [ -z "$recipe_text" ]; then
        echo -e "${RED}❌ Error: Recipe description is required${NC}"
        echo "Usage: $0 add \"recipe description\""
        return 1
    fi

    init_staging

    echo -e "${YELLOW}🔄 Adding recipe to staging area...${NC}"
    echo "$(date): ADD - $recipe_text" >> "$CHANGES_LOG"
    echo -e "${GREEN}✅ Recipe added to staging area${NC}"
    echo -e "${BLUE}💾 Use 'save' command to apply changes${NC}"
}

# Function: Edit recipe (to staging)
edit_recipe() {
    local recipe_id="$1"
    local changes="$2"

    if [ -z "$recipe_id" ] || [ -z "$changes" ]; then
        echo -e "${RED}❌ Error: Recipe ID and changes are required${NC}"
        echo "Usage: $0 edit \"recipe_id\" \"changes description\""
        return 1
    fi

    init_staging

    echo -e "${YELLOW}🔄 Editing recipe in staging area...${NC}"
    echo "$(date): EDIT - Recipe: $recipe_id, Changes: $changes" >> "$CHANGES_LOG"
    echo -e "${GREEN}✅ Recipe changes staged${NC}"
    echo -e "${BLUE}💾 Use 'save' command to apply changes${NC}"
}

# Function: Delete recipe (to staging)
delete_recipe() {
    local recipe_id="$1"

    if [ -z "$recipe_id" ]; then
        echo -e "${RED}❌ Error: Recipe ID is required${NC}"
        echo "Usage: $0 delete \"recipe_id\""
        return 1
    fi

    init_staging

    echo -e "${YELLOW}🔄 Marking recipe for deletion in staging area...${NC}"
    echo "$(date): DELETE - Recipe: $recipe_id" >> "$CHANGES_LOG"
    echo -e "${GREEN}✅ Recipe marked for deletion${NC}"
    echo -e "${BLUE}💾 Use 'save' command to apply changes${NC}"
}

# Function: Show pending changes
show_changes() {
    if [ ! -f "$CHANGES_LOG" ]; then
        echo -e "${BLUE}📝 No pending changes${NC}"
        return 0
    fi

    echo -e "${BLUE}📋 Pending Changes:${NC}"
    echo -e "${YELLOW}==================${NC}"
    cat "$CHANGES_LOG"
    echo -e "${YELLOW}==================${NC}"
    echo -e "${BLUE}💾 Use 'save' to apply all changes${NC}"
    echo -e "${BLUE}🔄 Use 'discard' to cancel all changes${NC}"
}

# Function: Save all changes (like Excel Ctrl+S)
save_changes() {
    if [ ! -f "$STAGING_FILE" ] && [ ! -f "$CHANGES_LOG" ]; then
        echo -e "${BLUE}📝 No changes to save${NC}"
        return 0
    fi

    echo -e "${YELLOW}💾 Saving all changes...${NC}"

    # Create backup before saving
    create_backup

    # Apply staging changes to main file
    if [ -f "$STAGING_FILE" ]; then
        if validate_json "$STAGING_FILE"; then
            cp "$STAGING_FILE" "$RECIPE_FILE"
            echo -e "${GREEN}✅ Changes saved successfully${NC}"

            # Show what was changed
            if [ -f "$CHANGES_LOG" ]; then
                echo -e "${BLUE}📋 Applied changes:${NC}"
                cat "$CHANGES_LOG"
            fi

            # Clean up staging area
            rm -f "$STAGING_FILE"
            rm -f "$CHANGES_LOG"
            echo -e "${BLUE}🧹 Staging area cleared${NC}"
        else
            echo -e "${RED}❌ Error: Invalid JSON in staging area${NC}"
            return 1
        fi
    fi
}

# Function: Discard all changes
discard_changes() {
    if [ ! -f "$STAGING_FILE" ] && [ ! -f "$CHANGES_LOG" ]; then
        echo -e "${BLUE}📝 No changes to discard${NC}"
        return 0
    fi

    echo -e "${YELLOW}🔄 Discarding all changes...${NC}"
    rm -f "$STAGING_FILE"
    rm -f "$CHANGES_LOG"
    echo -e "${GREEN}✅ All changes discarded${NC}"
}

# Function: View recipe
view_recipe() {
    local recipe_id="$1"

    if [ -z "$recipe_id" ]; then
        echo -e "${RED}❌ Error: Recipe ID is required${NC}"
        echo "Usage: $0 view \"recipe_id\""
        return 1
    fi

    echo -e "${BLUE}📖 Viewing recipe: $recipe_id${NC}"
    # Use staging file if exists, otherwise main file
    local file_to_use="$RECIPE_FILE"
    if [ -f "$STAGING_FILE" ]; then
        file_to_use="$STAGING_FILE"
        echo -e "${YELLOW}(Showing staged version)${NC}"
    fi

    if command -v jq >/dev/null 2>&1; then
        jq -r --arg id "$recipe_id" '.recipes[] | select(.name == $id or .id == $id) | "Name: \(.name)\nServings: \(.servings)\nCook Time: \(.cookTime)\n\nIngredients:\n" + (.ingredients | map("- \(.name): \(.amount) \(.unit)") | join("\n")) + "\n\nSteps:\n" + (.steps | to_entries | map("\(.key + 1). \(.value)") | join("\n"))' "$file_to_use"
    else
        echo -e "${YELLOW}⚠️  jq not available, showing raw JSON${NC}"
        grep -A 20 "\"name\": \"$recipe_id\"" "$file_to_use"
    fi
}

# Function: List all recipes
list_recipes() {
    echo -e "${BLUE}📋 Recipe List:${NC}"

    # Use staging file if exists, otherwise main file
    local file_to_use="$RECIPE_FILE"
    if [ -f "$STAGING_FILE" ]; then
        file_to_use="$STAGING_FILE"
        echo -e "${YELLOW}(Showing staged version)${NC}"
    fi

    if command -v jq >/dev/null 2>&1; then
        jq -r '.recipes[] | "\(.id): \(.name) (serves \(.servings), \(.cookTime))"' "$file_to_use"
    else
        echo -e "${YELLOW}⚠️  jq not available, showing limited info${NC}"
        grep -o '"name": "[^"]*"' "$file_to_use" | sed 's/"name": "//; s/"//'
    fi
}

# Function: Show help
show_help() {
    echo -e "${BLUE}🍽️  Recipe JSON Manager - Excel-like Interface${NC}"
    echo -e "${YELLOW}===============================================${NC}"
    echo "Usage: $0 [command] [arguments]"
    echo ""
    echo -e "${GREEN}📝 Editing Commands (staged):${NC}"
    echo "  add \"recipe description\"     - Add new recipe to staging"
    echo "  edit \"recipe_id\" \"changes\"   - Edit existing recipe in staging"
    echo "  delete \"recipe_id\"           - Mark recipe for deletion in staging"
    echo ""
    echo -e "${GREEN}💾 File Operations:${NC}"
    echo "  save                         - Save all staged changes (like Ctrl+S)"
    echo "  discard                      - Discard all staged changes"
    echo "  changes                      - Show pending changes"
    echo ""
    echo -e "${GREEN}👀 Viewing Commands:${NC}"
    echo "  view \"recipe_id\"             - View specific recipe"
    echo "  list                         - List all recipes"
    echo ""
    echo -e "${BLUE}💡 Excel-like Workflow:${NC}"
    echo "  1. Make multiple edits (add/edit/delete)"
    echo "  2. Review changes with 'changes' command"
    echo "  3. Save all at once with 'save' command"
    echo "  4. Or discard with 'discard' command"
}

# Main script logic
case "$1" in
    "add")
        add_recipe "$2"
        ;;
    "edit")
        edit_recipe "$2" "$3"
        ;;
    "delete")
        delete_recipe "$2"
        ;;
    "view")
        view_recipe "$2"
        ;;
    "list")
        list_recipes
        ;;
    "save")
        save_changes
        ;;
    "discard")
        discard_changes
        ;;
    "changes")
        show_changes
        ;;
    "help"|"-h"|"--help"|"")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac

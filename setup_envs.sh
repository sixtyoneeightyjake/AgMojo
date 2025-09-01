#!/bin/bash

# Script to set up environment variables on remote server
# Usage: ./setup_envs.sh [frontend|backend|all]

SETUP_TYPE=${1:-all}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Environment Setup Script${NC}"
echo "Setting up environment variables for: $SETUP_TYPE"
echo ""

# Function to prompt for environment variable
prompt_env_var() {
    local var_name=$1
    local description=$2
    local current_value=$(printenv $var_name)
    
    if [ -n "$current_value" ]; then
        echo -e "${YELLOW}$var_name${NC} is already set to: $current_value"
        read -p "Do you want to update it? (y/N): " update
        if [[ $update =~ ^[Yy]$ ]]; then
            read -p "Enter new value for $var_name ($description): " new_value
            export $var_name="$new_value"
            echo "export $var_name=\"$new_value\"" >> ~/.bashrc
            echo "export $var_name=\"$new_value\"" >> ~/.zshrc
            echo -e "${GREEN}✓${NC} Updated $var_name"
        else
            echo -e "${YELLOW}⚠${NC} Keeping existing $var_name"
        fi
    else
        read -p "Enter value for $var_name ($description): " new_value
        if [ -n "$new_value" ]; then
            export $var_name="$new_value"
            echo "export $var_name=\"$new_value\"" >> ~/.bashrc
            echo "export $var_name=\"$new_value\"" >> ~/.zshrc
            echo -e "${GREEN}✓${NC} Set $var_name"
        else
            echo -e "${RED}✗${NC} Skipped $var_name (empty value)"
        fi
    fi
    echo ""
}

# Backend environment variables
setup_backend() {
    echo -e "${GREEN}Setting up Backend Environment Variables${NC}"
    echo "==========================================="
    
    prompt_env_var "OPENAI_API_KEY" "OpenAI API key for LLM functionality"
    prompt_env_var "ANTHROPIC_API_KEY" "Anthropic API key for Claude models"
    prompt_env_var "SUPABASE_URL" "Supabase project URL"
    prompt_env_var "SUPABASE_ANON_KEY" "Supabase anonymous key"
    prompt_env_var "SUPABASE_SERVICE_ROLE_KEY" "Supabase service role key"
    prompt_env_var "DATABASE_URL" "Database connection string"
    prompt_env_var "REDIS_URL" "Redis connection URL"
    prompt_env_var "JWT_SECRET" "JWT signing secret"
    prompt_env_var "NODE_ENV" "Node environment (development/production)"
    prompt_env_var "PORT" "Server port (default: 3000)"
}

# Frontend environment variables
setup_frontend() {
    echo -e "${GREEN}Setting up Frontend Environment Variables${NC}"
    echo "==========================================="
    
    prompt_env_var "VITE_SUPABASE_URL" "Supabase URL for frontend"
    prompt_env_var "VITE_SUPABASE_ANON_KEY" "Supabase anonymous key for frontend"
    prompt_env_var "VITE_API_BASE_URL" "Backend API base URL"
    prompt_env_var "VITE_APP_NAME" "Application name"
    prompt_env_var "VITE_APP_VERSION" "Application version"
    prompt_env_var "VITE_ENVIRONMENT" "Frontend environment (dev/staging/prod)"
}

# Main execution
case $SETUP_TYPE in
    "frontend")
        setup_frontend
        ;;
    "backend")
        setup_backend
        ;;
    "all")
        setup_backend
        echo ""
        setup_frontend
        ;;
    *)
        echo -e "${RED}Error:${NC} Invalid setup type. Use 'frontend', 'backend', or 'all'"
        echo "Usage: $0 [frontend|backend|all]"
        exit 1
        ;;
esac

echo -e "${GREEN}Environment setup complete!${NC}"
echo "Environment variables have been added to ~/.bashrc and ~/.zshrc"
echo "Run 'source ~/.bashrc' or 'source ~/.zshrc' to apply changes to current session"
echo ""
echo -e "${YELLOW}Note:${NC} Sensitive variables are now set. Keep your server secure!"
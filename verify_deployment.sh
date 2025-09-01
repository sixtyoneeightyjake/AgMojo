#!/usr/bin/env bash

# AgentMojo Deployment Verification Script
# This script verifies that the deployment was successful

set -euo pipefail

# Configuration
DOMAIN="agentmojo.sixtyoneeighty.com"
APP_DIR="/opt/agentmojo"
APP_USER="agentmojo"
SERVICE_NAME="agentmojo"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Test functions
test_pass() {
    echo -e "${GREEN}✓ PASS${NC} $1"
    ((PASSED++))
}

test_fail() {
    echo -e "${RED}✗ FAIL${NC} $1"
    ((FAILED++))
}

test_warn() {
    echo -e "${YELLOW}⚠ WARN${NC} $1"
    ((WARNINGS++))
}

test_info() {
    echo -e "${BLUE}ℹ INFO${NC} $1"
}

# Check if running as root
check_privileges() {
    if [[ $EUID -eq 0 ]]; then
        test_info "Running as root - all checks available"
        return 0
    else
        test_warn "Not running as root - some checks may be limited"
        return 1
    fi
}

# Test system dependencies
test_system_dependencies() {
    echo -e "\n${BLUE}=== System Dependencies ===${NC}"
    
    # Check Docker
    if command -v docker &> /dev/null; then
        if docker --version &> /dev/null; then
            test_pass "Docker is installed and accessible"
        else
            test_fail "Docker is installed but not accessible"
        fi
    else
        test_fail "Docker is not installed"
    fi
    
    # Check Docker Compose
    if docker compose version &> /dev/null; then
        test_pass "Docker Compose is available"
    else
        test_fail "Docker Compose is not available"
    fi
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        if [[ $NODE_VERSION == v22* ]]; then
            test_pass "Node.js $NODE_VERSION is installed"
        else
            test_warn "Node.js $NODE_VERSION is installed (expected v22.x)"
        fi
        
        # Check for conflicting packages
        if dpkg -l | grep -q "libnode-dev"; then
            test_warn "Conflicting libnode-dev package detected - may cause issues"
        fi
    else
        test_fail "Node.js is not installed"
    fi
    
    # Check APT health
     if python3 -c "import apt_pkg" &>/dev/null; then
         test_pass "APT python bindings working correctly"
     else
         test_fail "APT python bindings broken (apt_pkg module missing)"
     fi

# Check permissions
check_permissions() {
    echo -e "\n${BLUE}=== Directory Permissions ===${NC}"
    
    local app_user="agentmojo"
    local app_dir="/opt/agentmojo"
    local workspace_dir="$app_dir/workspace"
    local data_dir="/opt/openhands_data"
    
    # Check if application user exists
    if id "$app_user" &>/dev/null; then
        test_pass "Application user '$app_user' exists"
        
        # Check application directory ownership
        if [[ -d "$app_dir" ]]; then
            local owner=$(stat -c '%U:%G' "$app_dir" 2>/dev/null || echo "unknown")
            if [[ "$owner" == "$app_user:$app_user" ]]; then
                test_pass "Application directory has correct ownership ($owner)"
            else
                test_fail "Application directory has incorrect ownership ($owner, expected $app_user:$app_user)"
            fi
            
            # Test write permissions
            if sudo -u "$app_user" test -w "$app_dir" 2>/dev/null; then
                test_pass "Application user can write to application directory"
            else
                test_fail "Application user cannot write to application directory"
            fi
        else
            test_warn "Application directory does not exist: $app_dir"
        fi
        
        # Check workspace directory
        if [[ -d "$workspace_dir" ]]; then
            if sudo -u "$app_user" test -w "$workspace_dir" 2>/dev/null; then
                test_pass "Workspace directory is writable by application user"
            else
                test_fail "Workspace directory is not writable by application user"
            fi
        else
            test_warn "Workspace directory does not exist: $workspace_dir"
        fi
        
        # Check OpenHands data directory
        if [[ -d "$data_dir" ]]; then
            local data_owner=$(stat -c '%U:%G' "$data_dir" 2>/dev/null || echo "unknown")
            if [[ "$data_owner" == "$app_user:$app_user" ]]; then
                test_pass "OpenHands data directory has correct ownership"
            else
                test_fail "OpenHands data directory has incorrect ownership ($data_owner)"
            fi
        else
            test_warn "OpenHands data directory does not exist: $data_dir"
        fi
        
        # Check Docker group membership (if Docker is installed)
        if command -v docker &> /dev/null; then
            if groups "$app_user" | grep -q docker; then
                test_pass "Application user is in docker group"
            else
                test_fail "Application user is not in docker group"
            fi
        fi
        
    else
        test_fail "Application user '$app_user' does not exist"
    fi
}

# Check Supabase environment variables
check_supabase_env() {
    echo -e "\n${BLUE}=== Supabase Environment ===${NC}"
    
    local env_file="$APP_DIR/.env"
    local required_vars=("SUPABASE_URL" "VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY")
    local missing_vars=()
    local placeholder_vars=()
    
    if [[ ! -f "$env_file" ]]; then
        test_fail "Environment file not found: $env_file"
        return
    fi
    
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" "$env_file"; then
            local value=$(grep "^$var=" "$env_file" | cut -d'=' -f2)
            if [[ -z "$value" || "$value" == "your_${var,,}_here" || "$value" == "https://your-project.supabase.co" ]]; then
                placeholder_vars+=("$var")
            else
                test_pass "$var is configured"
            fi
        else
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        test_fail "Missing Supabase environment variables: ${missing_vars[*]}"
        test_info "Run: sudo ./fix_supabase_env.sh"
    fi
    
    if [[ ${#placeholder_vars[@]} -gt 0 ]]; then
        test_warn "Supabase variables with placeholder values: ${placeholder_vars[*]}"
        test_info "Run: sudo ./fix_supabase_env.sh"
    fi
    
    # Test if variables can be loaded
    if (set -a; source "$env_file" 2>/dev/null; set +a; [[ -n "$SUPABASE_URL" && -n "$VITE_SUPABASE_URL" && -n "$VITE_SUPABASE_ANON_KEY" ]]); then
        test_pass "All Supabase environment variables are properly configured"
    else
        test_fail "Failed to load Supabase environment variables"
    fi
}
    
    # Check Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
        if [[ $PYTHON_VERSION == *"3.12"* ]]; then
            test_pass "Python $PYTHON_VERSION is installed"
        else
            test_warn "Python $PYTHON_VERSION is installed (expected 3.12.x)"
        fi
    else
        test_fail "Python 3 is not installed"
    fi
    
    # Check Poetry
    if command -v poetry &> /dev/null; then
        test_pass "Poetry is installed"
    else
        test_fail "Poetry is not installed"
    fi
    
    # Check Nginx
    if command -v nginx &> /dev/null; then
        test_pass "Nginx is installed"
    else
        test_fail "Nginx is not installed"
    fi
    
    # Check Certbot
    if command -v certbot &> /dev/null; then
        test_pass "Certbot is installed"
    else
        test_fail "Certbot is not installed"
    fi
}

# Test application setup
test_application_setup() {
    echo -e "\n${BLUE}=== Application Setup ===${NC}"
    
    # Check application user
    if id "$APP_USER" &>/dev/null; then
        test_pass "Application user '$APP_USER' exists"
    else
        test_fail "Application user '$APP_USER' does not exist"
    fi
    
    # Check application directory
    if [ -d "$APP_DIR" ]; then
        test_pass "Application directory exists: $APP_DIR"
    else
        test_fail "Application directory does not exist: $APP_DIR"
        return
    fi
    
    # Check git repository
    if [ -d "$APP_DIR/.git" ]; then
        test_pass "Git repository is present"
    else
        test_fail "Git repository is not present"
    fi
    
    # Check environment file
    if [ -f "$APP_DIR/.env" ]; then
        test_pass "Environment file exists"
        
        # Check for required environment variables
        if grep -q "OPENAI_API_KEY" "$APP_DIR/.env"; then
            if grep -q "OPENAI_API_KEY=your_openai_api_key_here" "$APP_DIR/.env"; then
                test_warn "OPENAI_API_KEY is not configured (still has placeholder)"
            else
                test_pass "OPENAI_API_KEY is configured"
            fi
        else
            test_fail "OPENAI_API_KEY is missing from environment file"
        fi
        
        if grep -q "SUPABASE_URL" "$APP_DIR/.env"; then
            if grep -q "SUPABASE_URL=your_supabase_url_here" "$APP_DIR/.env"; then
                test_warn "SUPABASE_URL is not configured (still has placeholder)"
            else
                test_pass "SUPABASE_URL is configured"
            fi
        else
            test_fail "SUPABASE_URL is missing from environment file"
        fi
        
        if grep -q "SUPABASE_ANON_KEY" "$APP_DIR/.env"; then
            if grep -q "SUPABASE_ANON_KEY=your_supabase_anon_key_here" "$APP_DIR/.env"; then
                test_warn "SUPABASE_ANON_KEY is not configured (still has placeholder)"
            else
                test_pass "SUPABASE_ANON_KEY is configured"
            fi
        else
            test_fail "SUPABASE_ANON_KEY is missing from environment file"
        fi
    else
        test_fail "Environment file does not exist"
    fi
    
    # Check workspace directory
    if [ -d "$APP_DIR/workspace" ]; then
        test_pass "Workspace directory exists"
    else
        test_fail "Workspace directory does not exist"
    fi
    
    # Check OpenHands data directory
    if [ -d "/home/$APP_USER/.openhands" ]; then
        test_pass "OpenHands data directory exists"
    else
        test_fail "OpenHands data directory does not exist"
    fi
}

# Test services
test_services() {
    echo -e "\n${BLUE}=== Services ===${NC}"
    
    # Check systemd service
    if systemctl list-unit-files | grep -q "$SERVICE_NAME.service"; then
        test_pass "Systemd service is installed"
        
        if systemctl is-enabled "$SERVICE_NAME" &>/dev/null; then
            test_pass "Service is enabled"
        else
            test_fail "Service is not enabled"
        fi
        
        if systemctl is-active "$SERVICE_NAME" &>/dev/null; then
            test_pass "Service is running"
        else
            test_fail "Service is not running"
        fi
    else
        test_fail "Systemd service is not installed"
    fi
    
    # Check Docker service
    if systemctl is-active docker &>/dev/null; then
        test_pass "Docker service is running"
    else
        test_fail "Docker service is not running"
    fi
    
    # Check Nginx service
    if systemctl is-active nginx &>/dev/null; then
        test_pass "Nginx service is running"
    else
        test_fail "Nginx service is not running"
    fi
}

# Test Docker containers
test_docker_containers() {
    echo -e "\n${BLUE}=== Docker Containers ===${NC}"
    
    if [ -d "$APP_DIR" ]; then
        cd "$APP_DIR"
        
        # Check if containers are running
        if docker compose -f docker-compose.yml -f docker-compose.prod.yml ps --services --filter "status=running" | grep -q "openhands"; then
            test_pass "Application container is running"
        else
            test_fail "Application container is not running"
        fi
        
        # Check container health
        CONTAINER_ID=$(docker compose -f docker-compose.yml -f docker-compose.prod.yml ps -q openhands 2>/dev/null || echo "")
        if [ -n "$CONTAINER_ID" ]; then
            if docker inspect "$CONTAINER_ID" --format='{{.State.Health.Status}}' 2>/dev/null | grep -q "healthy\|starting"; then
                test_pass "Container health check is passing"
            else
                test_warn "Container health check status unknown or failing"
            fi
        fi
    else
        test_fail "Cannot check containers - application directory not found"
    fi
}

# Test network connectivity
test_network() {
    echo -e "\n${BLUE}=== Network Connectivity ===${NC}"
    
    # Check if port 3000 is listening locally
    if netstat -tlnp 2>/dev/null | grep -q ":3000 "; then
        test_pass "Application is listening on port 3000"
    else
        test_fail "Application is not listening on port 3000"
    fi
    
    # Check local HTTP response
    if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 | grep -q "200\|302\|404"; then
        test_pass "Local HTTP connection successful"
    else
        test_fail "Local HTTP connection failed"
    fi
    
    # Check if ports 80 and 443 are listening
    if netstat -tlnp 2>/dev/null | grep -q ":80 "; then
        test_pass "Port 80 (HTTP) is listening"
    else
        test_fail "Port 80 (HTTP) is not listening"
    fi
    
    if netstat -tlnp 2>/dev/null | grep -q ":443 "; then
        test_pass "Port 443 (HTTPS) is listening"
    else
        test_fail "Port 443 (HTTPS) is not listening"
    fi
}

# Test SSL certificate
test_ssl() {
    echo -e "\n${BLUE}=== SSL Certificate ===${NC}"
    
    # Check if certificate files exist
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        test_pass "SSL certificate file exists"
        
        # Check certificate expiry
        EXPIRY_DATE=$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" | cut -d= -f2)
        EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
        CURRENT_EPOCH=$(date +%s)
        DAYS_UNTIL_EXPIRY=$(( (EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))
        
        if [ $DAYS_UNTIL_EXPIRY -gt 30 ]; then
            test_pass "SSL certificate is valid for $DAYS_UNTIL_EXPIRY days"
        elif [ $DAYS_UNTIL_EXPIRY -gt 7 ]; then
            test_warn "SSL certificate expires in $DAYS_UNTIL_EXPIRY days"
        else
            test_fail "SSL certificate expires in $DAYS_UNTIL_EXPIRY days"
        fi
    else
        test_fail "SSL certificate file does not exist"
    fi
    
    # Test HTTPS connection
    if curl -s -I "https://$DOMAIN" | grep -q "HTTP/[12]\.[01] [23][0-9][0-9]"; then
        test_pass "HTTPS connection to $DOMAIN successful"
    else
        test_fail "HTTPS connection to $DOMAIN failed"
    fi
}

# Test Nginx configuration
test_nginx() {
    echo -e "\n${BLUE}=== Nginx Configuration ===${NC}"
    
    # Test nginx configuration syntax
    if nginx -t &>/dev/null; then
        test_pass "Nginx configuration syntax is valid"
    else
        test_fail "Nginx configuration syntax is invalid"
    fi
    
    # Check if site is enabled
    if [ -f "/etc/nginx/sites-enabled/agentmojo" ]; then
        test_pass "Nginx site configuration is enabled"
    else
        test_fail "Nginx site configuration is not enabled"
    fi
    
    # Check if default site is disabled
    if [ ! -f "/etc/nginx/sites-enabled/default" ]; then
        test_pass "Default nginx site is disabled"
    else
        test_warn "Default nginx site is still enabled"
    fi
}

# Test firewall
test_firewall() {
    echo -e "\n${BLUE}=== Firewall ===${NC}"
    
    # Check if UFW is installed and active
    if command -v ufw &> /dev/null; then
        test_pass "UFW firewall is installed"
        
        if ufw status | grep -q "Status: active"; then
            test_pass "UFW firewall is active"
            
            # Check required ports
            if ufw status | grep -q "22/tcp"; then
                test_pass "SSH port (22) is allowed"
            else
                test_warn "SSH port (22) may not be explicitly allowed"
            fi
            
            if ufw status | grep -q "80/tcp"; then
                test_pass "HTTP port (80) is allowed"
            else
                test_fail "HTTP port (80) is not allowed"
            fi
            
            if ufw status | grep -q "443/tcp"; then
                test_pass "HTTPS port (443) is allowed"
            else
                test_fail "HTTPS port (443) is not allowed"
            fi
        else
            test_warn "UFW firewall is not active"
        fi
    else
        test_warn "UFW firewall is not installed"
    fi
}

# Test management scripts
test_management_scripts() {
    echo -e "\n${BLUE}=== Management Scripts ===${NC}"
    
    local scripts=("agentmojo-status" "agentmojo-logs" "agentmojo-update")
    
    for script in "${scripts[@]}"; do
        if [ -f "/usr/local/bin/$script" ] && [ -x "/usr/local/bin/$script" ]; then
            test_pass "Management script '$script' is installed and executable"
        else
            test_fail "Management script '$script' is missing or not executable"
        fi
    done
}

# Test fix scripts
test_fix_scripts() {
    echo -e "\n${BLUE}=== Fix Scripts ===${NC}"
    
    local fix_scripts=("fix_nodejs_conflict.sh" "fix_apt_issue.sh" "fix_permissions.sh" "fix_supabase_env.sh" "verify_deployment.sh")
    
    for script in "${fix_scripts[@]}"; do
        if [ -f "$script" ] && [ -x "$script" ]; then
            test_pass "Fix script '$script' is available and executable"
        else
            test_warn "Fix script '$script' is missing or not executable"
        fi
    done
}

# Main verification function
main() {
    echo -e "${BLUE}🔍 AgentMojo Deployment Verification${NC}"
    echo -e "${BLUE}Domain: $DOMAIN${NC}\n"
    
    local IS_ROOT
    check_privileges && IS_ROOT=true || IS_ROOT=false
    
    test_system_dependencies
    test_application_setup
    
    if [ "$IS_ROOT" = true ]; then
        test_services
        test_nginx
        test_firewall
        test_ssl
        check_permissions
        check_supabase_env
    else
        test_warn "Skipping privileged checks (run as root for complete verification)"
    fi
    
    test_docker_containers
    test_network
    test_management_scripts
    test_fix_scripts
    
    # Summary
    echo -e "\n${BLUE}=== Verification Summary ===${NC}"
    echo -e "${GREEN}Passed: $PASSED${NC}"
    echo -e "${RED}Failed: $FAILED${NC}"
    echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
    
    if [ $FAILED -eq 0 ]; then
        if [ $WARNINGS -eq 0 ]; then
            echo -e "\n${GREEN}🎉 All checks passed! Your deployment looks great!${NC}"
        else
            echo -e "\n${YELLOW}⚠️  Deployment is functional but has some warnings to address.${NC}"
        fi
        echo -e "\n${GREEN}Your application should be available at: https://$DOMAIN${NC}"
    else
        echo -e "\n${RED}❌ Some checks failed. Please review the issues above.${NC}"
        echo -e "\nCommon fixes:"
        echo -e "1. Restart services: sudo systemctl restart agentmojo nginx"
        echo -e "2. Check logs: agentmojo-logs"
        echo -e "3. Verify environment: sudo nano $APP_DIR/.env"
        echo -e "4. Rebuild containers: cd $APP_DIR && sudo -u $APP_USER docker compose -f docker-compose.yml -f docker-compose.prod.yml build"
    fi
    
    # Exit with appropriate code
    if [ $FAILED -gt 0 ]; then
        exit 1
    else
        exit 0
    fi
}

# Run main function
main "$@"
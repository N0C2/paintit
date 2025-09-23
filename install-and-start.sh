#!/bin/bash

# Color definitions
BLUE="\033[1;34m"
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
RED="\033[1;31m"
NC="\033[0m" # No Color

# Function to print styled messages
print_info() {
    echo -e "${BLUE}INFO: $1${NC}"
}

print_success() {
    echo -e "${GREEN}SUCCESS: $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

print_error() {
    echo -e "${RED}ERROR: $1${NC}"
}

# --- ASCII Art Header ---
echo -e "${BLUE}"
cat << "EOF"
 ____       _   _   _ _____ _____
|  _ \ __ _| |_| |_(_)_   _|_   _|
| |_) / _` | __| __| | | |   | |
|  __/ (_| | |_| |_| | | |   | |
|_|   \__,_|\__|\__|_| |_|   |_|

EOF
echo -e " Automated Setup Script${NC}"
echo "--------------------------------"

# --- 1. System Update and Prerequisite Installation ---
print_info "Updating system packages..."
if sudo apt update && sudo apt upgrade -y; then
    print_success "System packages updated."
else
    print_error "Failed to update system packages."
    exit 1
fi

print_info "Installing git, curl, and build-essential..."
if sudo apt install -y git curl build-essential; then
    print_success "Prerequisites installed."
else
    print_error "Failed to install prerequisites."
    exit 1
fi

# --- 2. Node.js Installation (v18) ---
print_info "Installing Node.js v18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
if sudo apt install -y nodejs; then
    print_success "Node.js v18 installed."
else
    print_error "Failed to install Node.js."
    exit 1
fi

# Verify Node.js and npm installation
print_info "Node.js and npm versions:"
node -v
npm -v

# --- 3. MariaDB Installation ---
print_warning "Skipping MariaDB installation. Please ensure a database server is installed and configured manually."

# --- 4. Clone Project Repository ---
print_info "Cloning the Paint.IT project from GitHub..."
if git clone https://github.com/N0C2/paintit.git paintit; then
    cd paintit
    print_success "Project cloned successfully."
else
    print_error "Failed to clone project. Does the 'paintit' directory already exist?"
    exit 1
fi

# --- 6. Backend Setup ---
print_info "Setting up the backend..."
cd server
if npm install; then
    print_success "Backend dependencies installed."
else
    print_error "Failed to install backend dependencies."
    exit 1
fi

print_warning "Database-related setup steps (creating .env, running 'npm run setup') have been removed."
print_warning "You must manually create the 'server/.env' file and run 'npm run setup' in the 'server' directory."

# --- 7. Frontend Setup ---
print_info "Setting up the frontend..."
cd ../client
if npm install; then
    print_success "Frontend dependencies installed."
else
    print_error "Failed to install frontend dependencies."
    exit 1
fi

print_info "Building the frontend application..."
if npm run build; then
    print_success "Frontend application built."
else
    print_error "Failed to build the frontend application."
    exit 1
fi

# --- 8. Starting the Application ---
echo "--------------------------------"
print_success "Setup complete!"
print_info "The project is located in the 'paintit' directory."
print_info "To start the application for production, run the following commands:"
echo -e "${YELLOW}cd paintit/server && npm start${NC}"
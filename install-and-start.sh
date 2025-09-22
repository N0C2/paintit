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
sudo apt update && sudo apt upgrade -y
print_success "System packages updated."

print_info "Installing git, curl, and build-essential..."
sudo apt install -y git curl build-essential
print_success "Prerequisites installed."

# --- 2. Node.js Installation (v18) ---
print_info "Installing Node.js v18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
print_success "Node.js v18 installed."

# Verify Node.js and npm installation
print_info "Node.js and npm versions:"
node -v
npm -v

# --- 3. MariaDB Installation ---
print_info "Installing MariaDB..."
sudo apt install -y mariadb-server mariadb-client
print_success "MariaDB installed."

print_info "Starting and enabling MariaDB..."
sudo systemctl enable --now mariadb
sudo systemctl start mariadb
print_success "MariaDB started."

print_warning "The next step is to secure your MariaDB installation."
print_warning "Please follow the on-screen prompts. It is recommended to set a root password."
read -p "Press [Enter] to run 'sudo mysql_secure_installation'..."
sudo mysql_secure_installation

# --- 4. Clone Project Repository ---
print_info "Cloning the Paint.IT project from GitHub..."
git clone https://github.com/N0C2/paintit.git paintit
cd paintit
print_success "Project cloned successfully."

# --- 5. Database and User Creation ---
print_info "Now, let's create the database user."
read -s -p "Enter a new password for the 'paintituser' database user: " DB_PASSWORD
echo
print_info "Creating database and user..."
sudo mysql -u root -p <<MYSQL_SCRIPT
CREATE DATABASE paintit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'paintituser'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON paintit.* TO 'paintituser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
MYSQL_SCRIPT
print_success "Database 'paintit' and user 'paintituser' created."

# --- 6. Backend Setup ---
print_info "Setting up the backend..."
cd server
npm install
print_success "Backend dependencies installed."

# Create .env file
print_info "Generating a secure JWT Secret and creating .env file..."
JWT_SECRET=$(openssl rand -hex 32)
cat > .env << EOF
DB_HOST=localhost
DB_USER=paintituser
DB_PASSWORD=$DB_PASSWORD
DB_NAME=paintit
JWT_SECRET=$JWT_SECRET
EOF
print_success ".env file created."

print_info "Running database setup..."
npm run setup
print_success "Database tables created."

# --- 7. Frontend Setup ---
print_info "Setting up the frontend..."
cd ../client
npm install
print_success "Frontend dependencies installed."

print_info "Building the frontend application..."
npm run build
print_success "Frontend application built."

# --- 8. Starting the Application ---
echo "--------------------------------"
print_success "Setup complete!"
print_info "The project is located in the 'paintit' directory."
print_info "To start the application for production, run the following commands:"
echo -e "${YELLOW}cd paintit/server && npm start${NC}"

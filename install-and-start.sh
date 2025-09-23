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
read -p "Do you want to install and configure MariaDB? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    print_info "Installing MariaDB..."
    if sudo apt install -y mariadb-server mariadb-client; then
        print_success "MariaDB installed."
    else
        print_error "Failed to install MariaDB."
        exit 1
    fi

    print_info "Starting and enabling MariaDB..."
    sudo systemctl enable --now mariadb
    sudo systemctl start mariadb
    print_success "MariaDB started."

    print_warning "The next step is to secure your MariaDB installation."
    print_warning "Please follow the on-screen prompts. It is recommended to set a root password."
    read -p "Press [Enter] to run 'sudo mysql_secure_installation'..."
    sudo mysql_secure_installation
else
    print_warning "Skipping MariaDB installation and setup."
fi

# --- 4. Clone Project Repository ---
print_info "Cloning the Paint.IT project from GitHub..."
if git clone https://github.com/N0C2/paintit.git paintit; then
    cd paintit
    print_success "Project cloned successfully."
else
    print_error "Failed to clone project. Does the 'paintit' directory already exist?"
    exit 1
fi

# --- 5. Database and User Creation ---
print_info "Now, let's configure the database credentials."
read -s -p "Enter the password for the 'paintituser' database user: " DB_PASSWORD
echo
print_info "Attempting to create database and user (if they don't exist)..."
sudo mysql -u root -p <<MYSQL_SCRIPT
CREATE DATABASE IF NOT EXISTS paintit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'paintituser'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON paintit.* TO 'paintituser'@'localhost';
FLUSH PRIVILEGES;
MYSQL_SCRIPT

print_warning "If you saw an error above (e.g., user already exists or access denied), it might be safe to ignore if your database is already configured."
print_success "Database and user configuration step finished."


# --- 6. Backend Setup ---
print_info "Setting up the backend..."
cd server
if npm install; then
    print_success "Backend dependencies installed."
else
    print_error "Failed to install backend dependencies."
    exit 1
fi

# Create .env file
print_info "Generating a secure JWT Secret and creating .env file..."
JWT_SECRET=$(openssl rand -hex 32)
cat > .env << EOF
DB_HOST=localhost
DB_USER=paintituser
DB_PASSWORD="$DB_PASSWORD"
DB_NAME=paintit
JWT_SECRET=$JWT_SECRET
EOF
print_success ".env file created."

print_info "Running database setup..."
if npm run setup; then
    print_success "Database tables created."
else
    print_error "Failed to create database tables. This might be due to an incorrect password. Please try running the script again."
    exit 1
fi

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
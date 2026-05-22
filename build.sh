#!/bin/bash
set -e

echo "========================================"
echo "  E-Commerce Platform Builder for Ubuntu"
echo "========================================"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Installing Node.js 18 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Node.js version $NODE_VERSION detected. Upgrading to 18 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "✓ Node.js $(node -v) ready."

# Run builder
echo ""
echo "Building project... (this may take several minutes)"
node build.js

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "  BUILD COMPLETE!"
    echo "========================================"
    echo ""
    echo "To start the application:"
    echo "  1. Open two terminals"
    echo "  2. In first: cd ecommerce-platform/backend && npm run dev"
    echo "  3. In second: cd ecommerce-platform/frontend && npm run dev"
    echo ""
else
    echo "Build failed. Check errors above."
    exit 1
fi

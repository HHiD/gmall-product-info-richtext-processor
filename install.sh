#!/bin/bash

# Product Info Processor MCP Server Installation Script
# This script helps users install and configure the Product Info Processor MCP server

set -e

echo "🚀 Installing Product Info Processor MCP Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (version 16 or higher) first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Check if build was successful
if [ ! -f "build/index.js" ]; then
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi

echo "✅ Build successful"

# Get the absolute path
INSTALL_PATH=$(pwd)/build/index.js
echo "📍 Installation path: $INSTALL_PATH"

# MCP settings file path
MCP_SETTINGS_PATH="$HOME/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json"

echo ""
echo "🎉 Installation completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Add the following configuration to your Cline MCP settings file:"
echo "   File: $MCP_SETTINGS_PATH"
echo ""
echo "   Add this to the 'mcpServers' section:"
echo '   "product-info-processor": {'
echo '     "command": "node",'
echo "     \"args\": [\"$INSTALL_PATH\"],"
echo '     "disabled": false,'
echo '     "autoApprove": []'
echo '   }'
echo ""
echo "2. Restart Cline to load the new MCP server"
echo ""
echo "3. You can now use commands like:"
echo "   - 'Please format this product information: [your text]'"
echo "   - 'Please generate HTML from this product data: [markdown]'"
echo "   - 'Please process this product workflow: [raw text]'"
echo ""
echo "📚 For more information, see README.md"
echo ""
echo "✨ Happy product processing!"

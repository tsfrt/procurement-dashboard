#!/bin/bash
set -e

echo "=========================================="
echo "Procurement Analytics Setup"
echo "=========================================="
echo ""

# Check if Databricks CLI is installed
if ! command -v databricks &> /dev/null; then
    echo "⚠️  Databricks CLI not found. Installing..."
    curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh
    echo "✅ Databricks CLI installed successfully"
else
    echo "✅ Databricks CLI already installed ($(databricks --version))"
fi

echo ""
echo "=========================================="
echo "Configuration"
echo "=========================================="
echo ""

# Check for .databrickscfg
if [ ! -f "$HOME/.databrickscfg" ]; then
    echo "⚠️  Databricks configuration not found"
    echo ""
    echo "Please configure your Databricks workspace:"
    read -p "Enter your Databricks workspace URL: " workspace_url
    read -p "Enter your Databricks token: " -s token
    echo ""
    
    mkdir -p "$HOME"
    cat > "$HOME/.databrickscfg" << EOF
[DEFAULT]
host = $workspace_url
token = $token
EOF
    
    echo "✅ Databricks configuration saved to ~/.databrickscfg"
else
    echo "✅ Databricks configuration found at ~/.databrickscfg"
fi

echo ""
echo "=========================================="
echo "Validating Bundle"
echo "=========================================="
echo ""

# Validate the bundle
if databricks bundle validate -t dev; then
    echo "✅ Bundle validation successful"
else
    echo "❌ Bundle validation failed"
    exit 1
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Deploy to development:"
echo "   databricks bundle deploy -t dev"
echo ""
echo "2. Run the analysis job:"
echo "   databricks bundle run procurement_analysis_adhoc -t dev"
echo ""
echo "3. Start the frontend:"
echo "   npm install && npm run dev"
echo ""
echo "For GitHub Actions setup, configure these secrets:"
echo "  - DATABRICKS_HOST"
echo "  - DATABRICKS_TOKEN"
echo "  - DATABRICKS_SERVICE_PRINCIPAL_NAME"
echo "  - NOTIFICATION_EMAIL"
echo ""
echo "See README_DATABRICKS.md for detailed instructions."
echo ""


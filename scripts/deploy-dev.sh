#!/bin/bash
set -e

echo "=========================================="
echo "Deploying to Development Environment"
echo "=========================================="
echo ""

# Validate bundle
echo "Validating bundle..."
databricks bundle validate -t dev

# Deploy bundle
echo ""
echo "Deploying bundle..."
databricks bundle deploy -t dev

echo ""
echo "✅ Deployment successful!"
echo ""
echo "View your deployment:"
echo "  databricks workspace list /Workspace/Users/"
echo ""
echo "Run the analysis job:"
echo "  databricks bundle run procurement_analysis_adhoc -t dev"
echo ""


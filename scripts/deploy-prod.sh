#!/bin/bash
set -e

echo "=========================================="
echo "⚠️  PRODUCTION DEPLOYMENT"
echo "=========================================="
echo ""
echo "This will deploy to PRODUCTION environment."
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "Validating bundle..."
databricks bundle validate -t prod

echo ""
echo "Deploying to production..."
databricks bundle deploy -t prod

echo ""
echo "✅ Production deployment successful!"
echo ""
echo "Monitor your jobs at:"
echo "  https://your-workspace.cloud.databricks.com/#job/list"
echo ""


# Quick Start Guide

Get up and running with the Procurement Analytics Platform in minutes.

## Prerequisites

- Node.js 18+ installed
- Databricks workspace (with access token)
- Git

## Setup Steps

### 1. Clone and Install

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd procurment

# Install frontend dependencies
npm install
```

### 2. Configure Databricks

#### Option A: Automated Setup (Recommended)

```bash
# Run the setup script
npm run databricks:setup
```

The script will:
- Install Databricks CLI (if needed)
- Configure your workspace connection
- Validate the bundle configuration

#### Option B: Manual Setup

```bash
# 1. Install Databricks CLI
curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh

# 2. Configure authentication
databricks auth login --host https://your-workspace.cloud.databricks.com

# 3. Validate bundle
npm run databricks:validate
```

### 3. Deploy to Databricks

```bash
# Deploy to development environment
npm run databricks:deploy:dev

# Run the analysis job
npm run databricks:run
```

### 4. Start the Frontend

```bash
# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Verify Deployment

### Check Databricks Deployment

```bash
# List deployed resources
databricks workspace list /Workspace/Users/

# Check job status
databricks jobs list | grep "Procurement"
```

### Access in Databricks UI

1. Navigate to your Databricks workspace
2. Go to **Workflows** → **Jobs**
3. Look for:
   - "Procurement Analysis Pipeline" (scheduled job)
   - "Procurement Analysis - Ad Hoc" (on-demand job)

### View Data Tables

In the Databricks SQL Editor:

```sql
-- View contracts
SELECT * FROM main.procurement_analytics.contracts;

-- View analysis results
SELECT * FROM main.procurement_analytics.consolidated_analysis_report;

-- Summary metrics
SELECT * FROM main.procurement_analytics.analysis_summary_history;
```

## Quick Commands Reference

### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
```

### Databricks

```bash
npm run databricks:validate      # Validate bundle
npm run databricks:deploy:dev    # Deploy to dev
npm run databricks:deploy:prod   # Deploy to prod
npm run databricks:run          # Run ad-hoc job
npm run databricks:setup        # Run setup wizard
```

### Manual Databricks Commands

```bash
# Deploy using scripts
./scripts/deploy-dev.sh
./scripts/deploy-prod.sh

# Using Databricks CLI directly
databricks bundle deploy -t dev
databricks bundle run procurement_analysis_adhoc -t dev
databricks jobs list
databricks workspace list /Workspace/Users/
```

## GitHub Actions Setup (Optional)

For automated CI/CD deployment:

1. Go to your GitHub repository **Settings** → **Secrets and variables** → **Actions**

2. Add the following secrets:
   - `DATABRICKS_HOST`: Your workspace URL
   - `DATABRICKS_TOKEN`: Your access token
   - `DATABRICKS_SERVICE_PRINCIPAL_NAME`: Service principal email (for prod)
   - `NOTIFICATION_EMAIL`: Email for job notifications

3. Push to trigger deployment:
   - Push to `develop` → deploys to dev
   - Push to `main` → deploys to prod

## Troubleshooting

### "Command not found: databricks"

```bash
# Reinstall Databricks CLI
curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh

# Add to PATH (if needed)
export PATH="$PATH:$HOME/.databricks/bin"
```

### "Authentication failed"

```bash
# Reconfigure authentication
databricks auth login --host https://your-workspace.cloud.databricks.com

# Verify configuration
databricks auth describe
```

### "Bundle validation failed"

```bash
# Check for syntax errors in databricks.yml
databricks bundle validate -t dev

# Ensure all files exist
ls -la src/notebooks/
ls -la resources/
```

### Job fails in Databricks

1. Go to Databricks UI → **Workflows** → **Jobs**
2. Click on the failed job
3. View the **Run** details and logs
4. Common issues:
   - Cluster startup failure → check cluster configuration
   - Permission denied → verify Unity Catalog permissions
   - Notebook error → check notebook syntax

### Port 3000 already in use

```bash
# Use a different port
PORT=3001 npm run dev

# Or kill the process using port 3000
lsof -ti:3000 | xargs kill
```

## Next Steps

- Review [README.md](./README.md) for full documentation
- See [README_DATABRICKS.md](./README_DATABRICKS.md) for detailed Databricks setup
- Explore the notebooks in `src/notebooks/`
- Customize job schedules in `resources/jobs.yml`
- Configure Unity Catalog settings in `databricks.yml`

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Databricks workspace logs
3. Check GitHub Actions logs (if using CI/CD)
4. Refer to [Databricks documentation](https://docs.databricks.com/)

## Sample Data

The notebooks include sample contract data for testing. In production, you'll want to:

1. Connect to your actual data sources
2. Modify the data loading logic in `src/notebooks/contract_analysis.py`
3. Update the Delta table paths as needed
4. Configure proper data governance with Unity Catalog

Happy analyzing! 🚀


# Databricks Deployment Guide

This guide explains how to deploy the Procurement Analytics application to Databricks using Asset Bundles and GitHub Actions.

## Architecture Overview

The application consists of:
- **Next.js Frontend**: Procurement contract management UI
- **Databricks Notebooks**: Python-based analytics pipelines for:
  - Contract analysis
  - Duplicate spending detection
  - Compliance checking
  - Pricing benchmarking
  - Report generation

## Prerequisites

1. **Databricks Workspace**
   - Access to a Databricks workspace (AWS, Azure, or GCP)
   - Unity Catalog enabled (recommended)
   - SQL Warehouse configured

2. **Databricks CLI**
   ```bash
   # Install Databricks CLI
   curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh
   
   # Verify installation
   databricks --version
   ```

3. **Authentication**
   - Personal Access Token (PAT) for development
   - Service Principal for production deployments

## Local Setup

### 1. Configure Databricks CLI

Create `~/.databrickscfg`:

```ini
[DEFAULT]
host = https://your-workspace.cloud.databricks.com
token = dapi_your_token_here

[dev]
host = https://your-dev-workspace.cloud.databricks.com
token = dapi_dev_token

[prod]
host = https://your-prod-workspace.cloud.databricks.com
token = dapi_prod_token
```

### 2. Validate Bundle

```bash
# Validate the bundle configuration
databricks bundle validate -t dev

# Preview what will be deployed
databricks bundle deploy -t dev --dry-run
```

### 3. Deploy to Development

```bash
# Deploy to dev environment
databricks bundle deploy -t dev

# Run ad-hoc analysis job
databricks bundle run procurement_analysis_adhoc -t dev

# Run full pipeline
databricks bundle run procurement_analysis_pipeline -t dev
```

## GitHub Actions Setup

### Required Secrets

Configure these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

| Secret Name | Description | Example |
|------------|-------------|---------|
| `DATABRICKS_HOST` | Databricks workspace URL | `https://your-workspace.cloud.databricks.com` |
| `DATABRICKS_TOKEN` | Personal Access Token | `dapi1234567890abcdef` |
| `DATABRICKS_SERVICE_PRINCIPAL_NAME` | Service principal for prod | `sp-procurement-prod@your-org.com` |
| `NOTIFICATION_EMAIL` | Email for job notifications | `team@your-org.com` |

### Creating Databricks Tokens

1. **Development Token (Personal Access Token)**
   - Navigate to: User Settings → Developer → Access Tokens
   - Click "Generate New Token"
   - Set lifetime (e.g., 90 days)
   - Copy token immediately (shown only once)

2. **Production Token (Service Principal)**
   ```bash
   # Using Databricks CLI
   databricks service-principals create \
     --display-name "Procurement Analytics Pipeline"
   
   # Grant necessary permissions
   databricks workspace-conf set-permissions \
     /path/to/workspace \
     --service-principal <sp-id> \
     --permission-level CAN_MANAGE
   ```

### Deployment Workflows

1. **Automatic Deployment**
   - Push to `develop` branch → deploys to dev
   - Push to `main` branch → deploys to prod

2. **Manual Deployment**
   - Go to Actions tab
   - Select "Deploy to Databricks"
   - Click "Run workflow"
   - Choose environment (dev/prod)

3. **PR Validation**
   - Pull requests automatically validate bundle configuration
   - Ensures changes don't break deployment

## Bundle Structure

```
procurment/
├── databricks.yml              # Main bundle configuration
├── resources/
│   └── jobs.yml               # Job definitions
├── src/
│   └── notebooks/
│       ├── contract_analysis.py
│       ├── duplicate_detection.py
│       ├── compliance_analysis.py
│       ├── pricing_analysis.py
│       └── report_generation.py
└── .github/
    └── workflows/
        ├── deploy.yml         # Main deployment workflow
        └── pr-validation.yml  # PR validation
```

## Jobs Overview

### 1. Procurement Analysis Pipeline (Scheduled)
- **Schedule**: Daily at 2 AM UTC
- **Tasks**:
  1. Analyze contracts
  2. Detect duplicates (parallel)
  3. Check compliance (parallel)
  4. Benchmark pricing (parallel)
  5. Generate reports

### 2. Procurement Analysis - Ad Hoc (Manual)
- **Trigger**: On-demand
- **Purpose**: Quick analysis runs during development

## Data Storage

Data is stored in Delta tables within Unity Catalog:

```
{catalog}.{schema}.contracts                    # Contract data
{catalog}.{schema}.contract_health             # Health metrics
{catalog}.{schema}.duplicate_analysis          # Duplicate findings
{catalog}.{schema}.compliance_analysis         # Compliance issues
{catalog}.{schema}.pricing_analysis            # Pricing benchmarks
{catalog}.{schema}.consolidated_analysis_report # Combined report
{catalog}.{schema}.analysis_summary_history    # Historical metrics
```

Default values:
- Catalog: `main`
- Schema: `procurement_analytics`

## Monitoring and Debugging

### View Job Runs

```bash
# List recent job runs
databricks jobs list --output json | jq '.jobs[] | select(.name | contains("Procurement"))'

# Get job run details
databricks jobs get-run --run-id <run-id>

# View job logs
databricks jobs get-run-output --run-id <run-id>
```

### Access Notebooks

Notebooks are deployed to:
```
/Workspace/Users/<your-email>/.bundle/procurement-analytics/<target>/src/notebooks/
```

### Query Results

```sql
-- Connect to SQL Warehouse and run:
SELECT * FROM main.procurement_analytics.consolidated_analysis_report
WHERE severity = 'high'
ORDER BY detected_at DESC;

-- Summary metrics
SELECT 
  report_date,
  total_contracts,
  high_severity_count,
  critical_status_count
FROM main.procurement_analytics.analysis_summary_history
ORDER BY report_date DESC;
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   ```bash
   # Verify token
   databricks auth describe
   
   # Re-authenticate
   databricks auth login --host https://your-workspace.cloud.databricks.com
   ```

2. **Bundle Validation Errors**
   ```bash
   # Check for syntax errors
   databricks bundle validate -t dev
   
   # Verify file paths
   ls -la src/notebooks/
   ```

3. **Job Failures**
   - Check cluster logs in Databricks UI
   - Verify Unity Catalog permissions
   - Ensure warehouse is running

4. **GitHub Actions Failures**
   - Verify all secrets are set correctly
   - Check if token has expired
   - Review workflow logs in Actions tab

## Best Practices

1. **Development Workflow**
   - Test changes locally first: `databricks bundle deploy -t dev`
   - Use feature branches
   - Validate with PR checks before merging

2. **Production Deployments**
   - Always deploy from `main` branch
   - Use service principals for authentication
   - Monitor job runs after deployment
   - Keep notification emails updated

3. **Security**
   - Rotate tokens regularly (90-day maximum)
   - Use service principals for automation
   - Never commit tokens to git
   - Enable IP access lists on workspace

4. **Cost Management**
   - Use appropriate cluster sizes
   - Enable autoscaling
   - Set job timeouts
   - Schedule jobs during off-peak hours

## Advanced Configuration

### Custom Variables

Modify `databricks.yml` to add custom variables:

```yaml
variables:
  custom_warehouse_id:
    description: "Custom warehouse ID"
    default: "abc123xyz"
  
  notification_slack:
    description: "Slack webhook for notifications"
```

### Multiple Environments

Add new targets in `databricks.yml`:

```yaml
targets:
  staging:
    mode: development
    workspace:
      host: https://staging-workspace.databricks.com
      root_path: /Workspace/Users/${workspace.current_user.userName}/.bundle/${bundle.name}/staging
```

### Custom Job Schedules

Edit `resources/jobs.yml`:

```yaml
schedule:
  quartz_cron_expression: "0 0 8 * * MON-FRI"  # 8 AM on weekdays
  timezone_id: "America/New_York"
```

## Support

For issues or questions:
- Databricks Documentation: https://docs.databricks.com/
- Asset Bundles Guide: https://docs.databricks.com/dev-tools/bundles/
- GitHub Actions: https://docs.github.com/actions

## Next Steps

1. Set up GitHub secrets
2. Deploy to development environment
3. Verify job execution
4. Configure production deployment
5. Set up monitoring and alerts
6. Document custom workflows


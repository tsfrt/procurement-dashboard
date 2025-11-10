# Deployment Checklist

Use this checklist to ensure a successful deployment of the Procurement Analytics Platform to Databricks.

## Pre-Deployment Checklist

### 1. Databricks Workspace Setup

- [ ] Databricks workspace is accessible (AWS, Azure, or GCP)
- [ ] Unity Catalog is enabled (recommended)
- [ ] SQL Warehouse is created and running
- [ ] Personal Access Token (PAT) is generated
- [ ] Service Principal is created (for production)
- [ ] Required permissions are granted:
  - [ ] Workspace access
  - [ ] Cluster creation
  - [ ] Job creation
  - [ ] Unity Catalog access (if enabled)

### 2. Local Development Environment

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Databricks CLI installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.databrickscfg` configured in home directory

### 3. GitHub Repository Setup (if using CI/CD)

- [ ] Repository is pushed to GitHub
- [ ] GitHub Actions are enabled
- [ ] Required secrets are configured:
  - [ ] `DATABRICKS_HOST`
  - [ ] `DATABRICKS_TOKEN`
  - [ ] `DATABRICKS_SERVICE_PRINCIPAL_NAME` (for prod)
  - [ ] `NOTIFICATION_EMAIL`
- [ ] Branch protection rules are set (optional but recommended)

## Deployment Checklist

### Development Environment

- [ ] Validate bundle configuration
  ```bash
  npm run databricks:validate
  ```

- [ ] Deploy to development
  ```bash
  npm run databricks:deploy:dev
  ```

- [ ] Verify deployment in Databricks UI
  - [ ] Notebooks are visible in workspace
  - [ ] Jobs are created
  - [ ] No errors in deployment logs

- [ ] Run test job
  ```bash
  npm run databricks:run
  ```

- [ ] Verify job execution
  - [ ] Job completes successfully
  - [ ] Delta tables are created
  - [ ] Data is populated correctly

- [ ] Query results in SQL Editor
  ```sql
  SELECT * FROM main.procurement_analytics.contracts LIMIT 10;
  ```

### Production Environment

- [ ] Review all changes in development
- [ ] Test complete pipeline in dev
- [ ] Update production configuration if needed
- [ ] Backup existing production data (if applicable)
- [ ] Deploy to production
  ```bash
  npm run databricks:deploy:prod
  ```

- [ ] Verify production deployment
  - [ ] Jobs are scheduled correctly
  - [ ] Notifications are configured
  - [ ] Service principal has proper permissions

- [ ] Test production job manually (optional)
  ```bash
  databricks bundle run procurement_analysis_adhoc -t prod
  ```

- [ ] Monitor first scheduled run
- [ ] Verify email notifications are sent

## Post-Deployment Checklist

### Monitoring and Validation

- [ ] Job schedules are active
- [ ] First scheduled run completes successfully
- [ ] Email notifications are received
- [ ] Delta tables are being updated
- [ ] Frontend can connect to data (if integrated)
- [ ] Performance metrics are acceptable:
  - [ ] Job runtime is reasonable
  - [ ] Cluster autoscaling works
  - [ ] Resource utilization is optimal

### Documentation and Handoff

- [ ] Document any custom configurations
- [ ] Share access credentials securely
- [ ] Train team members on:
  - [ ] Running ad-hoc jobs
  - [ ] Viewing results
  - [ ] Troubleshooting common issues
- [ ] Set up monitoring alerts (optional)
- [ ] Create runbook for common operations

### Cleanup

- [ ] Remove test data (if any)
- [ ] Delete unused resources
- [ ] Archive old deployment logs
- [ ] Update documentation with lessons learned

## Rollback Plan

If something goes wrong:

### Development Rollback

```bash
# Revert to previous version
git checkout <previous-commit>

# Redeploy
npm run databricks:deploy:dev
```

### Production Rollback

1. Pause current job
   ```bash
   databricks jobs update --job-id <job-id> --pause-status PAUSED
   ```

2. Checkout previous stable version
   ```bash
   git checkout <stable-tag>
   ```

3. Deploy previous version
   ```bash
   npm run databricks:deploy:prod
   ```

4. Verify and unpause job
   ```bash
   databricks jobs update --job-id <job-id> --pause-status UNPAUSED
   ```

## Common Issues and Solutions

### Issue: Bundle validation fails

**Solution:**
```bash
# Check for syntax errors
databricks bundle validate -t dev

# Verify file structure
ls -la src/notebooks/
ls -la resources/
```

### Issue: Job fails with permission error

**Solution:**
1. Check Unity Catalog permissions
2. Verify service principal has access
3. Grant necessary permissions:
   ```sql
   GRANT USAGE ON CATALOG main TO `service-principal-email`;
   GRANT CREATE ON SCHEMA main.procurement_analytics TO `service-principal-email`;
   ```

### Issue: Notebooks not found

**Solution:**
- Ensure notebooks are in `src/notebooks/` directory
- Check bundle deployment logs
- Verify workspace path in `databricks.yml`

### Issue: Cluster fails to start

**Solution:**
- Check cluster configuration in `resources/jobs.yml`
- Verify node type is available in your region
- Check workspace quotas and limits

## Maintenance Schedule

### Daily
- [ ] Monitor job runs for failures
- [ ] Review error logs if any

### Weekly
- [ ] Review job performance metrics
- [ ] Check data quality
- [ ] Verify storage usage

### Monthly
- [ ] Review and update dependencies
- [ ] Rotate access tokens (if using PATs)
- [ ] Audit permissions and access
- [ ] Review and optimize job schedules

### Quarterly
- [ ] Review and update documentation
- [ ] Conduct security audit
- [ ] Optimize cluster configurations
- [ ] Review cost optimization opportunities

## Emergency Contacts

Document your team's contact information:

- **Databricks Admin**: ___________________
- **DevOps Lead**: ___________________
- **Data Engineering Lead**: ___________________
- **Databricks Support**: support@databricks.com

## Additional Resources

- [Databricks Asset Bundles Documentation](https://docs.databricks.com/dev-tools/bundles/)
- [Unity Catalog Documentation](https://docs.databricks.com/data-governance/unity-catalog/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- Internal Wiki/Documentation: ___________________

---

**Last Updated**: _____________  
**Updated By**: _____________  
**Version**: 1.0


# Procurement Analytics Platform

A comprehensive procurement contract management and analytics platform built with Next.js and Databricks.

## Overview

This application provides:
- **Web Interface**: Modern Next.js dashboard for contract management
- **AI-Powered Analytics**: Databricks pipelines for:
  - Duplicate spending detection
  - Compliance analysis
  - Pricing benchmarking
  - Automated reporting

## Quick Start

### Frontend Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Databricks Deployment

This application includes Databricks Asset Bundles for deploying analytics pipelines to your Databricks workspace.

### Prerequisites
- Databricks workspace (AWS, Azure, or GCP)
- Databricks CLI installed
- Personal Access Token or Service Principal

### Deploy to Databricks

```bash
# Install Databricks CLI
curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh

# Configure authentication
databricks auth login --host https://your-workspace.cloud.databricks.com

# Validate bundle
databricks bundle validate -t dev

# Deploy to development
databricks bundle deploy -t dev

# Run analysis job
databricks bundle run procurement_analysis_adhoc -t dev
```

For detailed deployment instructions, see [README_DATABRICKS.md](./README_DATABRICKS.md).

### GitHub Actions CI/CD

The repository includes automated deployment workflows:
- **Push to `develop`**: Deploys to dev environment
- **Push to `main`**: Deploys to production
- **Pull Requests**: Validates bundle configuration

Required GitHub Secrets:
- `DATABRICKS_HOST`: Your Databricks workspace URL
- `DATABRICKS_TOKEN`: Personal Access Token
- `DATABRICKS_SERVICE_PRINCIPAL_NAME`: Service principal for production
- `NOTIFICATION_EMAIL`: Email for job notifications

## Project Structure

```
procurment/
├── app/                    # Next.js application
├── components/             # React components
├── lib/                    # Utilities and mock data
├── src/
│   └── notebooks/         # Databricks Python notebooks
├── resources/             # Databricks job definitions
├── databricks.yml         # Databricks Asset Bundle config
└── .github/workflows/     # CI/CD pipelines
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment Options

### Option 1: Databricks (Analytics Backend)
Deploy analytics pipelines to Databricks for enterprise-grade data processing. See [README_DATABRICKS.md](./README_DATABRICKS.md) for details.

### Option 2: Vercel (Frontend)
Deploy the Next.js frontend to [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Features

- **Contract Management**: Track and manage procurement contracts
- **AI-Powered Analysis**: Automated detection of:
  - Duplicate spending patterns
  - Non-compliant transactions
  - Pricing anomalies vs. market benchmarks
- **Health Monitoring**: Real-time contract health scores
- **Automated Reports**: Daily analytics pipeline with email notifications
- **Unity Catalog Integration**: Enterprise data governance

## Development

### Environment Variables

Create a `.env.local` file:

```bash
# Databricks (optional for local dev)
DATABRICKS_HOST=https://your-workspace.cloud.databricks.com
DATABRICKS_TOKEN=dapi_your_token

# Application
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Testing

```bash
# Run linter
npm run lint

# Build for production
npm run build
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request (triggers automatic validation)
4. Merge to `develop` for dev deployment
5. Merge to `main` for production deployment

## License

MIT

import { AIAnalysis, HealthStatus, Contract } from '@/types';

// Simple seeded random number generator for consistent results
function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function getHealthStatus(score: number): HealthStatus {
  if (score >= 80) return 'good';
  if (score >= 60) return 'warning';
  return 'critical';
}

export function generateDuplicateSpendingAnalysis(contract: Contract, seed: number): AIAnalysis {
  const duplicateAmount = Math.floor(seededRandom(seed) * contract.spent * 0.15);
  const duplicateCount = Math.floor(seededRandom(seed + 1) * 5) + 1;
  const score = 100 - (duplicateAmount / contract.spent) * 100;
  const status = getHealthStatus(score);
  
  const descriptions = {
    good: `Analysis shows minimal duplicate spending across ${contract.name}. Our AI detected ${duplicateCount} potential duplicate transactions totaling $${duplicateAmount.toLocaleString()}, which is within acceptable thresholds. The procurement process appears well-controlled with proper validation checks in place.`,
    warning: `Moderate duplicate spending detected in ${contract.name}. AI identified ${duplicateCount} instances of potentially redundant purchases totaling $${duplicateAmount.toLocaleString()}. This represents ${((duplicateAmount / contract.spent) * 100).toFixed(1)}% of total spending and warrants review to optimize procurement processes.`,
    critical: `Significant duplicate spending identified in ${contract.name}. Our AI flagged ${duplicateCount} duplicate or near-duplicate transactions totaling $${duplicateAmount.toLocaleString()}, representing ${((duplicateAmount / contract.spent) * 100).toFixed(1)}% of contract spending. Immediate review recommended to prevent further financial waste.`
  };

  return {
    id: `dup-${contract.id}`,
    contractId: contract.id,
    type: 'duplicate-spending',
    status,
    title: 'Duplicate Spending Analysis',
    description: descriptions[status],
    severity: status === 'good' ? 'low' : status === 'warning' ? 'medium' : 'high',
    findings: [
      { label: 'Duplicate Transactions', value: duplicateCount },
      { label: 'Total Duplicate Amount', value: `$${duplicateAmount.toLocaleString()}` },
      { label: 'Percentage of Spending', value: `${((duplicateAmount / contract.spent) * 100).toFixed(1)}%` },
      { label: 'Confidence Score', value: `${score.toFixed(0)}%` }
    ],
    recommendations: status !== 'good' ? [
      'Review flagged transactions for verification',
      'Implement automated duplicate detection in procurement system',
      'Standardize purchase order naming conventions',
      'Train procurement staff on duplicate prevention'
    ] : undefined,
    detectedAt: new Date().toISOString()
  };
}

export function generateNonCompliantSpendingAnalysis(contract: Contract, seed: number): AIAnalysis {
  const nonCompliantAmount = Math.floor(seededRandom(seed + 2) * contract.spent * 0.12);
  const violations = Math.floor(seededRandom(seed + 3) * 8) + 1;
  const score = 100 - (nonCompliantAmount / contract.spent) * 100;
  const status = getHealthStatus(score);

  const descriptions = {
    good: `Compliance analysis for ${contract.name} shows strong adherence to procurement policies. AI detected only ${violations} minor compliance deviation(s) totaling $${nonCompliantAmount.toLocaleString()}. All critical compliance requirements are being met, and the contract maintains excellent regulatory alignment.`,
    warning: `Compliance concerns identified in ${contract.name}. Our AI flagged ${violations} instances of non-compliant spending totaling $${nonCompliantAmount.toLocaleString()} (${((nonCompliantAmount / contract.spent) * 100).toFixed(1)}% of spending). Issues include unapproved vendors, missing documentation, or policy deviations requiring attention.`,
    critical: `Critical compliance issues detected in ${contract.name}. AI analysis identified ${violations} significant compliance violations totaling $${nonCompliantAmount.toLocaleString()} (${((nonCompliantAmount / contract.spent) * 100).toFixed(1)}% of contract value). Immediate corrective action required to ensure regulatory compliance and avoid potential penalties.`
  };

  return {
    id: `comp-${contract.id}`,
    contractId: contract.id,
    type: 'non-compliant-spending',
    status,
    title: 'Non-Compliant Spending Analysis',
    description: descriptions[status],
    severity: status === 'good' ? 'low' : status === 'warning' ? 'medium' : 'high',
    findings: [
      { label: 'Compliance Violations', value: violations },
      { label: 'Non-Compliant Amount', value: `$${nonCompliantAmount.toLocaleString()}` },
      { label: 'Compliance Rate', value: `${score.toFixed(0)}%` },
      { label: 'Risk Level', value: status === 'good' ? 'Low' : status === 'warning' ? 'Medium' : 'High' }
    ],
    recommendations: status !== 'good' ? [
      'Audit flagged transactions immediately',
      'Update vendor approval lists',
      'Ensure all documentation is complete',
      'Reinforce compliance training for procurement team',
      'Implement pre-approval workflows'
    ] : undefined,
    detectedAt: new Date().toISOString()
  };
}

export function generatePricingBenchmarkAnalysis(contract: Contract, seed: number): AIAnalysis {
  const marketVariance = (seededRandom(seed + 4) * 30) - 15; // -15% to +15%
  const isOverpaying = marketVariance > 0;
  const amount = Math.abs(Math.floor(contract.spent * (marketVariance / 100)));
  const score = 100 - Math.abs(marketVariance * 2);
  const status = getHealthStatus(score);

  const descriptions = {
    good: `Pricing analysis for ${contract.name} indicates competitive rates. Our AI compared pricing against market benchmarks and found rates are ${Math.abs(marketVariance).toFixed(1)}% ${isOverpaying ? 'above' : 'below'} market average. This represents ${isOverpaying ? 'reasonable' : 'excellent'} value with pricing aligned to industry standards for similar contracts.`,
    warning: `Pricing concerns detected for ${contract.name}. AI benchmarking shows current rates are ${Math.abs(marketVariance).toFixed(1)}% ${isOverpaying ? 'above' : 'below'} market average, representing ${isOverpaying ? 'potential overpayment' : 'unusually low pricing'} of approximately $${amount.toLocaleString()}. ${isOverpaying ? 'Renegotiation may yield cost savings.' : 'Quality assurance review recommended.'}`,
    critical: `Significant pricing discrepancy identified for ${contract.name}. Our AI detected rates are ${Math.abs(marketVariance).toFixed(1)}% ${isOverpaying ? 'above' : 'below'} market benchmarks, indicating ${isOverpaying ? 'substantial overpayment' : 'concerning underpricing'} of approximately $${amount.toLocaleString()}. Immediate review and ${isOverpaying ? 'contract renegotiation' : 'quality verification'} strongly recommended.`
  };

  return {
    id: `price-${contract.id}`,
    contractId: contract.id,
    type: 'pricing-benchmark',
    status,
    title: 'Pricing Benchmark Analysis',
    description: descriptions[status],
    severity: status === 'good' ? 'low' : status === 'warning' ? 'medium' : 'high',
    findings: [
      { label: 'Market Variance', value: `${marketVariance > 0 ? '+' : ''}${marketVariance.toFixed(1)}%` },
      { label: 'Price Difference', value: `$${amount.toLocaleString()}` },
      { label: 'Market Position', value: isOverpaying ? 'Above Average' : 'Below Average' },
      { label: 'Benchmark Score', value: `${score.toFixed(0)}%` }
    ],
    recommendations: status !== 'good' && isOverpaying ? [
      'Engage in contract renegotiation',
      'Request competitive bids from alternative vendors',
      'Review pricing structure and terms',
      'Implement price monitoring dashboard',
      'Consider volume consolidation for better rates'
    ] : status !== 'good' ? [
      'Verify service quality meets standards',
      'Review contract terms for hidden costs',
      'Ensure deliverables match specifications',
      'Document any quality issues'
    ] : undefined,
    detectedAt: new Date().toISOString()
  };
}

export function generateAllAnalyses(contract: Contract): AIAnalysis[] {
  const seed = parseInt(contract.id.replace(/\D/g, '')) || 12345;
  
  return [
    generateDuplicateSpendingAnalysis(contract, seed),
    generateNonCompliantSpendingAnalysis(contract, seed),
    generatePricingBenchmarkAnalysis(contract, seed)
  ];
}


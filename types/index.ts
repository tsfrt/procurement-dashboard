export type ContractStatus = 'active' | 'expiring-soon' | 'expired' | 'pending';
export type HealthStatus = 'good' | 'warning' | 'critical';
export type AIAnalysisType = 'duplicate-spending' | 'non-compliant-spending' | 'pricing-benchmark';

export interface Contract {
  id: string;
  name: string;
  vendor: string;
  value: number;
  spent: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  category: string;
  department: string;
}

export interface ContractHealth {
  contractId: string;
  overallScore: number; // 0-100
  healthStatus: HealthStatus;
  spendingPercentage: number; // 0-100
  complianceStatus: HealthStatus;
  complianceScore: number; // 0-100
  riskLevel: HealthStatus;
  lastUpdated: string;
}

export interface AIAnalysis {
  id: string;
  contractId: string;
  type: AIAnalysisType;
  status: HealthStatus;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  findings: {
    label: string;
    value: string | number;
  }[];
  details?: string;
  recommendations?: string[];
  detectedAt: string;
}

export interface ContractWithHealth {
  contract: Contract;
  health: ContractHealth;
  analyses: AIAnalysis[];
}


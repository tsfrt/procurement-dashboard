import { Contract, ContractHealth, ContractWithHealth, HealthStatus } from '@/types';
import { generateAllAnalyses } from './aiSimulation';

const vendors = [
  'Acme Technologies Corp',
  'Global Solutions Inc',
  'TechServe Partners',
  'Enterprise Systems Ltd',
  'CloudFirst Solutions',
  'DataCore Technologies',
  'Innovative Software Group',
  'Digital Dynamics LLC',
  'Strategic Services Inc',
  'NextGen Enterprises'
];

const categories = [
  'Software Licenses',
  'IT Services',
  'Cloud Infrastructure',
  'Consulting Services',
  'Hardware & Equipment',
  'Professional Services',
  'Maintenance & Support',
  'Security Services'
];

const departments = [
  'Information Technology',
  'Operations',
  'Finance',
  'Human Resources',
  'Sales & Marketing',
  'Research & Development'
];

function generateContract(id: number): Contract {
  const startDate = new Date(2023, Math.floor(Math.random() * 12), 1);
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + (Math.random() > 0.5 ? 2 : 3));
  
  const now = new Date();
  const daysUntilExpiry = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  let status: Contract['status'] = 'active';
  if (daysUntilExpiry < 0) status = 'expired';
  else if (daysUntilExpiry < 90) status = 'expiring-soon';
  else if (startDate > now) status = 'pending';
  
  const value = Math.floor(Math.random() * 900000) + 100000; // $100k - $1M
  const spentPercentage = Math.random() * 0.7 + 0.2; // 20% - 90%
  const spent = Math.floor(value * spentPercentage);

  return {
    id: `CT-${String(id).padStart(4, '0')}`,
    name: `${categories[id % categories.length]} Agreement`,
    vendor: vendors[id % vendors.length],
    value,
    spent,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    status,
    category: categories[id % categories.length],
    department: departments[id % departments.length]
  };
}

function calculateContractHealth(contract: Contract): ContractHealth {
  const spendingPercentage = (contract.spent / contract.value) * 100;
  const daysRemaining = Math.floor((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const daysTotal = Math.floor((new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / (1000 * 60 * 60 * 24));
  const timePercentage = ((daysTotal - daysRemaining) / daysTotal) * 100;
  
  // Health score based on spending vs time elapsed
  let overallScore = 100;
  const spendingVsTime = spendingPercentage - timePercentage;
  
  if (spendingVsTime > 20) {
    overallScore = 50; // Spending too fast
  } else if (spendingVsTime > 10) {
    overallScore = 70;
  } else if (spendingVsTime < -20) {
    overallScore = 75; // Spending too slow (potential underutilization)
  } else {
    overallScore = 90; // Good pace
  }
  
  // Adjust for contract status
  if (contract.status === 'expired') overallScore = Math.min(overallScore, 60);
  if (contract.status === 'expiring-soon') overallScore = Math.min(overallScore, 75);
  
  const healthStatus: HealthStatus = overallScore >= 80 ? 'good' : overallScore >= 60 ? 'warning' : 'critical';
  
  // Compliance score (randomized but realistic)
  const complianceScore = Math.floor(Math.random() * 30) + 70; // 70-100
  const complianceStatus: HealthStatus = complianceScore >= 85 ? 'good' : complianceScore >= 70 ? 'warning' : 'critical';
  
  // Risk level
  const riskScore = (100 - overallScore + (100 - complianceScore)) / 2;
  const riskLevel: HealthStatus = riskScore < 20 ? 'good' : riskScore < 40 ? 'warning' : 'critical';

  return {
    contractId: contract.id,
    overallScore,
    healthStatus,
    spendingPercentage,
    complianceStatus,
    complianceScore,
    riskLevel,
    lastUpdated: new Date().toISOString()
  };
}

function generateMockContracts(): ContractWithHealth[] {
  const contracts: ContractWithHealth[] = [];
  
  for (let i = 1; i <= 12; i++) {
    const contract = generateContract(i);
    const health = calculateContractHealth(contract);
    const analyses = generateAllAnalyses(contract);
    
    contracts.push({
      contract,
      health,
      analyses
    });
  }
  
  return contracts;
}

// Generate and export mock data
export const mockContracts = generateMockContracts();

export function getContractById(id: string): ContractWithHealth | undefined {
  return mockContracts.find(c => c.contract.id === id);
}

export function getAllContracts(): ContractWithHealth[] {
  return mockContracts;
}


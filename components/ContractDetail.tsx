import { ContractWithHealth } from '@/types';
import { AIAnalysisCard } from './AIAnalysisCard';

interface ContractDetailProps {
  contractData: ContractWithHealth;
}

export function ContractDetail({ contractData }: ContractDetailProps) {
  const { contract, health, analyses } = contractData;

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="mb-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{contract.name}</h1>
            <p className="text-lg text-gray-600">{contract.vendor}</p>
          </div>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded">
            {contract.id}
          </span>
        </div>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>
            <span className="font-medium">Category:</span> {contract.category}
          </span>
          <span>•</span>
          <span>
            <span className="font-medium">Department:</span> {contract.department}
          </span>
          <span>•</span>
          <span>
            <span className="font-medium">Period:</span> {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
          </span>
        </div>
      </div>

      {/* Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Overall Health */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Overall Health</span>
            <div className={`w-3 h-3 rounded-full ${
              health.healthStatus === 'good' ? 'bg-green-500' :
              health.healthStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{health.overallScore}</div>
          <div className={`inline-block text-xs font-semibold px-2 py-1 rounded border ${getHealthStatusColor(health.healthStatus)}`}>
            {health.healthStatus.toUpperCase()}
          </div>
        </div>

        {/* Money Spent */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
          <span className="text-sm font-medium text-gray-600 block mb-2">Money Spent</span>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(contract.spent)}
          </div>
          <div className="text-sm text-gray-600 mb-2">
            of {formatCurrency(contract.value)}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                health.spendingPercentage > 90 ? 'bg-red-500' :
                health.spendingPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(health.spendingPercentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {health.spendingPercentage.toFixed(1)}% utilized
          </div>
        </div>

        {/* Compliance Status */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Compliance</span>
            <div className={`w-3 h-3 rounded-full ${
              health.complianceStatus === 'good' ? 'bg-green-500' :
              health.complianceStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{health.complianceScore}%</div>
          <div className={`inline-block text-xs font-semibold px-2 py-1 rounded border ${getHealthStatusColor(health.complianceStatus)}`}>
            {health.complianceStatus.toUpperCase()}
          </div>
        </div>

        {/* Risk Level */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Risk Level</span>
            <div className={`w-3 h-3 rounded-full ${
              health.riskLevel === 'good' ? 'bg-green-500' :
              health.riskLevel === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {health.riskLevel === 'good' ? 'Low' : health.riskLevel === 'warning' ? 'Medium' : 'High'}
          </div>
          <div className={`inline-block text-xs font-semibold px-2 py-1 rounded border ${getHealthStatusColor(health.riskLevel)}`}>
            {health.riskLevel === 'good' ? 'MINIMAL RISK' : health.riskLevel === 'warning' ? 'MODERATE RISK' : 'HIGH RISK'}
          </div>
        </div>
      </div>

      {/* AI-Driven Analysis Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl">
            🤖
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI-Driven Analysis</h2>
            <p className="text-sm text-gray-500">Powered by advanced machine learning</p>
          </div>
        </div>
        <p className="text-gray-600 mb-6 border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded">
          Advanced AI algorithms continuously monitor contract performance across multiple dimensions to identify risks and opportunities.
        </p>
        
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <AIAnalysisCard key={analysis.id} analysis={analysis} />
          ))}
        </div>
      </div>
    </div>
  );
}


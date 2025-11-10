import { ContractWithHealth } from '@/types';

interface ContractSidebarProps {
  contracts: ContractWithHealth[];
  selectedContractId: string | null;
  onSelectContract: (id: string) => void;
}

export function ContractSidebar({ contracts, selectedContractId, onSelectContract }: ContractSidebarProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expiring-soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'good':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col md:flex lg:w-80 lg:block">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
        <h1 className="text-2xl font-bold text-gray-900 bg-clip-text">Procurement Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          <span className="font-semibold text-blue-600">{contracts.length}</span> Active Contracts
        </p>
      </div>

      {/* Contract List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {contracts.map(({ contract, health }) => (
            <button
              key={contract.id}
              onClick={() => onSelectContract(contract.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                selectedContractId === contract.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Contract ID and Health Indicator */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">{contract.id}</span>
                <div className={`w-3 h-3 rounded-full ${getHealthColor(health.healthStatus)}`} />
              </div>

              {/* Contract Name */}
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{contract.name}</h3>

              {/* Vendor */}
              <p className="text-sm text-gray-600 mb-2 line-clamp-1">{contract.vendor}</p>

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(contract.status)}`}
                >
                  {contract.status.replace('-', ' ').toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">
                  ${(contract.value / 1000).toFixed(0)}k
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${
                    health.spendingPercentage > 90
                      ? 'bg-red-500'
                      : health.spendingPercentage > 75
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(health.spendingPercentage, 100)}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


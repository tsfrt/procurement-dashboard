'use client';

import { useState } from 'react';
import { getAllContracts } from '@/lib/mockData';
import { ContractSidebar } from '@/components/ContractSidebar';
import { ContractDetail } from '@/components/ContractDetail';

export default function Home() {
  const contracts = getAllContracts();
  const [selectedContractId, setSelectedContractId] = useState<string | null>(
    contracts[0]?.contract.id || null
  );

  const selectedContract = contracts.find(c => c.contract.id === selectedContractId);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ContractSidebar
        contracts={contracts}
        selectedContractId={selectedContractId}
        onSelectContract={setSelectedContractId}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {selectedContract ? (
          <ContractDetail contractData={selectedContract} />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            <p>Select a contract to view details</p>
          </div>
        )}
      </main>
    </div>
  );
}

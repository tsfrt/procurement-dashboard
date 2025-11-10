'use client';

import { useState } from 'react';
import { AIAnalysis } from '@/types';

interface AIAnalysisCardProps {
  analysis: AIAnalysis;
}

export function AIAnalysisCard({ analysis }: AIAnalysisCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'good':
        return {
          badge: 'bg-green-100 text-green-800 border-green-300',
          border: 'border-green-200',
          icon: '✓',
          iconBg: 'bg-green-500'
        };
      case 'warning':
        return {
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          border: 'border-yellow-200',
          icon: '!',
          iconBg: 'bg-yellow-500'
        };
      case 'critical':
        return {
          badge: 'bg-red-100 text-red-800 border-red-300',
          border: 'border-red-200',
          icon: '✕',
          iconBg: 'bg-red-500'
        };
      default:
        return {
          badge: 'bg-gray-100 text-gray-800 border-gray-300',
          border: 'border-gray-200',
          icon: '•',
          iconBg: 'bg-gray-500'
        };
    }
  };

  const styles = getStatusStyles(analysis.status);

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'duplicate-spending':
        return '🔄';
      case 'non-compliant-spending':
        return '⚠️';
      case 'pricing-benchmark':
        return '💰';
      default:
        return '📊';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className={`bg-white rounded-lg border-2 ${styles.border} shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}>
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${styles.iconBg} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
            {styles.icon}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getAnalysisIcon(analysis.type)}</span>
                <h3 className="text-lg font-semibold text-gray-900">{analysis.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getSeverityBadge(analysis.severity)}`}>
                  {analysis.severity.toUpperCase()}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${styles.badge}`}>
                  {analysis.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed mb-4">{analysis.description}</p>

            {/* Key Findings */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {analysis.findings.map((finding, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md">
                  <div className="text-xs text-gray-600 mb-1">{finding.label}</div>
                  <div className="text-lg font-semibold text-gray-900">{finding.value}</div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <span>{isExpanded ? '▼' : '▶'}</span>
                  <span>{isExpanded ? 'Hide' : 'View'} Recommendations ({analysis.recommendations.length})</span>
                </button>

                {isExpanded && (
                  <div className="mt-3 pl-6 border-l-2 border-blue-200">
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-500 font-bold">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Timestamp */}
            <div className="mt-4 text-xs text-gray-500">
              Last analyzed: {new Date(analysis.detectedAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


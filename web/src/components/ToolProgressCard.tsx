import React from 'react';
import type { ToolProgress } from '../hooks/useAgentStream';

interface ToolProgressCardProps {
  toolName: string;
  progress: ToolProgress;
}

const ToolProgressCard: React.FC<ToolProgressCardProps> = ({ toolName, progress }) => {
  const getStepIcon = (step: string) => {
    switch (step) {
      case 'parsing': return '🔍';
      case 'building': return '🔨';
      case 'searching': return '📊';
      case 'computing': return '⚡';
      case 'sorting': return '📋';
      case 'connecting': return '🌐';
      case 'downloading': return '⬇️';
      case 'extracting': return '📄';
      case 'fetching': return '📥';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '⚙️';
    }
  };

  const getProgressColor = (step: string) => {
    if (step === 'error') return 'bg-red-500';
    if (step === 'completed') return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getBackgroundColor = (step: string) => {
    if (step === 'error') return 'bg-red-50 border-red-200';
    if (step === 'completed') return 'bg-green-50 border-green-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div className={`border rounded-lg p-4 mb-3 transition-all ${getBackgroundColor(progress.step)}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg animate-pulse">{getStepIcon(progress.step)}</span>
          <span className="font-medium text-gray-800">
            {toolName}
          </span>
        </div>
        {progress.progress !== undefined && (
          <span className="text-sm text-gray-500">
            {progress.progress}%
          </span>
        )}
      </div>
      
      <div className="text-sm text-gray-600 mb-2">
        {progress.message}
      </div>
      
      {progress.progress !== undefined && (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress.step)}`}
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      )}
      
      {progress.data && progress.step === 'completed' && (
        <div className="mt-3 text-xs bg-white p-2 rounded border border-green-200">
          <div className="font-medium text-green-800 mb-1">执行结果:</div>
          <pre className="text-green-700 whitespace-pre-wrap overflow-x-auto">
            {JSON.stringify(progress.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ToolProgressCard;
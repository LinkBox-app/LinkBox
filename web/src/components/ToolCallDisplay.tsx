import React, { useState } from 'react';
import { useI18n } from '../contexts/I18nContext';
import type { ToolCallInfo, ToolProgress } from '../hooks/useAgentStream';

interface ToolCallDisplayProps {
  toolCall: ToolCallInfo;
  progress?: ToolProgress;
}

const ToolCallDisplay: React.FC<ToolCallDisplayProps> = ({ toolCall, progress }) => {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = () => {
    switch (toolCall.status) {
      case 'calling':
        return {
          bg: 'rgba(255, 239, 215, 1)',
          border: 'rgba(255, 111, 46, 1)',
          text: 'rgba(19, 0, 0, 1)'
        };
      case 'completed':
        return {
          bg: 'rgba(232, 255, 232, 1)',
          border: 'rgba(0, 150, 0, 1)',
          text: 'rgba(19, 0, 0, 1)'
        };
      case 'error':
        return {
          bg: 'rgba(255, 232, 232, 1)',
          border: 'rgba(239, 68, 68, 1)',
          text: 'rgba(19, 0, 0, 1)'
        };
      default:
        return {
          bg: 'rgba(255, 248, 232, 1)',
          border: 'rgba(19, 0, 0, 1)',
          text: 'rgba(19, 0, 0, 1)'
        };
    }
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'parsing': return '🔍';
      case 'building': return '🔨';
      case 'searching': return '📊';
      case 'computing': return '⚡';
      case 'sorting': return '📋';
      case 'fetching': return '📥';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '⚙️';
    }
  };

  const colors = getStatusColor();

  return (
    <div 
      className="mb-3 border-2 border-solid transform rotate-[-0.1deg]"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: colors.text,
        fontFamily: '"Menlo", "Consolas", "Courier_New", "Hannotate_SC", "DengXian", monospace'
      }}
    >
      {/* 工具调用头部 */}
      <div 
        className="p-3 flex items-center justify-between cursor-pointer hover:opacity-90"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🔧</span>
          <span className="font-bold">{toolCall.tool_name}</span>
          {toolCall.status === 'calling' && progress && (
            <span className="text-sm opacity-70">
              {progress.step && `${getStepIcon(progress.step)} ${progress.message}`}
            </span>
          )}
          {toolCall.status === 'completed' && (
            <span className="text-sm opacity-70">✅ {t('tools.completed')}</span>
          )}
          {toolCall.status === 'error' && (
            <span className="text-sm opacity-70">❌ {t('tools.failed')}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {progress?.progress !== undefined && toolCall.status === 'calling' && (
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-300 border border-solid border-black">
                <div 
                  className="h-full bg-orange-500 transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
              <span className="text-xs">{progress.progress}%</span>
            </div>
          )}
          <span className="text-sm">{expanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {/* 展开的详细信息 */}
      {expanded && (
        <div className="border-t-2 border-solid p-3" style={{ borderColor: colors.border }}>
          {/* 输入参数 */}
          <div className="mb-3">
            <div className="font-bold text-sm mb-1">{t('tools.input')}</div>
            <div 
              className="p-2 border border-solid transform rotate-[0.05deg]"
              style={{
                backgroundColor: 'rgba(255, 248, 232, 1)',
                borderColor: 'rgba(19, 0, 0, 1)',
                fontSize: '12px'
              }}
            >
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(toolCall.input, null, 2)}
              </pre>
            </div>
          </div>

          {/* 输出结果 */}
          {toolCall.output && (
            <div>
              <div className="font-bold text-sm mb-1">{t('tools.output')}</div>
              <div 
                className="p-2 border border-solid transform rotate-[-0.05deg]"
                style={{
                  backgroundColor: 'rgba(255, 248, 232, 1)',
                  borderColor: 'rgba(19, 0, 0, 1)',
                  fontSize: '12px'
                }}
              >
                <pre className="whitespace-pre-wrap">
                  {typeof toolCall.output === 'string' 
                    ? toolCall.output 
                    : JSON.stringify(toolCall.output, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* 错误信息 */}
          {toolCall.error && (
            <div>
              <div className="font-bold text-sm mb-1">{t('tools.error')}</div>
              <div 
                className="p-2 border border-solid"
                style={{
                  backgroundColor: 'rgba(254, 242, 242, 1)',
                  borderColor: 'rgba(239, 68, 68, 1)',
                  color: 'rgba(239, 68, 68, 1)',
                  fontSize: '12px'
                }}
              >
                {toolCall.error}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ToolCallDisplay;

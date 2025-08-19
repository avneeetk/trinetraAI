import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../../types/dashboard'; 

interface LogViewerProps {
  logs: LogEntry[]; 
}

export const LogViewer: React.FC<LogViewerProps> = React.memo(({ logs }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' }); 
    }
  }, [logs]); 

  const getLevelColor = (level: LogEntry['level']): string => { 
    switch (level) {
      case 'ERROR': return 'text-red-400';
      case 'WARN': return 'text-yellow-400';
      case 'INFO': return 'text-blue-400';
      case 'CRITICAL': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-900 text-gray-100 rounded-lg shadow-sm p-10 h-auto flex flex-col"> 
      <h3 className="font-semibold text-white text-lg mb-3 border-b border-gray-700 pb-2">System Event Stream</h3>
      <div className="flex-grow overflow-y-auto p-2 rounded-md bg-gray-800 text-sm leading-relaxed custom-scrollbar"> 
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No events in stream.</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={log.id || index} className="mb-1"> 
              <span className="text-gray-500 mr-2">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              <span className={`font-bold ${getLevelColor(log.level)}`}>[{log.level}]</span>
              <span className="text-gray-300 ml-2">{log.source}:</span>
              <span className="text-gray-100 ml-1">{log.message}</span>
            </div>
          ))
        )}
        <div ref={logEndRef} /> 
      </div>
    </div>
  );
});
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Alert {
  id: string;
  type: string;
  severity: string;
  status: string;
  timestamp: string;
  description: string;
  ip?: string;
  sourceIP?: string;
  logExcerpt?: string;
  user?: string;
  affectedSystems?: string[];
  suggestedPlaybook?: string[];
}

interface LogEntry {
  timestamp: string;
  level: string;
  source: string;
  message: string;
  id?: string; 
}

interface SimulatedSoarData {
  alerts: Alert[];
  eventStream: LogEntry[];
}

interface LocationState {
  simulationSteps: string[];
  simulatedSoarData: SimulatedSoarData;
}

const TerminalSimulator: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { simulationSteps, simulatedSoarData } = (location.state as LocationState) || {
    simulationSteps: [],
    simulatedSoarData: { alerts: [], eventStream: [] }
  };

  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [simulationComplete, setSimulationComplete] = useState<boolean>(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!simulationSteps || simulationSteps.length === 0) {
      setDisplayedLines([]);
      setSimulationComplete(true);
      return;
    }

    setDisplayedLines([]); 
    setSimulationComplete(false);

    let lineIndex = 0;
    const interval = setInterval(() => {
      if (lineIndex < simulationSteps.length && typeof simulationSteps[lineIndex] === 'string') {
        setDisplayedLines(prevLines => [...prevLines, simulationSteps[lineIndex]]);
        lineIndex++;
      } else if (lineIndex >= simulationSteps.length) {
        clearInterval(interval);
        setSimulationComplete(true);
        clearInterval(interval);
        setSimulationComplete(true);
      } else {
        console.warn(`Skipping invalid line entry at index ${lineIndex}:`, simulationSteps[lineIndex]);
        lineIndex++; 
        if (lineIndex >= simulationSteps.length) {
             clearInterval(interval);
             setSimulationComplete(true);
        }
      }
    }, 100); 

    return () => {
      if (interval) { 
        clearInterval(interval);
      }
    };
  }, [simulationSteps]); 

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [displayedLines]);

  const handleContinueToSoar = (): void => {
    navigate('/soar-dashboard', { state: { simulatedData: simulatedSoarData } });
  };

  const getLineColor = (line: string): string => {
    if (line.startsWith('[✓]')) return 'text-green-400';
    if (line.startsWith('[!]')) return 'text-yellow-400';
    if (line.startsWith('[*]')) return 'text-blue-400';
    if (line.startsWith('---')) return 'text-purple-400 font-bold mt-4';
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 font-mono">
      <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-gray-700 p-3 flex items-center space-x-2 rounded-t-lg">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="ml-4 text-sm text-gray-300">Trinetra CyberRange Simulation</span>
        </div>

        {/* Terminal Output Area */}
        <div
          ref={terminalRef}
          className="p-6 h-96 overflow-y-auto text-sm leading-relaxed"
          style={{ scrollBehavior: 'smooth' }}
        >
          <AnimatePresence>
            {displayedLines.map((line, index) => (
              typeof line === 'string' ? (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className={getLineColor(line)} 
                >
                  {line}
                </motion.div>
              ) : null 
            ))}
          </AnimatePresence>
        </div>

        {/* Simulation Status and Button */}
        <div className="p-6 bg-gray-700 flex justify-center items-center rounded-b-lg">
          {!simulationComplete ? (
            <div className="flex items-center space-x-3 text-blue-300">
              <div className="w-5 h-5 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
              <span>Running Simulation...</span>
            </div>
          ) : (
            <motion.button
              onClick={handleContinueToSoar}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 text-lg font-semibold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              Continue to SOAR Dashboard
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TerminalSimulator;
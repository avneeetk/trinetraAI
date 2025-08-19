import React, { useState, useEffect } from 'react';
import { X, Play, Pause, SkipForward, RotateCcw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UseCase {
  id: string;
  title: string;
  category: string;
  detectionMethod: string;
  triggerConditions: string;
  description: string;
  mitreAttack: string[];
  logSources: string[];
  playbooks: string[];
  soarActions: string;
  simulationType: string;
}

interface SimulationModalProps {
  useCase: UseCase | null;
  onClose: () => void;
}

interface SimulationStep {
  id: number;
  phase: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  logs: string[];
  timestamp?: string;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({ useCase, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationResult, setSimulationResult] = useState<'contained' | 'escalated' | 'missed' | null>(null);

  const simulationSteps: SimulationStep[] = [
    {
      id: 1,
      phase: 'Attack Initiation',
      description: 'Red Team initiates attack vector',
      status: 'pending',
      logs: ['[INFO] Simulation started', '[ATTACK] Malicious payload deployed']
    },
    {
      id: 2,
      phase: 'Detection Trigger',
      description: 'XDR/EDR sensors detect suspicious activity',
      status: 'pending',
      logs: ['[DETECTION] Behavioral anomaly detected', '[ALERT] Trigger conditions met']
    },
    {
      id: 3,
      phase: 'Alert Generation',
      description: 'Security alert generated and enriched',
      status: 'pending',
      logs: ['[ALERT] High-priority alert created', '[ENRICHMENT] Threat intelligence correlated']
    },
    {
      id: 4,
      phase: 'SOAR Response',
      description: 'Automated response actions executed',
      status: 'pending',
      logs: ['[SOAR] Playbook triggered', '[ACTION] Endpoint isolation initiated']
    },
    {
      id: 5,
      phase: 'Threat Containment',
      description: 'Threat contained and analyzed',
      status: 'pending',
      logs: ['[CONTAINMENT] Threat successfully isolated', '[ANALYSIS] Forensic data collected']
    }
  ];

  const [steps, setSteps] = useState<SimulationStep[]>(simulationSteps);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentStep < steps.length) {
      interval = setInterval(() => {
        setSteps(prevSteps => 
          prevSteps.map((step, index) => {
            if (index === currentStep) {
              return { 
                ...step, 
                status: 'completed',
                timestamp: new Date().toLocaleTimeString()
              };
            } else if (index === currentStep + 1) {
              return { ...step, status: 'active' };
            }
            return step;
          })
        );
        
        if (currentStep === steps.length - 1) {
          setSimulationResult('contained');
          setIsPlaying(false);
        } else {
          setCurrentStep(prev => prev + 1);
        }
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length]);

  const handlePlay = () => {
    setIsPlaying(true);
    if (currentStep === 0) {
      setSteps(prevSteps => 
        prevSteps.map((step, index) => ({
          ...step,
          status: index === 0 ? 'active' : 'pending'
        }))
      );
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setSimulationResult(null);
    setSteps(simulationSteps);
  };

  const handleStep = () => {
    if (currentStep < steps.length - 1) {
      setSteps(prevSteps => 
        prevSteps.map((step, index) => {
          if (index === currentStep) {
            return { 
              ...step, 
              status: 'completed',
              timestamp: new Date().toLocaleTimeString()
            };
          } else if (index === currentStep + 1) {
            return { ...step, status: 'active' };
          }
          return step;
        })
      );
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === steps.length - 1) {
      setSteps(prevSteps => 
        prevSteps.map((step, index) => 
          index === currentStep 
            ? { ...step, status: 'completed', timestamp: new Date().toLocaleTimeString() }
            : step
        )
      );
      setSimulationResult('contained');
    }
  };

  if (!useCase) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'active':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'contained':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'escalated':
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      case 'missed':
        return <XCircle className="w-8 h-8 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="inline-block w-full max-w-5xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Play className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Simulation: {useCase.title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center space-x-4 mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <button
                onClick={isPlaying ? handlePause : handlePlay}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={handleStep}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <SkipForward className="w-4 h-4" />
                <span>Step</span>
              </button>
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>

            {/* Simulation Steps */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    step.status === 'active' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : step.status === 'completed'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : step.status === 'failed'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(step.status)}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{step.phase}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                      </div>
                    </div>
                    {step.timestamp && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">{step.timestamp}</span>
                    )}
                  </div>
                  
                  {step.status !== 'pending' && (
                    <div className="mt-3 space-y-1">
                      {step.logs.map((log, logIndex) => (
                        <div key={logIndex} className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                          {log}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Simulation Result */}
            {simulationResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div className="flex items-center justify-center space-x-4">
                  {getResultIcon(simulationResult)}
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Simulation Result: {simulationResult.charAt(0).toUpperCase() + simulationResult.slice(1)}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {simulationResult === 'contained' && 'Threat successfully detected and contained by automated response'}
                      {simulationResult === 'escalated' && 'Threat detected but requires manual intervention'}
                      {simulationResult === 'missed' && 'Threat was not detected - review detection rules'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                Save Results
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Play, 
  Shield, 
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  User, 
  Upload, 
  ChevronUp 

} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { populateSoarData, generateTerminalLogLine, EventType, SimulationParams } from '../utils/simulationUtils';
import { useCases as importedUseCases, UseCase } from '@/data/useCases';
import { useNavigate } from 'react-router-dom';

const useCases: UseCase[] = importedUseCases;

const categories = ['All Categories', 'Malware Execution', 'Credential Abuse', 'Network Threat', 'Email Threat', 'Privilege Escalation', 'Data Exfiltration', 'Insider Threat'];

export const UseCasesDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const [loadingUseCase, setLoadingUseCase] = useState<string | null>(null);

  const filteredUseCases = useCases.filter(useCase => {
    const matchesCategory = selectedCategory === 'All Categories' || useCase.category === selectedCategory;
    const matchesSearch = useCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                useCase.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                useCase.detectionMethod.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Malware Execution': return <Shield className="w-4 h-4 text-red-500" />;
      case 'Network Threat': return <AlertTriangle className="w-4 h-4 text-blue-500" />;
      case 'Credential Abuse': return <User className="w-4 h-4 text-blue-500" />;
      case 'Email Threat': return <Download className="w-4 h-4 text-yellow-500" />;
      case 'Privilege Escalation': return <ChevronUp className="w-4 h-4 text-purple-500" />;
      case 'Data Exfiltration': return <Upload className="w-4 h-4 text-orange-500" />;
      case 'Insider Threat': return <User className="w-4 h-4 text-gray-500" />;
      default: return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleSimulate = async (useCaseId: string) => {
    setLoadingUseCase(useCaseId);

    const selectedUseCase = useCases.find(uc => uc.id === useCaseId);

    if (!selectedUseCase) {
      console.error("Use Case not found:", useCaseId);
      setLoadingUseCase(null);
      return;
    }

    const simulationParams: SimulationParams = selectedUseCase.soarDataParams;

    const dynamicSimulationSteps = selectedUseCase.simulationFlow.map(eventType =>
      generateTerminalLogLine(eventType as EventType, simulationParams)
    );

    const dynamicSimulatedSoarData = populateSoarData(
      selectedUseCase.soarDataTemplateId,
      simulationParams
    );

    try {
      const response = await fetch('http://localhost:5002/api/simulate', { // Confirm port 5002
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scriptId: useCaseId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Backend simulation trigger result:', result);

      if (result.status === 'success') {
        navigate('/terminal-simulation', {
          state: {
            simulationSteps: dynamicSimulationSteps,
            simulatedSoarData: dynamicSimulatedSoarData
          }
        });
      } 
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setLoadingUseCase(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
              Detection Use Cases
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Cybersecurity scenarios for XDR, EDR, and SOAR platforms
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
              {filteredUseCases.length} use cases
            </span>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search use cases..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              className="pl-10 pr-8 py-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium appearance-none cursor-pointer"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Use Case
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Detection Method
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Trigger Conditions
                </th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredUseCases.map((useCase, index) => (
                  <React.Fragment key={useCase.id}>
                    <motion.tr
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.03 }}
                      className={`border-b border-gray-50 transition-all duration-200 ${
                        hoveredRow === useCase.id ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'
                      } ${expandedRow === useCase.id ? 'bg-blue-50/20' : ''}`}
                      onMouseEnter={() => setHoveredRow(useCase.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            useCase.severity === 'critical' ? 'bg-red-500' :
                            useCase.severity === 'high' ? 'bg-orange-500' :
                            useCase.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {useCase.title}
                            </div>
                            <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${getSeverityColor(useCase.severity)}`}>
                              {useCase.severity.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(useCase.category)}
                          <span className="text-sm font-medium text-gray-700">
                            {useCase.category}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                          {useCase.detectionMethod}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-700 max-w-xs">
                          {useCase.triggerConditions.length > 60 
                            ? `${useCase.triggerConditions.substring(0, 60)}...`
                            : useCase.triggerConditions
                          }
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end space-x-2">
                          <motion.button
                            onClick={() => setExpandedRow(expandedRow === useCase.id ? null : useCase.id)}
                            className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {expandedRow === useCase.id ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            <span>Details</span>
                          </motion.button>
                          <motion.button
                            className={`flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-white ${
                              loadingUseCase === useCase.id ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            } rounded-lg transition-colors`}
                            whileHover={{ scale: loadingUseCase === useCase.id ? 1 : 1.02 }}
                            whileTap={{ scale: loadingUseCase === useCase.id ? 1 : 0.98 }}
                            onClick={() => handleSimulate(useCase.id)}
                            disabled={loadingUseCase === useCase.id}
                          >
                            {loadingUseCase === useCase.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                            <span>{loadingUseCase === useCase.id ? 'Running...' : 'Simulate'}</span>
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                    
                    {/* Expanded Row Content */}
                    <AnimatePresence>
                      {expandedRow === useCase.id && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <td colSpan={5} className="px-6 py-0">
                            <div className="bg-blue-50/30 rounded-lg p-6 mb-4 border border-blue-100">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                                  <p className="text-sm text-gray-700 leading-relaxed mb-4">
                                    {useCase.description}
                                  </p>
                                  
                                  <div className="flex flex-wrap gap-2 mb-4">
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-3">Log Sources</h4>
                                  <div className="space-y-2 mb-4">
                                    {useCase.logSources.map((source, index) => (
                                      <div key={index} className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                        <span className="text-sm text-gray-700">{source}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
        <div>
          Showing {filteredUseCases.length} of {useCases.length} use cases
        </div>
        <div className="flex items-center space-x-4">
          <span>Last updated: 2 minutes ago</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};
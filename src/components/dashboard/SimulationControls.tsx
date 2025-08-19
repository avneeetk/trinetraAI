// src/components/dashboard/SimulationControls.tsx
import React, { useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

interface SimulationControlsProps {
  isSimulating: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = React.memo(({
  isSimulating,
  onStart,
  onStop,
  onReset,
  speed,
  onSpeedChange
}) => {
  const speedOptions = [
    { label: 'Fast', value: 500 },
    { label: 'Normal', value: 1500 },
    { label: 'Slow', value: 3000 }
  ];

  const handleSpeedChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onSpeedChange(Number(e.target.value));
  }, [onSpeedChange]);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Settings className="h-4 w-4 text-gray-500" />
        <select
          value={speed}
          onChange={handleSpeedChange}
          className="text-sm border rounded px-2 py-1 bg-white"
          disabled={isSimulating}
        >
          {speedOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        {!isSimulating ? (
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Play className="h-4 w-4" />
            Start Simulation
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <Pause className="h-4 w-4" />
            Stop Simulation
          </button>
        )}
        
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          disabled={isSimulating}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      {isSimulating && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Simulation Active
        </div>
      )}
    </div>
  );
});
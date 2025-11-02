import { AlertTriangle } from 'lucide-react';
export function Disclaimer() {
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-yellow-500/30 bg-gray-900/50 p-4 text-xs text-yellow-200 shadow-lg backdrop-blur-md">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-400" />
        <div>
          <p className="font-semibold text-yellow-300">Demonstration Only</p>
          <p className="mt-1 text-yellow-200/80">
            This is a simulation. Data is randomly generated and does not represent real market conditions or financial advice. It is not connected to any trading platform.
          </p>
        </div>
      </div>
    </div>
  );
}
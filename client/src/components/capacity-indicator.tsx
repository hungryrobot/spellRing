import { cn } from "@/lib/utils";

interface CapacityIndicatorProps {
  current: number;
  max: number;
  className?: string;
}

export default function CapacityIndicator({ current, max, className }: CapacityIndicatorProps) {
  const percentage = (current / max) * 100;
  const isFull = current >= max;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Capacity:</span>
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{current}</span>
            </div>
            <span className="text-gray-400">/</span>
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-xs font-bold">{max}</span>
            </div>
          </div>
        </div>

      </div>
      
      <div className="w-full">
        <div className="flex space-x-1">
          {Array.from({ length: max }, (_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 h-2",
                i === 0 && "rounded-l",
                i === max - 1 && "rounded-r",
                i < current ? "bg-green-500" : "bg-gray-200"
              )}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Empty</span>
          <span>Full</span>
        </div>
      </div>

      {isFull && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-pulse">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <span className="font-medium">Ring is at maximum capacity!</span>
          </div>
        </div>
      )}
    </div>
  );
}

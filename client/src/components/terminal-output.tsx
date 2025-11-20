import { useEffect, useState } from "react";
import { Terminal, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface TerminalLine {
  text: string;
  type?: 'input' | 'output' | 'error' | 'success' | 'warning';
  delay?: number;
}

interface TerminalOutputProps {
  lines: TerminalLine[];
  isRunning?: boolean;
  className?: string;
  showProgress?: boolean;
  progress?: number;
}

export function TerminalOutput({ lines, isRunning, className, showProgress, progress = 0 }: TerminalOutputProps) {
  const [displayedLines, setDisplayedLines] = useState<TerminalLine[]>([]);
  const [currentLineText, setCurrentLineText] = useState('');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    setDisplayedLines([]);
    setCurrentLineIndex(0);
    setCharIndex(0);
    setCurrentLineText('');
  }, [lines]);

  useEffect(() => {
    if (currentLineIndex >= lines.length) return;

    const currentLine = lines[currentLineIndex];
    
    if (charIndex < currentLine.text.length) {
      const timeout = setTimeout(() => {
        setCurrentLineText(prev => prev + currentLine.text[charIndex]);
        setCharIndex(prev => prev + 1);
      }, currentLine.type === 'input' ? 15 : 5);
      
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setDisplayedLines(prev => [...prev, { ...currentLine, text: currentLineText }]);
        setCurrentLineText('');
        setCharIndex(0);
        setCurrentLineIndex(prev => prev + 1);
      }, currentLine.delay || 50);
      
      return () => clearTimeout(timeout);
    }
  }, [charIndex, currentLineIndex, currentLineText, lines]);

  const getLineColor = (type?: string) => {
    switch (type) {
      case 'input':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'success':
        return 'text-emerald-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className={cn("rounded-lg border border-hacker-danger/30 bg-black/95 p-4 font-mono text-sm", className)}>
      <div className="mb-3 flex items-center justify-between border-b border-hacker-danger/20 pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-hacker-danger" />
          <span className="text-xs text-hacker-danger">ATTACK TERMINAL</span>
        </div>
        {isRunning && (
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3 animate-pulse text-hacker-danger" />
            <span className="text-xs text-hacker-danger">EXECUTING...</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {displayedLines.map((line, index) => (
          <div key={index} className="flex items-start gap-2">
            {line.type === 'input' && <span className="text-green-400">{'>'}</span>}
            <span className={cn(getLineColor(line.type), "break-all")}>{line.text}</span>
          </div>
        ))}
        {currentLineText && (
          <div className="flex items-start gap-2">
            {lines[currentLineIndex]?.type === 'input' && <span className="text-green-400">{'>'}</span>}
            <span className={getLineColor(lines[currentLineIndex]?.type)}>
              {currentLineText}
              <span className="animate-pulse">▋</span>
            </span>
          </div>
        )}
        {isRunning && displayedLines.length === lines.length && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-hacker-danger animate-pulse">{'>'}</span>
            <span className="text-gray-400">_</span>
          </div>
        )}
      </div>

      {showProgress && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Progress</span>
            <span className="text-hacker-danger">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full bg-gradient-to-r from-hacker-danger to-orange-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

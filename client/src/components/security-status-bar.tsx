import { Shield, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { GameState } from "@shared/schema";

interface SecurityStatusBarProps {
  vulnerabilityScore: number;
  securityMeasures: GameState['casualUser']['securityMeasures'];
  attacksBlocked: number;
}

export function SecurityStatusBar({
  vulnerabilityScore,
  securityMeasures,
  attacksBlocked,
}: SecurityStatusBarProps) {
  const securityLevel = 100 - vulnerabilityScore;
  
  const getStatusColor = () => {
    if (securityLevel >= 80) return "text-user-safe";
    if (securityLevel >= 50) return "text-warning";
    return "text-hacker-danger";
  };

  const getStatusIcon = () => {
    if (securityLevel >= 80) return <ShieldCheck className="h-5 w-5" />;
    if (securityLevel >= 50) return <ShieldAlert className="h-5 w-5" />;
    return <ShieldX className="h-5 w-5" />;
  };

  const getStatusText = () => {
    if (securityLevel >= 80) return "Seguro";
    if (securityLevel >= 50) return "Vulnerável";
    return "Em Risco";
  };

  const activeSecurityCount = Object.values(securityMeasures).filter(Boolean).length;

  return (
    <div className="border-b bg-card px-4 py-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={getStatusColor()}>
              {getStatusIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  Status de Segurança:
                </span>
                <span className={`text-sm font-bold ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {activeSecurityCount}/5 medidas de segurança ativas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-user-safe" data-testid="text-attacks-blocked">
                {attacksBlocked}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Ataques Bloqueados
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" data-testid="text-security-level">
                {Math.round(securityLevel)}%
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Nível de Segurança
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <Progress
            value={securityLevel}
            className="h-2"
            data-testid="progress-security"
          />
        </div>
      </div>
    </div>
  );
}

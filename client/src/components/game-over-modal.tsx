/**
 * Modal de Game Over
 * 
 * Exibido quando a conta do usuário é comprometida.
 * Mostra estatísticas do jogo e permite reiniciar ou voltar para tela inicial.
 * 
 * Correções:
 * - Fechar funciona no primeiro clique
 * - Reiniciar funciona no primeiro clique
 * - Ambos redirecionam para tela de criação de conta
 */

import React from "react";
import type { GameState } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldX, AlertTriangle, CheckCircle2, XCircle, X } from "lucide-react";

interface GameOverModalProps {
  gameState: GameState;
  onRestart: () => void;
  onClose: () => void;
  isOpen: boolean; // Controle externo do estado do modal
}

export function GameOverModal({ gameState, onRestart, onClose, isOpen }: GameOverModalProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  // Reseta o estado de processamento quando o modal fecha/abre
  React.useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false);
    }
  }, [isOpen]);
  
  const attacksBlocked = gameState.hacker.attacksAttempted - gameState.hacker.attacksSuccessful;
  const successRate =
    gameState.hacker.attacksAttempted > 0
      ? Math.round((gameState.hacker.attacksSuccessful / gameState.hacker.attacksAttempted) * 100)
      : 0;

  const activeSecurityMeasures = Object.entries(gameState.casualUser.securityMeasures)
    .filter(([_, enabled]) => enabled)
    .map(([key]) => key);

  const inactiveSecurityMeasures = Object.entries(gameState.casualUser.securityMeasures)
    .filter(([_, enabled]) => !enabled)
    .map(([key]) => key);

  const securityTips: Record<string, string> = {
    twoFactorAuth: "Autenticação de Dois Fatores bloqueia acessos não autorizados",
    strongPassword: "Senhas Fortes resistem a ataques de força bruta",
    emailVerification: "Verificação de Email detecta phishing",
    securityQuestions: "Perguntas de Segurança protegem contra engenharia social",
    backupEmail: "Email de Recuperação previne perda de acesso",
  };
  
  const handleRestart = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    onRestart();
  };
  
  const handleClose = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }} modal>
      <DialogContent 
        className="sm:max-w-md" 
        data-testid="modal-game-over"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          aria-label="Fechar modal"
          disabled={isProcessing}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </button>
        <DialogHeader>
          <div className="mx-auto mb-3 rounded-full bg-hacker-danger/10 p-3">
            <ShieldX className="h-8 w-8 text-hacker-danger" />
          </div>
          <DialogTitle className="text-center text-2xl font-heading">
            Conta Comprometida!
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            O hacker conseguiu invadir sua conta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-3">
          <div className="grid gap-2 grid-cols-3">
            <div className="rounded-md bg-muted p-2 text-center">
              <div className="text-lg font-bold">{gameState.hacker.attacksAttempted}</div>
              <div className="text-[10px] text-muted-foreground">Tentativas</div>
            </div>
            <div className="rounded-md bg-hacker-danger/10 p-2 text-center">
              <div className="text-lg font-bold text-hacker-danger">
                {gameState.hacker.attacksSuccessful}
              </div>
              <div className="text-[10px] text-muted-foreground">Sucedidos</div>
            </div>
            <div className="rounded-md bg-user-safe/10 p-2 text-center">
              <div className="text-lg font-bold text-user-safe">{attacksBlocked}</div>
              <div className="text-[10px] text-muted-foreground">Bloqueados</div>
            </div>
          </div>

          {inactiveSecurityMeasures.length > 0 && (
            <Card className="border-warning/30 bg-warning/5 p-3">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <h3 className="text-sm font-semibold">Proteções Não Ativadas</h3>
              </div>
              <div className="space-y-1">
                {inactiveSecurityMeasures.slice(0, 3).map((measure) => (
                  <div key={measure} className="flex items-start gap-1.5 text-xs">
                    <XCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-hacker-danger" />
                    <span className="line-clamp-1">{securityTips[measure]}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          
          <Button
            onClick={handleRestart}
            className="flex-1 bg-primary text-primary-foreground"
            data-testid="button-restart-game"
            disabled={isProcessing}
          >
            {isProcessing ? "Reiniciando..." : "Jogar Novamente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

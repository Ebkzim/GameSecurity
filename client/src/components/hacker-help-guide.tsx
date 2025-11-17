import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Terminal, Target, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

export function HackerHelpGuide() {
  const attacks = [
    {
      name: "Força Bruta",
      difficulty: "medium",
      description: "Tenta adivinhar a senha através de múltiplas tentativas sistemáticas.",
      effectiveAgainst: ["Senhas fracas", "Ausência de 2FA", "Sem limite de tentativas"],
      ineffectiveAgainst: ["Senha forte", "2FA", "Aplicativo Autenticador", "Lista de IPs", "Gerenciamento de Sessão"],
      baseSuccess: "80%",
      reducedBy: "-40% com senha forte, -60% com 2FA, -70% com App Autenticador",
      cooldown: "30s",
      tips: "Mais efetivo contra contas sem proteção adicional além da senha."
    },
    {
      name: "Phishing",
      difficulty: "medium",
      description: "Envia emails ou cria sites falsos para enganar o usuário e roubar credenciais.",
      effectiveAgainst: ["Sem verificação de email", "Sem alertas de login", "Sem 2FA"],
      ineffectiveAgainst: ["App Autenticador", "2FA", "Verificação de Email", "Alertas de Login", "Dispositivos Confiáveis"],
      baseSuccess: "70%",
      reducedBy: "-30% com 2FA, -40% com App Autenticador, -25% com Verificação de Email",
      cooldown: "20s",
      tips: "Funciona melhor se o alvo não verificou o email ou não tem alertas ativos."
    },
    {
      name: "Engenharia Social",
      difficulty: "hard",
      description: "Manipula psicologicamente o usuário para revelar informações confidenciais.",
      effectiveAgainst: ["Sem perguntas de segurança", "Sem 2FA", "Sem alertas"],
      ineffectiveAgainst: ["Perguntas de Segurança", "2FA", "Alertas de Login"],
      baseSuccess: "65%",
      reducedBy: "-20% com Perguntas de Segurança, -25% com 2FA, -20% com Alertas",
      cooldown: "15s",
      tips: "Explora a confiança do usuário. Menos efetivo com múltiplas camadas de verificação."
    },
    {
      name: "Keylogger",
      difficulty: "hard",
      description: "Instala software malicioso que captura tudo que o usuário digita.",
      effectiveAgainst: ["Sem 2FA", "Sem App Autenticador"],
      ineffectiveAgainst: ["App Autenticador", "2FA", "Gerenciamento de Sessão"],
      baseSuccess: "60%",
      reducedBy: "-25% com 2FA, -30% com App Autenticador",
      cooldown: "25s",
      tips: "Mesmo capturando a senha, 2FA pode bloquear o acesso."
    },
    {
      name: "Vazamento de Dados",
      difficulty: "easy",
      description: "Explora senhas que foram expostas em vazamentos de outros sites.",
      effectiveAgainst: ["Senhas reutilizadas", "Sem 2FA", "Senhas fracas"],
      ineffectiveAgainst: ["App Autenticador", "2FA", "Senha Forte", "SMS Backup"],
      baseSuccess: "75%",
      reducedBy: "-20% com senha forte, -40% com 2FA, -50% com App Autenticador",
      cooldown: "35s",
      tips: "Altamente efetivo se o usuário reutiliza senhas em múltiplos sites."
    },
    {
      name: "Sequestro de Sessão",
      difficulty: "very-hard",
      description: "Rouba tokens de sessão ativa do usuário para acessar a conta sem senha.",
      effectiveAgainst: ["Sem gerenciamento de sessão", "Sem alertas"],
      ineffectiveAgainst: ["Gerenciamento de Sessão", "Alertas de Login", "2FA"],
      baseSuccess: "55%",
      reducedBy: "-20% com Gerenciamento de Sessão, -15% com Alertas",
      cooldown: "28s",
      tips: "Requer captura de tráfego de rede. Gerenciamento de sessão limita janela de ataque."
    },
    {
      name: "Man-in-the-Middle",
      difficulty: "very-hard",
      description: "Intercepta a comunicação entre o usuário e o servidor.",
      effectiveAgainst: ["Conexões não seguras", "Sem dispositivos confiáveis"],
      ineffectiveAgainst: ["Dispositivos Confiáveis", "2FA", "Lista de IPs"],
      baseSuccess: "50%",
      reducedBy: "-25% com Dispositivos Confiáveis, -20% com 2FA",
      cooldown: "32s",
      tips: "Difícil de executar. Lista de dispositivos confiáveis é uma defesa forte."
    },
    {
      name: "Credential Stuffing",
      difficulty: "medium",
      description: "Usa credenciais vazadas de outros sites para tentar acessar a conta.",
      effectiveAgainst: ["Senhas reutilizadas", "Sem 2FA", "Sem lista de IPs"],
      ineffectiveAgainst: ["2FA", "Lista de IPs", "Senha Forte", "Cofre de Senhas"],
      baseSuccess: "70%",
      reducedBy: "-30% com 2FA, -25% com Lista de IPs",
      cooldown: "26s",
      tips: "Muito efetivo se o usuário usa a mesma senha em múltiplos sites."
    },
    {
      name: "SIM Swap",
      difficulty: "very-hard",
      description: "Clona o SIM card do usuário para interceptar códigos SMS de 2FA.",
      effectiveAgainst: ["2FA por SMS", "Backup por SMS"],
      ineffectiveAgainst: ["App Autenticador", "Email de Recuperação"],
      baseSuccess: "45%",
      reducedBy: "-40% com App Autenticador ao invés de SMS",
      cooldown: "40s",
      tips: "Específico contra 2FA via SMS. App Autenticador é imune a este ataque."
    },
    {
      name: "Injeção de Malware",
      difficulty: "very-hard",
      description: "Infecta o dispositivo do usuário com software malicioso.",
      effectiveAgainst: ["Sem antivírus", "Dispositivos desprotegidos"],
      ineffectiveAgainst: ["2FA", "App Autenticador", "Dispositivos Confiáveis"],
      baseSuccess: "55%",
      reducedBy: "-30% com 2FA, -20% com Dispositivos Confiáveis",
      cooldown: "33s",
      tips: "Mesmo com malware instalado, 2FA pode prevenir acesso não autorizado."
    },
    {
      name: "DNS Spoofing",
      difficulty: "very-hard",
      description: "Redireciona o usuário para um site falso através de manipulação de DNS.",
      effectiveAgainst: ["Usuários desatentos", "Sem verificação de URL"],
      ineffectiveAgainst: ["2FA", "App Autenticador", "Verificação de Email"],
      baseSuccess: "50%",
      reducedBy: "-25% com 2FA, -20% com Verificação de Email",
      cooldown: "29s",
      tips: "Combina bem com phishing. 2FA ainda protege mesmo em site falso."
    },
    {
      name: "Zero-Day Exploit",
      difficulty: "extreme",
      description: "Explora vulnerabilidade desconhecida do sistema.",
      effectiveAgainst: ["Sistemas desatualizados", "Sem patches de segurança"],
      ineffectiveAgainst: ["2FA", "App Autenticador", "Múltiplas camadas de segurança"],
      baseSuccess: "60%",
      reducedBy: "-30% com 2FA, -40% com App Autenticador",
      cooldown: "50s",
      tips: "Ataque avançado mas ainda bloqueável com 2FA e autenticação forte."
    },
  ];

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return <Badge className="bg-green-500">Fácil</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500">Médio</Badge>;
      case "hard":
        return <Badge className="bg-orange-500">Difícil</Badge>;
      case "very-hard":
        return <Badge className="bg-red-500">Muito Difícil</Badge>;
      case "extreme":
        return <Badge className="bg-purple-500">Extremo</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-red-500/20 bg-red-950/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-500">Guia de Ataques</CardTitle>
          </div>
          <CardDescription>
            Entenda cada ataque e quais defesas são efetivas contra eles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <Accordion type="single" collapsible className="w-full">
              {attacks.map((attack, index) => (
                <AccordionItem value={`attack-${index}`} key={index}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <Target className="h-4 w-4 text-red-500" />
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{attack.name}</span>
                          {getDifficultyBadge(attack.difficulty)}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pl-1 pt-2">
                      <p className="text-sm text-muted-foreground">
                        {attack.description}
                      </p>
                      
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2 rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <p className="text-sm font-medium text-green-500">Efetivo Contra</p>
                          </div>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {attack.effectiveAgainst.map((item, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-green-500 mt-0.5">✓</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                            <p className="text-sm font-medium text-red-500">Bloqueado Por</p>
                          </div>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {attack.ineffectiveAgainst.map((item, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-red-500 mt-0.5">✗</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-2 rounded-lg border bg-card p-3">
                        <div className="grid gap-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Chance de Sucesso Base:</span>
                            <Badge variant="outline">{attack.baseSuccess}</Badge>
                          </div>
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium">Redução por Defesas:</p>
                              <p className="text-muted-foreground">{attack.reducedBy}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Cooldown:</span>
                            <Badge variant="outline">{attack.cooldown}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                        <div className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-500">Dica Estratégica:</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {attack.tips}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

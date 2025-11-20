/**
 * Guia de Ataques para o Hacker
 * 
 * Componente educacional que explica cada tipo de ataque,
 * como funciona, quais ferramentas usar e quais defesas bloqueiam.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { attackTypes } from "@shared/schema";
import { 
  Shield, Target, Wrench, AlertTriangle, 
  Lock, Mail, MessageSquare, Keyboard, Database,
  Zap, Info, Cookie, Network, KeyRound, Smartphone,
  Bug, Globe, Sparkles
} from "lucide-react";

const attackDetails: Record<string, {
  icon: any;
  color: string;
  borderColor: string;
  bgColor: string;
  description: string;
  howItWorks: string;
  tools: string[];
  defensesBlocked: string[];
  difficulty: "Fácil" | "Médio" | "Difícil";
  successRate: string;
}> = {
  brute_force: {
    icon: Lock,
    color: "text-rose-700 dark:text-rose-400",
    borderColor: "border-rose-200 dark:border-rose-800",
    bgColor: "bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30",
    description: "Tenta adivinhar a senha através de múltiplas tentativas automáticas",
    howItWorks: "O ataque testa milhares de combinações de senhas até encontrar a correta. Quanto mais fraca a senha, mais rápido o ataque funciona.",
    tools: ["Hydra", "John the Ripper", "Hashcat"],
    defensesBlocked: ["Autenticação de Dois Fatores", "Senha Forte", "Lista de IPs Permitidos"],
    difficulty: "Médio",
    successRate: "Alto com senhas fracas"
  },
  phishing: {
    icon: Mail,
    color: "text-orange-700 dark:text-orange-400",
    borderColor: "border-orange-200 dark:border-orange-800",
    bgColor: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30",
    description: "Engana o usuário com emails ou sites falsos para roubar credenciais",
    howItWorks: "Cria páginas de login falsas que imitam sites legítimos. O usuário insere suas credenciais pensando estar no site real.",
    tools: ["Gophish", "King Phisher", "Social Engineer Toolkit"],
    defensesBlocked: ["Verificação de Email", "Alertas de Login", "2FA"],
    difficulty: "Fácil",
    successRate: "Muito alto sem proteção"
  },
  social_engineering: {
    icon: MessageSquare,
    color: "text-amber-700 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800",
    bgColor: "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30",
    description: "Manipula psicologicamente a vítima para obter informações sensíveis",
    howItWorks: "Convence a vítima a fornecer informações através de conversas enganosas, fingindo ser suporte técnico, amigo ou autoridade.",
    tools: ["Social Mapper", "SET Toolkit", "Maltego"],
    defensesBlocked: ["Perguntas de Segurança", "Alertas de Login", "2FA"],
    difficulty: "Difícil",
    successRate: "Médio, depende da vítima"
  },
  keylogger: {
    icon: Keyboard,
    color: "text-violet-700 dark:text-violet-400",
    borderColor: "border-violet-200 dark:border-violet-800",
    bgColor: "bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30",
    description: "Instala software malicioso que registra tudo que é digitado",
    howItWorks: "Um programa invisível grava todas as teclas digitadas, incluindo senhas, e envia para o hacker.",
    tools: ["KeyLogger Pro", "Spyrix", "Actual Keylogger"],
    defensesBlocked: ["Aplicativo Autenticador", "2FA", "Gerenciamento de Sessão"],
    difficulty: "Médio",
    successRate: "Alto se instalado"
  },
  password_leak: {
    icon: Database,
    color: "text-sky-700 dark:text-sky-400",
    borderColor: "border-sky-200 dark:border-sky-800",
    bgColor: "bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-950/30 dark:to-cyan-950/30",
    description: "Usa senhas vazadas de outros sites que a vítima pode ter reutilizado",
    howItWorks: "Procura em bancos de dados de senhas vazadas por credenciais que a vítima pode ter usado em múltiplos sites.",
    tools: ["Shodan", "Have I Been Pwned", "DeHashed"],
    defensesBlocked: ["Autenticação de Dois Fatores", "Senha Forte Única", "Aplicativo Autenticador"],
    difficulty: "Fácil",
    successRate: "Alto com senhas reutilizadas"
  },
  session_hijacking: {
    icon: Cookie,
    color: "text-fuchsia-700 dark:text-fuchsia-400",
    borderColor: "border-fuchsia-200 dark:border-fuchsia-800",
    bgColor: "bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/30 dark:to-pink-950/30",
    description: "Rouba tokens de sessão ativos do usuário para assumir sua conta",
    howItWorks: "Intercepta ou rouba cookies de sessão do navegador, permitindo ao hacker acessar a conta sem precisar da senha.",
    tools: ["Wireshark", "Burp Suite", "Cookie Cadger"],
    defensesBlocked: ["Gerenciamento de Sessão", "Lista de IPs Permitidos", "Dispositivos Confiáveis"],
    difficulty: "Médio",
    successRate: "Alto em redes inseguras"
  },
  man_in_the_middle: {
    icon: Network,
    color: "text-indigo-700 dark:text-indigo-400",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    bgColor: "bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30",
    description: "Intercepta comunicação entre usuário e servidor",
    howItWorks: "Posiciona-se entre o usuário e o servidor para espionar ou alterar dados transmitidos, capturando senhas e informações sensíveis.",
    tools: ["Ettercap", "MITMproxy", "Bettercap"],
    defensesBlocked: ["Lista de IPs Permitidos", "Dispositivos Confiáveis", "Alertas de Login"],
    difficulty: "Difícil",
    successRate: "Alto em redes públicas"
  },
  credential_stuffing: {
    icon: KeyRound,
    color: "text-red-700 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
    bgColor: "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30",
    description: "Usa credenciais vazadas de outros sites para tentar acessar a conta",
    howItWorks: "Testa combinações de email/senha de vazamentos de dados de outros serviços, explorando o hábito de reutilizar senhas.",
    tools: ["Sentry MBA", "SNIPR", "OpenBullet"],
    defensesBlocked: ["Senha Única/Forte", "2FA", "Aplicativo Autenticador"],
    difficulty: "Fácil",
    successRate: "Muito alto com reutilização"
  },
  sim_swap: {
    icon: Smartphone,
    color: "text-blue-700 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
    bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
    description: "Clona o SIM card para interceptar SMS e códigos 2FA",
    howItWorks: "Convence a operadora a transferir o número para um novo SIM, permitindo receber SMS de verificação e códigos 2FA.",
    tools: ["Social Engineering", "Insider Help", "Fake ID"],
    defensesBlocked: ["Aplicativo Autenticador", "Backup de SMS", "Alertas de Login"],
    difficulty: "Difícil",
    successRate: "Baixo, mas devastador"
  },
  malware_injection: {
    icon: Bug,
    color: "text-emerald-700 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    bgColor: "bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30",
    description: "Infecta o dispositivo com software malicioso para roubar dados",
    howItWorks: "Instala vírus, trojans ou spyware que podem roubar senhas, capturar tela, ou dar controle remoto do dispositivo.",
    tools: ["Metasploit", "RATs (Remote Access Trojans)", "Backdoors"],
    defensesBlocked: ["Aplicativo Autenticador", "Gerenciamento de Sessão", "Dispositivos Confiáveis"],
    difficulty: "Médio",
    successRate: "Alto se executado"
  },
  dns_spoofing: {
    icon: Globe,
    color: "text-teal-700 dark:text-teal-400",
    borderColor: "border-teal-200 dark:border-teal-800",
    bgColor: "bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30",
    description: "Redireciona para sites falsos manipulando DNS",
    howItWorks: "Altera respostas DNS para redirecionar usuário a sites falsos idênticos ao original, capturando credenciais de login.",
    tools: ["DNSChef", "Ettercap", "Responder"],
    defensesBlocked: ["Verificação de Email", "Alertas de Login", "2FA"],
    difficulty: "Médio",
    successRate: "Médio, difícil de detectar"
  },
  zero_day_exploit: {
    icon: Sparkles,
    color: "text-purple-700 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800",
    bgColor: "bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30",
    description: "Explora vulnerabilidades desconhecidas no sistema",
    howItWorks: "Usa falhas de segurança ainda não descobertas ou corrigidas pelos desenvolvedores para contornar todas as defesas.",
    tools: ["Custom Exploits", "Metasploit Framework", "Exploit Kits"],
    defensesBlocked: ["Nenhuma (vulnerabilidade desconhecida)", "Apenas mitigação parcial"],
    difficulty: "Difícil",
    successRate: "Muito alto quando bem-sucedido"
  }
};

export function AttackGuide() {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Fácil":
        return "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400";
      case "Médio":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400";
      case "Difícil":
        return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400";
    }
  };

  return (
    <ScrollArea className="z">
      <div className="space-y-6 p-6">
        <div className="sticky top-0 --tw-gradient dark:bg-slate-800 pb-4 z-10">
          <h2 className="text-3xl font-bold text-red-600 dark:text-red-500 flex items-center gap-3">
            <Target className="h-8 w-8" />
            Guia Completo de Ataques Cibernéticos
          </h2>
          <p className="mt-2 text-base text-white dark:text-gray-400">
            Conheça os 12 tipos de ataques, como funcionam e quais defesas são eficazes contra cada um
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {attackTypes.map((attack) => {
            const details = attackDetails[attack.id];
            if (!details) return null;
            const Icon = details.icon;

            return (
              <Card key={attack.id} className={`${details.bgColor} ${details.borderColor} border-2 hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-3 rounded-xl bg-white dark:bg-slate-900 shadow-sm`}>
                      <Icon className={`h-6 w-6 ${details.color}`} />
                    </div>
                    <Badge className={getDifficultyColor(details.difficulty)}>
                      {details.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className={`text-lg font-bold ${details.color}`}>{attack.name}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {details.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Info className={`h-4 w-4 ${details.color}`} />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Como Funciona</h4>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {details.howItWorks}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Wrench className={`h-4 w-4 ${details.color}`} />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Ferramentas</h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {details.tools.map((tool, index) => (
                        <Badge key={index} variant="outline" className="text-xs font-medium">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Defesas Eficazes</h4>
                    </div>
                    <div className="space-y-1">
                      {details.defensesBlocked.map((defense, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">{defense}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Taxa de Sucesso:</span>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{details.successRate}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Recarga:</span>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{attack.cooldown / 1000}s</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        
      </div>
    </ScrollArea>
  );
}

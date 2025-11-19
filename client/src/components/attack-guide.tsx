/**
 * Guia de Ataques para o Hacker
 * 
 * Componente educacional que explica cada tipo de ataque,
 * como funciona, quais ferramentas usar e quais defesas bloqueiam.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { attackTypes } from "@shared/schema";
import { 
  Shield, Target, Wrench, AlertTriangle, 
  Lock, Mail, MessageSquare, Keyboard, Database,
  Zap, Info
} from "lucide-react";

const attackDetails: Record<string, {
  icon: any;
  color: string;
  description: string;
  howItWorks: string;
  tools: string[];
  defensesBlocked: string[];
  difficulty: "Fácil" | "Médio" | "Difícil";
  successRate: string;
}> = {
  brute_force: {
    icon: Lock,
    color: "text-red-500",
    description: "Tenta adivinhar a senha através de múltiplas tentativas automáticas",
    howItWorks: "O ataque testa milhares de combinações de senhas até encontrar a correta. Quanto mais fraca a senha, mais rápido o ataque funciona.",
    tools: ["Hydra", "John the Ripper", "Hashcat"],
    defensesBlocked: ["Autenticação de Dois Fatores", "Senha Forte", "Lista de IPs Permitidos"],
    difficulty: "Médio",
    successRate: "Alto com senhas fracas"
  },
  phishing: {
    icon: Mail,
    color: "text-amber-500",
    description: "Engana o usuário com emails ou sites falsos para roubar credenciais",
    howItWorks: "Cria páginas de login falsas que imitam sites legítimos. O usuário insere suas credenciais pensando estar no site real.",
    tools: ["Gophish", "King Phisher", "Social Engineer Toolkit"],
    defensesBlocked: ["Verificação de Email", "Alertas de Login", "2FA"],
    difficulty: "Fácil",
    successRate: "Muito alto sem proteção"
  },
  social_engineering: {
    icon: MessageSquare,
    color: "text-orange-500",
    description: "Manipula psicologicamente a vítima para obter informações sensíveis",
    howItWorks: "Convence a vítima a fornecer informações através de conversas enganosas, fingindo ser suporte técnico, amigo ou autoridade.",
    tools: ["Social Mapper", "SET Toolkit", "Maltego"],
    defensesBlocked: ["Perguntas de Segurança", "Alertas de Login", "2FA"],
    difficulty: "Difícil",
    successRate: "Médio, depende da vítima"
  },
  keylogger: {
    icon: Keyboard,
    color: "text-purple-500",
    description: "Instala software malicioso que registra tudo que é digitado",
    howItWorks: "Um programa invisível grava todas as teclas digitadas, incluindo senhas, e envia para o hacker.",
    tools: ["KeyLogger Pro", "Spyrix", "Actual Keylogger"],
    defensesBlocked: ["Aplicativo Autenticador", "2FA", "Gerenciamento de Sessão"],
    difficulty: "Médio",
    successRate: "Alto se instalado"
  },
  password_leak: {
    icon: Database,
    color: "text-cyan-500",
    description: "Usa senhas vazadas de outros sites que a vítima pode ter reutilizado",
    howItWorks: "Procura em bancos de dados de senhas vazadas por credenciais que a vítima pode ter usado em múltiplos sites.",
    tools: ["Shodan", "Have I Been Pwned", "DeHashed"],
    defensesBlocked: ["Autenticação de Dois Fatores", "Senha Forte Única", "Aplicativo Autenticador"],
    difficulty: "Fácil",
    successRate: "Alto com senhas reutilizadas"
  }
};

export function AttackGuide() {
  return (
    <div className="space-y-6 h-full overflow-auto p-6">
      <div>
        <h2 className="text-2xl font-bold text-red-500 flex items-center gap-2">
          <Target className="h-6 w-6" />
          Guia de Ataques
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Aprenda sobre cada tipo de ataque, como funcionam e quais defesas são eficazes
        </p>
      </div>

      <Tabs defaultValue="brute_force" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2 h-auto bg-transparent">
          {attackTypes.slice(0, 5).map((attack) => {
            const details = attackDetails[attack.id];
            if (!details) return null;
            const Icon = details.icon;
            
            return (
              <TabsTrigger 
                key={attack.id} 
                value={attack.id}
                className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-accent"
              >
                <Icon className={`h-5 w-5 ${details.color}`} />
                <span className="text-xs font-medium">{attack.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {attackTypes.slice(0, 5).map((attack) => {
          const details = attackDetails[attack.id];
          if (!details) return null;
          const Icon = details.icon;

          return (
            <TabsContent key={attack.id} value={attack.id} className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg bg-accent`}>
                        <Icon className={`h-6 w-6 ${details.color}`} />
                      </div>
                      <div>
                        <CardTitle>{attack.name}</CardTitle>
                        <CardDescription>{details.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={
                        details.difficulty === "Fácil" ? "default" : 
                        details.difficulty === "Médio" ? "secondary" : 
                        "destructive"
                      }>
                        {details.difficulty}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold">Como Funciona</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {details.howItWorks}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold">Ferramentas Usadas</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {details.tools.map((tool, index) => (
                        <Badge key={index} variant="outline">{tool}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <h3 className="font-semibold">Defesas Eficazes</h3>
                    </div>
                    <div className="space-y-2">
                      {details.defensesBlocked.map((defense, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          <span>{defense}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Taxa de Sucesso:</span>
                      <span className="font-semibold">{details.successRate}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Tempo de Recarga:</span>
                      <span className="font-semibold">{attack.cooldown / 1000}s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      <Card className="border-amber-500/50 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-500">
            <AlertTriangle className="h-5 w-5" />
            Dica Importante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Este é um jogo educacional. Na vida real, realizar ataques cibernéticos é <strong>ilegal</strong> e pode
            resultar em processos criminais. Use este conhecimento apenas para se proteger e entender como se defender.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

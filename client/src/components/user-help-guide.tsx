import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, AlertTriangle, CheckCircle2, Info } from "lucide-react";

export function UserHelpGuide() {
  const protections = [
    {
      name: "Senha Forte",
      importance: "essential",
      description: "Use senhas com pelo menos 12 caracteres, misturando letras maiúsculas, minúsculas, números e símbolos.",
      protects: ["Força Bruta", "Vazamento de Dados"],
      effectiveness: "40%",
      tips: "Evite palavras do dicionário, datas de nascimento ou informações pessoais."
    },
    {
      name: "Autenticação de Dois Fatores (2FA)",
      importance: "essential",
      description: "Adiciona uma camada extra de segurança exigindo um código além da senha.",
      protects: ["Força Bruta", "Phishing", "Keylogger", "Vazamento de Dados", "Credential Stuffing"],
      effectiveness: "60%",
      tips: "Use aplicativos autenticadores em vez de SMS quando possível."
    },
    {
      name: "Aplicativo Autenticador",
      importance: "essential",
      description: "Mais seguro que SMS, gera códigos temporários offline.",
      protects: ["Força Bruta", "Phishing", "SIM Swap", "Vazamento de Dados"],
      effectiveness: "70%",
      tips: "Aplicativos como Google Authenticator ou Authy são ótimas opções."
    },
    {
      name: "Verificação de Email",
      importance: "recommended",
      description: "Confirma que você tem acesso ao email cadastrado.",
      protects: ["Phishing"],
      effectiveness: "25%",
      tips: "Use um email seguro e exclusivo para contas importantes."
    },
    {
      name: "Perguntas de Segurança",
      importance: "recommended",
      description: "Respostas que só você sabe para recuperação de conta.",
      protects: ["Engenharia Social"],
      effectiveness: "20%",
      tips: "Use respostas falsas mas memoráveis. Não use informações públicas."
    },
    {
      name: "Email de Recuperação",
      importance: "recommended",
      description: "Email alternativo para recuperar acesso à conta.",
      protects: ["Sequestro de Conta"],
      effectiveness: "15%",
      tips: "Use um email diferente do principal e igualmente seguro."
    },
    {
      name: "Alertas de Login",
      importance: "recommended",
      description: "Notifica você sobre tentativas de acesso suspeitas.",
      protects: ["Phishing", "Engenharia Social", "Sequestro de Sessão"],
      effectiveness: "30%",
      tips: "Configure alertas por email e SMS para máxima segurança."
    },
    {
      name: "Dispositivos Confiáveis",
      importance: "optional",
      description: "Lista de dispositivos autorizados a acessar sua conta.",
      protects: ["Phishing", "Man-in-the-Middle"],
      effectiveness: "25%",
      tips: "Revise a lista regularmente e remova dispositivos antigos."
    },
    {
      name: "Gerenciamento de Sessão",
      importance: "optional",
      description: "Controla quantas sessões podem estar ativas simultaneamente.",
      protects: ["Sequestro de Sessão", "Força Bruta"],
      effectiveness: "20%",
      tips: "Limite o número de sessões e configure auto-logout."
    },
    {
      name: "Lista de IPs Permitidos",
      importance: "optional",
      description: "Restringe acesso apenas de endereços IP específicos.",
      protects: ["Força Bruta", "Credential Stuffing", "Acesso Não Autorizado"],
      effectiveness: "35%",
      tips: "Útil se você sempre acessa de locais fixos."
    },
    {
      name: "Cofre de Senhas",
      importance: "recommended",
      description: "Armazena senhas de forma segura e criptografada.",
      protects: ["Vazamento de Dados", "Reutilização de Senhas"],
      effectiveness: "15%",
      tips: "Use senhas únicas para cada site e serviço."
    },
  ];

  const attackGuide = [
    {
      attack: "Força Bruta",
      description: "Tentativas repetidas de adivinhar sua senha.",
      recommended: ["Senha Forte", "2FA", "Aplicativo Autenticador", "Lista de IPs"],
      essential: true,
      detection: "Múltiplas tentativas de login falhadas."
    },
    {
      attack: "Phishing",
      description: "Emails ou sites falsos tentando roubar suas credenciais.",
      recommended: ["2FA", "Aplicativo Autenticador", "Verificação de Email", "Alertas de Login"],
      essential: true,
      detection: "Emails suspeitos pedindo confirmação de dados."
    },
    {
      attack: "Engenharia Social",
      description: "Manipulação psicológica para revelar informações.",
      recommended: ["Perguntas de Segurança", "2FA", "Alertas de Login"],
      essential: true,
      detection: "Contatos suspeitos pedindo informações pessoais."
    },
    {
      attack: "Keylogger",
      description: "Software malicioso que registra tudo que você digita.",
      recommended: ["2FA", "Aplicativo Autenticador", "Gerenciamento de Sessão"],
      essential: true,
      detection: "Computador lento ou comportamento estranho."
    },
    {
      attack: "Vazamento de Dados",
      description: "Sua senha pode ter sido exposta em um vazamento.",
      recommended: ["Senha Forte", "2FA", "Aplicativo Autenticador"],
      essential: true,
      detection: "Alertas de serviços como Have I Been Pwned."
    },
    {
      attack: "Sequestro de Sessão",
      description: "Roubo do seu token de sessão ativa.",
      recommended: ["Gerenciamento de Sessão", "Alertas de Login", "2FA"],
      essential: false,
      detection: "Sessões ativas em locais desconhecidos."
    },
    {
      attack: "Man-in-the-Middle",
      description: "Interceptação da comunicação entre você e o servidor.",
      recommended: ["Dispositivos Confiáveis", "2FA", "Lista de IPs"],
      essential: false,
      detection: "Certificados SSL inválidos ou suspeitos."
    },
    {
      attack: "Credential Stuffing",
      description: "Uso de credenciais vazadas de outros sites.",
      recommended: ["Senha Forte", "2FA", "Lista de IPs", "Cofre de Senhas"],
      essential: false,
      detection: "Tentativas de login de locais incomuns."
    },
    {
      attack: "SIM Swap",
      description: "Clonagem do seu chip para interceptar SMS.",
      recommended: ["Aplicativo Autenticador", "Email de Recuperação"],
      essential: false,
      detection: "Perda de sinal do celular repentinamente."
    },
  ];

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "essential":
        return <Badge className="bg-red-500">Essencial</Badge>;
      case "recommended":
        return <Badge className="bg-yellow-500">Recomendado</Badge>;
      case "optional":
        return <Badge variant="outline">Opcional</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Guia de Proteções</CardTitle>
          </div>
          <CardDescription>
            Entenda cada medida de segurança e como ela protege você
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {protections.map((protection, index) => (
              <AccordionItem value={`protection-${index}`} key={index}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{protection.name}</span>
                        {getImportanceBadge(protection.importance)}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pl-1 pt-2">
                    <p className="text-sm text-muted-foreground">
                      {protection.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Protege contra:</p>
                          <p className="text-sm text-muted-foreground">
                            {protection.protects.join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Efetividade: {protection.effectiveness}</p>
                          <p className="text-sm text-muted-foreground">
                            {protection.tips}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

     
    </div>
  );
}

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { GameState, CreateAccountRequest, UpdateSecurityRequest } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Mail, Lock, Shield, CheckCircle2, AlertCircle, Key, Smartphone, Bell, Clock, Network, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  AuthenticatorAppModal, 
  SmsBackupModal, 
  TrustedDevicesModal, 
  LoginAlertsModal,
  SessionManagementModal,
  IpWhitelistModal 
} from "./security-modals";
import { StrongPasswordModal } from "./strong-password-modal";
import { SecurityQuestionModal } from "./security-question-modal";
import { RecoveryEmailModal } from "./recovery-email-modal";

interface SettingsAppProps {
  gameState: GameState;
}

export function SettingsApp({ gameState }: SettingsAppProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [openModal, setOpenModal] = useState<string | null>(null);

  const createAccountMutation = useMutation({
    mutationFn: (data: CreateAccountRequest) =>
      apiRequest<GameState>('POST', '/api/account/create', data),
    onSuccess: (newGameState) => {
      queryClient.setQueryData(['/api/game-state'], newGameState);
      toast({
        title: "Conta criada!",
        description: "Sua conta foi criada com sucesso. Agora ative medidas de segurança.",
      });
    },
  });

  const updateSecurityMutation = useMutation({
    mutationFn: (data: UpdateSecurityRequest) =>
      apiRequest<GameState>('POST', '/api/security/update', data),
    onSuccess: (newGameState) => {
      queryClient.setQueryData(['/api/game-state'], newGameState);
    },
  });

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.password) {
      createAccountMutation.mutate(formData);
    }
  };

  const handleSecurityToggle = (
    measure: keyof GameState['casualUser']['securityMeasures'],
    checked: boolean
  ) => {
    // Medidas que requerem confirmação via notificação
    if (checked && measure === 'twoFactorAuth') {
      // Chamar endpoint dedicado para 2FA
      apiRequest('POST', '/api/security/two-factor', {})
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
          toast({
            title: "Confirmação necessária",
            description: "Verifique a Central de Notificações para confirmar a ativação do 2FA",
            variant: "default",
          });
        });
      return;
    }
    
    if (checked && measure === 'emailVerification') {
      // Chamar endpoint dedicado para verificação de email
      apiRequest('POST', '/api/security/email-verification', {})
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
          toast({
            title: "Confirmação necessária",
            description: "Verifique a Central de Notificações para confirmar a verificação de email",
            variant: "default",
          });
        });
      return;
    }
    
    // Outras medidas usam o endpoint genérico
    updateSecurityMutation.mutate({ measure, enabled: checked });
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const securityMeasuresInfo = [
    {
      key: 'strongPassword' as const,
      icon: Lock,
      title: 'Senha Forte',
      description: 'Use uma senha longa com letras, números e símbolos',
      impact: 'Reduz em 10% a vulnerabilidade',
      hasModal: true,
      modalName: 'strongPassword',
    },
    {
      key: 'twoFactorAuth' as const,
      icon: Key,
      title: 'Autenticação de Dois Fatores (2FA)',
      description: 'Adiciona uma camada extra de segurança com código de verificação',
      impact: 'Reduz em 15% a vulnerabilidade',
      hasModal: false,
    },
    {
      key: 'emailVerification' as const,
      icon: Mail,
      title: 'Verificação de Email',
      description: 'Confirme que o email é seu antes de ativar a conta',
      impact: 'Reduz em 15% a vulnerabilidade',
      hasModal: false,
    },
    {
      key: 'securityQuestions' as const,
      icon: HelpCircle,
      title: 'Perguntas de Segurança',
      description: 'Perguntas secretas para recuperação de conta',
      impact: 'Reduz em 15% a vulnerabilidade',
      hasModal: true,
      modalName: 'securityQuestions',
    },
    {
      key: 'backupEmail' as const,
      icon: Mail,
      title: 'Email de Recuperação',
      description: 'Email alternativo para recuperar acesso',
      impact: 'Reduz em 15% a vulnerabilidade',
      hasModal: true,
      modalName: 'backupEmail',
    },
    {
      key: 'authenticatorApp' as const,
      icon: Smartphone,
      title: 'Aplicativo Autenticador',
      description: 'Use Google Authenticator ou Authy para gerar códigos',
      impact: 'Reduz em 35% a vulnerabilidade',
      hasModal: true,
      modalName: 'authenticatorApp',
    },
    {
      key: 'smsBackup' as const,
      icon: Smartphone,
      title: 'SMS Backup de Segurança',
      description: 'Receba códigos de verificação por mensagem de texto',
      impact: 'Reduz em 20% a vulnerabilidade',
      hasModal: true,
      modalName: 'smsBackup',
    },
    {
      key: 'trustedDevices' as const,
      icon: Shield,
      title: 'Dispositivos Confiáveis',
      description: 'Apenas dispositivos autorizados podem acessar sua conta',
      impact: 'Reduz em 25% a vulnerabilidade',
      hasModal: true,
      modalName: 'trustedDevices',
    },
    {
      key: 'loginAlerts' as const,
      icon: Bell,
      title: 'Alertas de Login',
      description: 'Seja notificado sobre atividades suspeitas na sua conta',
      impact: 'Reduz em 20% a vulnerabilidade',
      hasModal: true,
      modalName: 'loginAlerts',
    },
    {
      key: 'sessionManagement' as const,
      icon: Clock,
      title: 'Gerenciamento de Sessões',
      description: 'Controle sessões ativas e configure logout automático',
      impact: 'Reduz em 25% a vulnerabilidade',
      hasModal: true,
      modalName: 'sessionManagement',
    },
    {
      key: 'ipWhitelist' as const,
      icon: Network,
      title: 'Lista Branca de IPs',
      description: 'Restrinja o acesso apenas de IPs específicos',
      impact: 'Reduz em 30% a vulnerabilidade',
      hasModal: true,
      modalName: 'ipWhitelist',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="mt-2 text-muted-foreground">
          Gerencie sua conta e configure medidas de segurança
        </p>
      </div>

      <div className="space-y-4">
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Sua Conta</CardTitle>
                <CardDescription>
                  {gameState.casualUser.accountCreated ? "Conta configurada" : "Configure sua conta"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!gameState.casualUser.accountCreated ? (
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Digite seu nome"
                      className="pl-10"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Crie uma senha forte"
                      className="pl-10 font-mono"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  {formData.password && (
                    <div className="mt-2">
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-muted-foreground">Força da senha:</span>
                        <span
                          className={
                            passwordStrength >= 80
                              ? "text-user-safe"
                              : passwordStrength >= 50
                              ? "text-warning"
                              : "text-hacker-danger"
                          }
                        >
                          {passwordStrength >= 80 ? "Forte" : passwordStrength >= 50 ? "Média" : "Fraca"}
                        </span>
                      </div>
                      <Progress value={passwordStrength} className="h-1.5" />
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createAccountMutation.isPending}
                >
                  {createAccountMutation.isPending ? "Criando..." : "Criar Conta"}
                </Button>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-user-safe">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">Conta criada com sucesso!</span>
                </div>
                <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nome:</span>
                    <span className="font-medium">{gameState.casualUser.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{gameState.casualUser.email}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Medidas de Segurança</CardTitle>
                <CardDescription>
                  Ative todas as proteções para manter sua conta segura
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!gameState.casualUser.accountCreated ? (
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Crie uma conta primeiro para ativar medidas de segurança</span>
              </div>
            ) : (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {securityMeasuresInfo.map((measure) => {
                    const isActive = gameState.casualUser.securityMeasures[measure.key];
                    const Icon = measure.icon;
                    return (
                      <div 
                        key={measure.key} 
                        className={`flex items-center justify-between rounded-lg border-2 p-4 transition-all ${
                          isActive 
                            ? 'border-user-safe/30 bg-user-safe/5' 
                            : 'border-muted hover:border-primary/30 hover:bg-muted/50 hover-lift cursor-pointer'
                        }`}
                        onClick={() => {
                          if (measure.hasModal && measure.modalName) {
                            setOpenModal(measure.modalName);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`rounded-lg p-2 ${isActive ? 'bg-user-safe/20' : 'bg-primary/10'}`}>
                            <Icon className={`h-5 w-5 ${isActive ? 'text-user-safe' : 'text-primary'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium flex items-center gap-2">
                              {measure.title}
                              {isActive && <CheckCircle2 className="h-4 w-4 text-user-safe" />}
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">{measure.description}</div>
                            <div className="mt-1 text-xs font-medium text-primary">{measure.impact}</div>
                          </div>
                        </div>
                        {measure.hasModal ? (
                          <Button
                            variant={isActive ? "outline" : "default"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenModal(measure.modalName!);
                            }}
                          >
                            {isActive ? "Reconfigurar" : "Configurar"}
                          </Button>
                        ) : (
                          <Button
                            variant={isActive ? "outline" : "default"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSecurityToggle(measure.key, !isActive);
                            }}
                            disabled={updateSecurityMutation.isPending}
                          >
                            {isActive ? "Desativar" : "Ativar"}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      <AuthenticatorAppModal 
        open={openModal === 'authenticatorApp'} 
        onOpenChange={(open) => !open && setOpenModal(null)} 
      />
      <SmsBackupModal 
        open={openModal === 'smsBackup'} 
        onOpenChange={(open) => !open && setOpenModal(null)} 
      />
      <TrustedDevicesModal 
        open={openModal === 'trustedDevices'} 
        onOpenChange={(open) => !open && setOpenModal(null)} 
      />
      <LoginAlertsModal 
        open={openModal === 'loginAlerts'} 
        onOpenChange={(open) => !open && setOpenModal(null)} 
      />
      <SessionManagementModal 
        open={openModal === 'sessionManagement'} 
        onOpenChange={(open) => !open && setOpenModal(null)} 
      />
      <IpWhitelistModal 
        open={openModal === 'ipWhitelist'} 
        onOpenChange={(open) => !open && setOpenModal(null)} 
      />
      <StrongPasswordModal 
        open={openModal === 'strongPassword'} 
        onOpenChange={(open) => !open && setOpenModal(null)} 
      />
      <SecurityQuestionModal 
        open={openModal === 'securityQuestions'} 
        onOpenChange={(open) => !open && setOpenModal(null)} 
      />
      <RecoveryEmailModal 
        open={openModal === 'backupEmail'} 
        onOpenChange={(open) => !open && setOpenModal(null)} 
      />
    </div>
  );
}

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ConfigureSecurityRequest } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, Mail, Shield, Bell, Clock, Network, Copy, CheckCircle2 } from "lucide-react";

interface SecurityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Formata número de telefone para (XX) XXXXX-XXXX
function formatPhoneNumber(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length === 0) return '';
  if (numbers.length <= 2) return `(${numbers}`;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

// Formata endereço IP para XXX.XXX.XXX.XXX
function formatIPAddress(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length === 0) return '';
  
  let formatted = '';
  for (let i = 0; i < numbers.length && i < 12; i++) {
    if (i > 0 && i % 3 === 0) formatted += '.';
    formatted += numbers[i];
  }
  
  // Validar segmentos de IP (máx 3 dígitos e máx 255)
  const parts = formatted.split('.');
  const validParts = parts.map((part, idx) => {
    if (idx < 3) {
      const num = parseInt(part) || 0;
      return Math.min(255, num).toString();
    }
    return part;
  });
  
  return validParts.join('.');
}

export function AuthenticatorAppModal({ open, onOpenChange }: SecurityModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [secret] = useState("JBSWY3DPEHPK3PXP");
  const [verificationCode, setVerificationCode] = useState("");
  const [recoveryCodes] = useState([
    "AHJD-9283", "BJKD-8374", "CKLD-7465", "DLMD-6556",
    "EMND-5647", "FNOD-4738", "GOPD-3829", "HPQD-2910"
  ]);

  const configureMutation = useMutation({
    mutationFn: (data: ConfigureSecurityRequest) =>
      apiRequest('POST', '/api/security/configure', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
      toast({
        title: "Authenticator configurado!",
        description: "Seu aplicativo autenticador foi configurado com sucesso.",
      });
      onOpenChange(false);
      setStep(1);
      setVerificationCode("");
    },
  });

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    toast({ title: "Copiado!", description: "Chave secreta copiada para a área de transferência" });
  };

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      setStep(3);
    }
  };

  const handleComplete = () => {
    configureMutation.mutate({
      measure: 'authenticatorApp',
      config: { secret, recoveryCodes }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Configurar Aplicativo Autenticador
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Use um app como Google Authenticator ou Authy"}
            {step === 2 && "Digite o código de 6 dígitos do aplicativo"}
            {step === 3 && "Salve seus códigos de recuperação"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 1 && (
            <>
              <div className="rounded-lg bg-muted p-4">
                <p className="mb-2 text-sm font-medium">Escaneie este código QR:</p>
                <div className="flex h-32 items-center justify-center rounded border-2 border-dashed">
                  <span className="text-xs text-muted-foreground">[QR Code simulado]</span>
                </div>
              </div>
              <div>
                <Label>Ou digite esta chave manualmente:</Label>
                <div className="mt-2 flex gap-2">
                  <Input value={secret} readOnly className="font-mono text-sm" />
                  <Button variant="outline" size="icon" onClick={handleCopySecret}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button className="w-full" onClick={() => setStep(2)}>
                Avançar
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <Label htmlFor="code">Código de verificação (6 dígitos)</Label>
                <Input
                  id="code"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="mt-2 text-center font-mono text-lg tracking-widest"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Voltar
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={verificationCode.length !== 6}
                  className="flex-1"
                >
                  Verificar
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="rounded-lg bg-warning/10 border-2 border-warning p-4">
                <p className="mb-3 text-sm font-medium">
                  Códigos de Recuperação - Guarde em local seguro!
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {recoveryCodes.map((code, i) => (
                    <div key={i} className="rounded bg-background p-2 text-center font-mono text-sm">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
              <Button className="w-full" onClick={handleComplete}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Concluir Configuração
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SmsBackupModal({ open, onOpenChange }: SecurityModalProps) {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState(1);

  const configureMutation = useMutation({
    mutationFn: (data: ConfigureSecurityRequest) =>
      apiRequest('POST', '/api/security/configure', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
      toast({
        title: "SMS Backup configurado!",
        description: "Número de telefone verificado com sucesso.",
      });
      onOpenChange(false);
      setStep(1);
      setPhoneNumber("");
      setVerificationCode("");
    },
  });

  const handleSendCode = () => {
    if (phoneNumber.length >= 10) {
      setStep(2);
      toast({
        title: "Código enviado!",
        description: `Código de verificação enviado para ${phoneNumber}`,
      });
    }
  };

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      configureMutation.mutate({
        measure: 'smsBackup',
        config: { phoneNumber, verified: true }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            SMS Backup de Segurança
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "Adicione um número de telefone para recuperação"
              : "Digite o código enviado por SMS"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <Label htmlFor="phone">Número de telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  className="mt-2"
                  value={formatPhoneNumber(phoneNumber)}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Usaremos este número para enviar códigos de verificação
                </p>
              </div>
              <Button
                className="w-full"
                onClick={handleSendCode}
                disabled={phoneNumber.length < 10}
              >
                Enviar Código de Verificação
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <Label htmlFor="sms-code">Código de verificação SMS</Label>
                <Input
                  id="sms-code"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="mt-2 text-center font-mono text-lg tracking-widest"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Voltar
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={verificationCode.length !== 6}
                  className="flex-1"
                >
                  Verificar e Salvar
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TrustedDevicesModal({ open, onOpenChange }: SecurityModalProps) {
  const { toast } = useToast();
  const [deviceName, setDeviceName] = useState("");
  const [devices, setDevices] = useState([
    { id: "1", name: "Chrome no Windows", fingerprint: "abc123", addedAt: Date.now() - 86400000 },
  ]);

  const configureMutation = useMutation({
    mutationFn: (data: ConfigureSecurityRequest) =>
      apiRequest('POST', '/api/security/configure', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
      toast({
        title: "Dispositivos Confiáveis configurado!",
        description: "Suas configurações foram salvas.",
      });
    },
  });

  const handleAddDevice = () => {
    if (deviceName.trim()) {
      const newDevice = {
        id: Date.now().toString(),
        name: deviceName,
        fingerprint: Math.random().toString(36).substring(7),
        addedAt: Date.now(),
      };
      const updatedDevices = [...devices, newDevice];
      setDevices(updatedDevices);
      configureMutation.mutate({
        measure: 'trustedDevices',
        config: { devices: updatedDevices }
      });
      setDeviceName("");
    }
  };

  const handleRemoveDevice = (id: string) => {
    const updatedDevices = devices.filter(d => d.id !== id);
    setDevices(updatedDevices);
    configureMutation.mutate({
      measure: 'trustedDevices',
      config: { devices: updatedDevices }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Dispositivos Confiáveis
          </DialogTitle>
          <DialogDescription>
            Gerencie os dispositivos autorizados a acessar sua conta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="device-name">Adicionar dispositivo atual</Label>
            <div className="mt-2 flex gap-2">
              <Input
                id="device-name"
                placeholder="Ex: iPhone de casa"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
              />
              <Button onClick={handleAddDevice} disabled={!deviceName.trim()}>
                Adicionar
              </Button>
            </div>
          </div>

          <div>
            <Label>Dispositivos confiáveis ({devices.length})</Label>
            <div className="mt-2 space-y-2">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{device.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Adicionado {new Date(device.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDevice(device.id)}
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function LoginAlertsModal({ open, onOpenChange }: SecurityModalProps) {
  const { toast } = useToast();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [newLocationAlerts, setNewLocationAlerts] = useState(true);

  const configureMutation = useMutation({
    mutationFn: (data: ConfigureSecurityRequest) =>
      apiRequest('POST', '/api/security/configure', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
      toast({
        title: "Alertas de Login configurados!",
        description: "Suas preferências de notificação foram salvas.",
      });
      onOpenChange(false);
    },
  });

  const handleSave = () => {
    configureMutation.mutate({
      measure: 'loginAlerts',
      config: { emailAlerts, smsAlerts, newLocationAlerts }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas de Login
          </DialogTitle>
          <DialogDescription>
            Receba notificações quando alguém acessar sua conta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex-1">
              <div className="font-medium">Alertas por Email</div>
              <div className="text-sm text-muted-foreground">
                Receba email quando houver novo login
              </div>
            </div>
            <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex-1">
              <div className="font-medium">Alertas por SMS</div>
              <div className="text-sm text-muted-foreground">
                Receba SMS em logins suspeitos
              </div>
            </div>
            <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex-1">
              <div className="font-medium">Novos Locais</div>
              <div className="text-sm text-muted-foreground">
                Notifique-me sobre logins de novos locais
              </div>
            </div>
            <Switch checked={newLocationAlerts} onCheckedChange={setNewLocationAlerts} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Configurações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SessionManagementModal({ open, onOpenChange }: SecurityModalProps) {
  const { toast } = useToast();
  const [maxSessions, setMaxSessions] = useState(3);
  const [autoLogoutMinutes, setAutoLogoutMinutes] = useState(30);
  const [activeSessions, setActiveSessions] = useState([
    { id: "1", deviceName: "Chrome Windows", location: "Belo Horizonte, MG", lastActive: Date.now() },
    { id: "2", deviceName: "Safari iPhone", location: "Belo Horizonte, MG", lastActive: Date.now() - 3600000 },
  ]);

  const configureMutation = useMutation({
    mutationFn: (data: ConfigureSecurityRequest) =>
      apiRequest('POST', '/api/security/configure', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
      toast({
        title: "Gerenciamento de Sessões configurado!",
        description: "Suas configurações foram salvas.",
      });
      onOpenChange(false);
    },
  });

  const handleEndSession = (sessionId: string) => {
    const session = activeSessions.find(s => s.id === sessionId);
    setActiveSessions(activeSessions.filter(s => s.id !== sessionId));
    toast({
      title: "Sessão encerrada!",
      description: `A sessão ${session?.deviceName} foi encerrada com sucesso.`,
    });
  };

  const handleSave = () => {
    configureMutation.mutate({
      measure: 'sessionManagement',
      config: { maxSessions, autoLogoutMinutes, activeSessions }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Gerenciamento de Sessões
          </DialogTitle>
          <DialogDescription>
            Controle quando e onde sua conta pode ser acessada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="max-sessions">Máximo de sessões simultâneas</Label>
            <Input
              id="max-sessions"
              type="number"
              min={1}
              max={10}
              className="mt-2"
              value={maxSessions}
              onChange={(e) => setMaxSessions(parseInt(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="auto-logout">Logout automático (minutos de inatividade)</Label>
            <Input
              id="auto-logout"
              type="number"
              min={5}
              max={120}
              className="mt-2"
              value={autoLogoutMinutes}
              onChange={(e) => setAutoLogoutMinutes(parseInt(e.target.value))}
            />
          </div>

          <div>
            <Label>Sessões ativas ({activeSessions.length})</Label>
            <div className="mt-2 space-y-2">
              {activeSessions.map((session) => (
                <div key={session.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{session.deviceName}</p>
                      <p className="text-xs text-muted-foreground">{session.location}</p>
                      <p className="text-xs text-muted-foreground">
                        Ativo há {Math.round((Date.now() - session.lastActive) / 60000)}min
                      </p>
                    </div>
                   <Button variant="ghost" size="sm" onClick={() => handleEndSession(session.id)}>Encerrar</Button>  
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Configurações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function IpWhitelistModal({ open, onOpenChange }: SecurityModalProps) {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [newIp, setNewIp] = useState("");
  const [allowedIPs, setAllowedIPs] = useState(["192.168.1.100", "203.0.113.45"]);

  const configureMutation = useMutation({
    mutationFn: (data: ConfigureSecurityRequest) =>
      apiRequest('POST', '/api/security/configure', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
      toast({
        title: "Lista de IPs configurada!",
        description: "Suas configurações foram salvas.",
      });
      onOpenChange(false);
    },
  });

  const handleAddIp = () => {
    if (newIp.trim()) {
      const updatedIPs = [...allowedIPs, newIp];
      setAllowedIPs(updatedIPs);
      setNewIp("");
      toast({ title: "IP adicionado!", description: `${newIp} foi adicionado à lista` });
    }
  };

  const handleRemoveIp = (ip: string) => {
    setAllowedIPs(allowedIPs.filter(i => i !== ip));
  };

  const handleSave = () => {
    configureMutation.mutate({
      measure: 'ipWhitelist',
      config: { enabled, allowedIPs }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Lista Branca de IPs
          </DialogTitle>
          <DialogDescription>
            Restrinja o acesso apenas de endereços IP específicos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex-1">
              <div className="font-medium">Ativar restrição por IP</div>
              <div className="text-sm text-muted-foreground">
                Apenas IPs listados poderão acessar
              </div>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {enabled && (
            <>
              <div>
                <Label htmlFor="new-ip">Adicionar endereço IP</Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    id="new-ip"
                    placeholder="192.168.1.1"
                    value={formatIPAddress(newIp)}
                    onChange={(e) => setNewIp(e.target.value.replace(/\D/g, ''))}
                  />
                  <Button onClick={handleAddIp} disabled={!newIp.trim()}>
                    Adicionar
                  </Button>
                </div>
              </div>

              <div>
                <Label>IPs permitidos ({allowedIPs.length})</Label>
                <div className="mt-2 space-y-2">
                  {allowedIPs.map((ip) => (
                    <div
                      key={ip}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <code className="font-mono text-sm">{ip}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveIp(ip)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Configurações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

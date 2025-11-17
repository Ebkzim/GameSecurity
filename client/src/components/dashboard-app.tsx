import type { GameState } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, ShieldAlert, ShieldCheck, Key, Settings, 
  Bell, User, Mail, Lock, AlertTriangle, Activity  
} from "lucide-react";

interface DashboardAppProps {
  gameState: GameState;
  onNavigate: (view: "home" | "settings" | "notifications" | "passwords" | "activities") => void;
}

export function DashboardApp({ gameState, onNavigate }: DashboardAppProps) {
  const activeMeasures = Object.values(gameState.casualUser.securityMeasures).filter(Boolean).length;
  const totalMeasures = Object.keys(gameState.casualUser.securityMeasures).length;
  const securityScore = Math.max(0, 100 - gameState.vulnerabilityScore);
  
  const unreadNotifications = gameState.notifications.filter(n => n.isActive).length;
  const savedPasswords = gameState.casualUser.passwordVault.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bem-vindo, {gameState.casualUser.name || "Usuário"}!</h1>
        <p className="mt-2 text-muted-foreground">
          Gerencie sua segurança digital e proteja sua conta contra ataques
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className={gameState.casualUser.accountCompromised ? "border-destructive" : ""}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Status da Conta</CardTitle>
              {gameState.casualUser.accountCompromised ? (
                <ShieldAlert className="h-4 w-4 text-destructive" />
              ) : (
                <ShieldCheck className="h-4 w-4 text-user-safe" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {gameState.casualUser.accountCompromised ? (
              <div className="space-y-2">
                <div className="text-2xl font-bold text-destructive">Comprometida</div>
                <p className="text-xs text-muted-foreground">
                  Sua conta foi invadida! Veja as lições aprendidas.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold text-user-safe">Segura</div>
                <p className="text-xs text-muted-foreground">
                  Continue ativando medidas de segurança
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Nível de Segurança</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{securityScore}%</div>
            <Progress value={securityScore} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {activeMeasures} de {totalMeasures} medidas ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Ataques</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{gameState.hacker.attacksSuccessful}</span>
              <span className="text-sm text-muted-foreground">de {gameState.hacker.attacksAttempted}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Ataques bem-sucedidos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="cursor-pointer transition-all hover:shadow-md" onClick={() => onNavigate("settings")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Configurações de Segurança</CardTitle>
                <CardDescription>Ative medidas de proteção</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{activeMeasures}/{totalMeasures} ativas</span>
              <Button variant="ghost" size="sm">
                Abrir →
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-md" onClick={() => onNavigate("notifications")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Bell className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">Notificações</CardTitle>
                <CardDescription>Alertas e avisos de segurança</CardDescription>
              </div>
              {unreadNotifications > 0 && (
                <Badge variant="destructive">{unreadNotifications}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {unreadNotifications} não lida{unreadNotifications !== 1 ? "s" : ""}
              </span>
              <Button variant="ghost" size="sm">
                Ver todas →
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-md" onClick={() => onNavigate("passwords")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Key className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-base">Cofre de Senhas</CardTitle>
                <CardDescription>Gerador e armazenamento seguro</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{savedPasswords} senha{savedPasswords !== 1 ? "s" : ""} salva{savedPasswords !== 1 ? "s" : ""}</span>
              <Button variant="ghost" size="sm">
                Abrir →
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
  className="cursor-pointer transition-all hover:shadow-md"
  onClick={() => onNavigate("activities")}
>
  <CardHeader>
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
        <Activity className="h-5 w-5 text-purple-500" />
      </div>
      <div>
        <CardTitle className="text-base">Log de atividades</CardTitle>
        <CardDescription>Histórico de ações e eventos da sua conta</CardDescription>
      </div>
    </div>
  </CardHeader>

  <CardContent>
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">
        {gameState.activityLog.length} atividade
        {gameState.activityLog.length !== 1 ? "s" : ""} registrada
      </span>

      <Button variant="ghost" size="sm">
        Ver log →
      </Button>
    </div>
  </CardContent>
</Card>

        {!gameState.casualUser.accountCreated && (
          <Card className="border-dashed">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <User className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Criar Conta</CardTitle>
                  <CardDescription>Configure seu perfil e senha</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => onNavigate("settings")}>
                Começar →
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {gameState.casualUser.accountCreated && (
        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{gameState.casualUser.name}</div>
                <div className="text-xs text-muted-foreground">Nome completo</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{gameState.casualUser.email}</div>
                <div className="text-xs text-muted-foreground">Email</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium font-mono">••••••••</div>
                <div className="text-xs text-muted-foreground">Senha</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

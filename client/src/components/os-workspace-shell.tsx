import { useState, useEffect } from "react";
import type { GameState } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, Settings, Bell, Key, Shield, User, 
  Clock, Wifi, Battery, Volume2 
} from "lucide-react";
import { DashboardApp } from "@/components/dashboard-app";
import { SettingsApp } from "@/components/settings-app";
import { NotificationsCenter } from "@/components/notifications-center";
import { PasswordStudio } from "@/components/password-studio";

interface OSWorkspaceShellProps {
  gameState: GameState;
}

type AppView = "home" | "settings" | "notifications" | "passwords";

export function OSWorkspaceShell({ gameState }: OSWorkspaceShellProps) {
  const [currentApp, setCurrentApp] = useState<AppView>("settings");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (gameState.casualUser.accountCreated && currentApp === "settings") {
      setCurrentApp("home");
    }
  }, [gameState.casualUser.accountCreated]);

  const unreadNotifications = gameState.notifications.filter(n => n.isActive).length;
  
  const apps = [
    { id: "home" as AppView, icon: Home, label: "Início", color: "text-blue-500", requiresAccount: true },
    { id: "settings" as AppView, icon: Settings, label: "Configurações", color: "text-gray-500", requiresAccount: false },
    { id: "passwords" as AppView, icon: Key, label: "Senhas", color: "text-purple-500", requiresAccount: true },
    { id: "notifications" as AppView, icon: Bell, label: "Notificações", color: "text-amber-500", badge: unreadNotifications, requiresAccount: true },
  ];

  const renderApp = () => {
    if (!gameState.casualUser.accountCreated) {
      return <SettingsApp gameState={gameState} />;
    }
    
    switch (currentApp) {
      case "home":
        return <DashboardApp gameState={gameState} onNavigate={setCurrentApp} />;
      case "settings":
        return <SettingsApp gameState={gameState} />;
      case "notifications":
        return <NotificationsCenter gameState={gameState} />;
      case "passwords":
        return <PasswordStudio gameState={gameState} />;
      default:
        return <DashboardApp gameState={gameState} onNavigate={setCurrentApp} />;
    }
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex items-center justify-between border-b bg-white/80 px-6 py-2 backdrop-blur dark:bg-slate-900/80">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-user-safe">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="text-sm">
              <div className="font-semibold">{gameState.casualUser.name || "Usuário"}</div>
              <div className="text-xs text-muted-foreground">{gameState.casualUser.email || "Não conectado"}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wifi className="h-4 w-4" />
            <Battery className="h-4 w-4" />
            <Volume2 className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono">{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-20 flex-col items-center gap-2 border-r bg-white/50 py-6 backdrop-blur dark:bg-slate-900/50">
          {apps.map((app) => {
            const Icon = app.icon;
            const isActive = currentApp === app.id;
            const isDisabled = app.requiresAccount && !gameState.casualUser.accountCreated;
            return (
              <button
                key={app.id}
                onClick={() => !isDisabled && setCurrentApp(app.id)}
                disabled={isDisabled}
                className={`relative flex h-14 w-14 flex-col items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : isDisabled
                    ? "text-muted-foreground/30 cursor-not-allowed"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                title={isDisabled ? "Crie uma conta primeiro" : app.label}
              >
                <Icon className={`h-6 w-6 ${isActive ? app.color : ""}`} />
                {app.badge && app.badge > 0 && !isDisabled && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -right-1 -top-1 h-5 min-w-[1.25rem] px-1 text-xs"
                  >
                    {app.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-5xl">
            {renderApp()}
          </div>
        </div>
      </div>

      <div className="border-t bg-white/80 px-6 py-2 backdrop-blur dark:bg-slate-900/80">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Sistema de Segurança v1.0</span>
            <span className="flex items-center gap-1">
              Vulnerabilidade: 
              <Badge 
                variant={gameState.vulnerabilityScore < 30 ? "default" : gameState.vulnerabilityScore < 70 ? "secondary" : "destructive"}
                className="ml-1"
              >
                {gameState.vulnerabilityScore}%
              </Badge>
            </span>
          </div>
          <span>{currentTime.toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
}

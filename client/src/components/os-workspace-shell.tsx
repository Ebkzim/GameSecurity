import { useState, useEffect } from "react";
import type { GameState } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { 
  Home, Settings, Bell, Key, Shield, Menu, Activity
} from "lucide-react";
import { DashboardApp } from "@/components/dashboard-app";
import { SettingsApp } from "@/components/settings-app";
import { NotificationsCenter } from "@/components/notifications-center";
import { PasswordStudio } from "@/components/password-studio";
import { ActivityLog } from "@/components/activity-log";

interface OSWorkspaceShellProps {
  gameState: GameState;
}

type AppView = "home" | "settings" | "notifications" | "passwords" | "activities";

export function OSWorkspaceShell({ gameState }: OSWorkspaceShellProps) {
  const [currentApp, setCurrentApp] = useState<AppView>("settings");

  useEffect(() => {
    if (gameState.casualUser.accountCreated && currentApp === "settings") {
      setCurrentApp("home");
    }
  }, [gameState.casualUser.accountCreated]);

  const unreadNotifications = gameState.notifications.filter(n => n.isActive).length;
  
  const apps = [
    { id: "home" as AppView, icon: Home, label: "Início", color: "text-blue-500", requiresAccount: true },
    { id: "activities" as AppView, icon: Activity, label: "Atividades", color: "text-green-500", requiresAccount: true },
    { id: "passwords" as AppView, icon: Key, label: "Senhas", color: "text-purple-500", requiresAccount: true },
    { id: "notifications" as AppView, icon: Bell, label: "Notificações", color: "text-amber-500", badge: unreadNotifications, requiresAccount: true },
    { id: "settings" as AppView, icon: Settings, label: "Configurações", color: "text-gray-500", requiresAccount: false },
  ];

  const renderApp = () => {
    if (!gameState.casualUser.accountCreated) {
      return <SettingsApp gameState={gameState} />;
    }
    
    switch (currentApp) {
      case "home":
        return <DashboardApp gameState={gameState} onNavigate={setCurrentApp} />;
      case "activities":
        return <ActivityLog gameState={gameState} />;
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
    <div className="flex h-full flex-col bg-white dark:bg-slate-900">
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-3 bg-white dark:bg-slate-900 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">{gameState.casualUser.name || "Usuário"}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{gameState.casualUser.email || "Não conectado"}</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {apps.filter(app => app.requiresAccount && !gameState.casualUser.accountCreated ? false : true).map((app) => {
            const Icon = app.icon;
            const isActive = currentApp === app.id;
            const isDisabled = app.requiresAccount && !gameState.casualUser.accountCreated;
            return (
              <button
                key={app.id}
                onClick={() => !isDisabled && setCurrentApp(app.id)}
                disabled={isDisabled}
                className={`relative p-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : isDisabled
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
                }`}
                title={isDisabled ? "Crie uma conta primeiro" : app.label}
              >
                <Icon className="h-5 w-5" />
                {app.badge && app.badge > 0 && !isDisabled && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                    {app.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden bg-gray-50 dark:bg-slate-800">
        <div className="flex-1 overflow-auto p-8">
          <div className="mx-auto max-w-6xl">
            {renderApp()}
          </div>
        </div>
      </div>
    </div>
  );
}

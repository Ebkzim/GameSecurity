import { useState, useEffect } from "react";
import type { GameState } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { 
  Home, Settings, Bell, Key, Shield, Menu, Activity, BookOpen
} from "lucide-react";
import { DashboardApp } from "@/components/dashboard-app";
import { SettingsApp } from "@/components/settings-app";
import { NotificationsCenter } from "@/components/notifications-center";
import { PasswordStudio } from "@/components/password-studio";
import { ActivityLog } from "@/components/activity-log";
import { UserHelpGuide } from "@/components/user-help-guide";

interface OSWorkspaceShellProps {
  gameState: GameState;
}

type AppView = "home" | "settings" | "notifications" | "passwords" | "activities" | "help";

export function OSWorkspaceShell({ gameState }: OSWorkspaceShellProps) {
  const accountCreated = gameState.casualUser.accountCreated;
  const [currentApp, setCurrentApp] = useState<AppView>(accountCreated ? "home" : "settings");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (accountCreated && currentApp === "settings") {
      setCurrentApp("home");
    }
  }, [accountCreated]);

  const unreadNotifications = gameState.notifications.filter(n => n.isActive).length;
  
  const apps = [
    { id: "home" as AppView, icon: Home, label: "Início", color: "text-blue-500", requiresAccount: true },
    { id: "activities" as AppView, icon: Activity, label: "Atividades", color: "text-green-500", requiresAccount: true },
    { id: "passwords" as AppView, icon: Key, label: "Senhas", color: "text-purple-500", requiresAccount: true },
    { id: "notifications" as AppView, icon: Bell, label: "Notificações", color: "text-amber-500", badge: unreadNotifications, requiresAccount: true },
    { id: "help" as AppView, icon: BookOpen, label: "Guia de Ajuda", color: "text-indigo-500", requiresAccount: false },
    { id: "settings" as AppView, icon: Settings, label: "Configurações", color: "text-gray-500", requiresAccount: false },
  ];

  const renderApp = () => {
    if (!accountCreated) {
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
      case "help":
        return <UserHelpGuide />;
      default:
        return <DashboardApp gameState={gameState} onNavigate={setCurrentApp} />;
    }
  };

  const handleAppChange = (appId: AppView) => {
    setCurrentApp(appId);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-full bg-white dark:bg-slate-900 overflow-hidden">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 dark:text-white truncate">
                {gameState.casualUser.name || "Usuário"}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {gameState.casualUser.email || "Não conectado"}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {apps.filter(app => !app.requiresAccount || gameState.casualUser.accountCreated).map((app) => {
            const Icon = app.icon;
            const isActive = currentApp === app.id;
            const isDisabled = app.requiresAccount && !gameState.casualUser.accountCreated;
            
            return (
              <button
                key={app.id}
                onClick={() => !isDisabled && handleAppChange(app.id)}
                disabled={isDisabled}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150
                  ${isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm'
                    : isDisabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }
                `}
                title={isDisabled ? "Crie uma conta primeiro" : app.label}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {app.badge && app.badge > 0 && !isDisabled && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                      {app.badge}
                    </span>
                  )}
                </div>
                <span>{app.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-200 dark:border-slate-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Jogo Educacional de Segurança
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-white dark:bg-slate-900 dark:border-slate-700 lg:px-6">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex-1 lg:flex-none">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {apps.find(app => app.id === currentApp)?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={gameState.casualUser.accountCompromised ? "destructive" : "default"}>
              Segurança: {Math.max(0, 100 - gameState.vulnerabilityScore)}%
            </Badge>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-800">
          <div className="p-4 lg:p-6 xl:p-8">
            <div className="mx-auto max-w-7xl">
              {renderApp()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

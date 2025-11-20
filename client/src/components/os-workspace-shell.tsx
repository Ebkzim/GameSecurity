import { useState, useEffect } from "react";
import type { GameState } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { 
  Home, Settings, Bell, Key, Shield, Menu, Activity, BookOpen, MoreHorizontal, X
} from "lucide-react";
import { DashboardApp } from "@/components/dashboard-app";
import { SettingsApp } from "@/components/settings-app";
import { NotificationsCenter } from "@/components/notifications-center";
import { PasswordStudio } from "@/components/password-studio";
import { ActivityLog } from "@/components/activity-log";
import { UserHelpGuide } from "@/components/user-help-guide";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OSWorkspaceShellProps {
  gameState: GameState;
}

type AppView = "home" | "settings" | "notifications" | "passwords" | "activities" | "help";

export function OSWorkspaceShell({ gameState }: OSWorkspaceShellProps) {
  const accountCreated = gameState.casualUser.accountCreated;
  const [currentApp, setCurrentApp] = useState<AppView>(accountCreated ? "home" : "settings");

  useEffect(() => {
    if (accountCreated && currentApp === "settings") {
      setCurrentApp("home");
    }
  }, [accountCreated]);

  const unreadNotifications = gameState.notifications.filter(n => n.isActive).length;

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
  };

  if (!accountCreated) {
    return (
      <div className="flex h-full bg-white dark:bg-slate-900 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-800">
            <div className="p-4 lg:p-6 xl:p-8">
              <div className="mx-auto max-w-7xl">
                <SettingsApp gameState={gameState} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900 overflow-hidden">
      {/* Navbar Horizontal Superior */}
      <header className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm z-10">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Nome do Usuário à Esquerda */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {gameState.casualUser.name || "Usuário"}
            </span>
          </div>

          {/* Navegação Principal à Direita - Visível no Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleAppChange("home")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentApp === "home"
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Início</span>
            </button>

            <button
              onClick={() => handleAppChange("settings")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentApp === "settings"
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </button>

            <button
              onClick={() => handleAppChange("notifications")}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentApp === "notifications"
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bell className="h-4 w-4" />
              <span>Notificações</span>
              {unreadNotifications > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Menu de Mais Opções */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                  <span>Mais</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleAppChange("activities")}>
                  <Activity className="h-4 w-4 mr-2" />
                  Log de Atividades
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAppChange("help")}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Guia de Ajuda
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAppChange("passwords")}>
                  <Key className="h-4 w-4 mr-2" />
                  Gerador de Senhas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Navegação Mobile */}
          <nav className="md:hidden flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                  <Menu className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleAppChange("home")}>
                  <Home className="h-4 w-4 mr-2" />
                  Início
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAppChange("settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAppChange("notifications")}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Bell className="h-4 w-4 mr-2" />
                      Notificações
                    </div>
                    {unreadNotifications > 0 && (
                      <Badge variant="destructive" className="ml-2">{unreadNotifications}</Badge>
                    )}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAppChange("activities")}>
                  <Activity className="h-4 w-4 mr-2" />
                  Log de Atividades
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAppChange("help")}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Guia de Ajuda
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAppChange("passwords")}>
                  <Key className="h-4 w-4 mr-2" />
                  Gerador de Senhas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-800">
        <div className="p-4 lg:p-6 xl:p-8 h-full overflow-auto">
          <div className="mx-auto max-w-7xl">
            {renderApp()}
          </div>
        </div>
      </div>
    </div>
  );
}

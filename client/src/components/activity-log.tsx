import type { GameState } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, User, Terminal, Shield, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ActivityLogProps {
  gameState: GameState;
}

export function ActivityLog({ gameState }: ActivityLogProps) {
  const getActorInfo = (actor: 'user' | 'hacker' | 'system') => {
    switch (actor) {
      case 'user':
        return { icon: User, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Você' };
      case 'hacker':
        return { icon: Terminal, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Hacker' };
      case 'system':
        return { icon: Shield, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', label: 'Sistema' };
    }
  };

  const sortedActivities = [...gameState.activityLog].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>Log de Atividades</CardTitle>
          </div>
          <CardDescription>
            Histórico completo de ações e eventos da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedActivities.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Activity className="mx-auto mb-3 h-12 w-12 opacity-20" />
              <p>Nenhuma atividade registrada ainda</p>
              <p className="text-sm">Comece usando o sistema para ver suas atividades aqui</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {sortedActivities.map((activity) => {
                  const actorInfo = getActorInfo(activity.actor);
                  const ActorIcon = actorInfo.icon;
                  
                  return (
                    <div
                      key={activity.id}
                      className="flex gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
                    >
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${actorInfo.bg}`}>
                        <ActorIcon className={`h-5 w-5 ${actorInfo.color}`} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{activity.action}</p>
                              <Badge variant="outline" className="text-xs">
                                {actorInfo.label}
                              </Badge>
                            </div>
                            {activity.detail && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {activity.detail}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(activity.timestamp, { 
                              addSuffix: true,
                              locale: ptBR 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estatísticas de Atividade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {sortedActivities.filter(a => a.actor === 'user').length}
              </div>
              <div className="text-xs text-muted-foreground">Ações do Usuário</div>
            </div>
            <div className="rounded-lg border bg-red-50 p-4 dark:bg-red-900/20">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {sortedActivities.filter(a => a.actor === 'hacker').length}
              </div>
              <div className="text-xs text-muted-foreground">Ataques Registrados</div>
            </div>
            <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-900/20">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {sortedActivities.filter(a => a.actor === 'system').length}
              </div>
              <div className="text-xs text-muted-foreground">Alertas do Sistema</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

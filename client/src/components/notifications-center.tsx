/**
 * Central de Notificações
 * 
 * Gerencia e exibe todas as notificações do jogo, incluindo:
 * - Notificações normais (aceitar/recusar)
 * - Chatbot de Engenharia Social (renderizado inline)
 * - Página de Login Falsa de Phishing (modal overlay)
 * - Confirmações de segurança (2FA, email, etc)
 */

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { GameState, RespondToNotificationRequest } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SocialEngineeringChat } from "@/components/social-engineering-chat";
import { FakeLoginPage } from "@/components/fake-login-page";

interface NotificationsCenterProps {
  gameState: GameState;
}

export function NotificationsCenter({ gameState }: NotificationsCenterProps) {
  const { toast } = useToast();
  // Estado para controlar qual notificação de phishing está com modal aberto
  const [activePhishingModalId, setActivePhishingModalId] = useState<string | null>(null);

  const respondToNotificationMutation = useMutation({
    mutationFn: (data: RespondToNotificationRequest) =>
      apiRequest('POST', '/api/notification/respond', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
      toast({
        title: variables.accepted ? "Ação aceita" : "Ação recusada",
        description: variables.accepted 
          ? "Você respondeu positivamente a esta notificação" 
          : "Você recusou esta solicitação",
        variant: variables.accepted ? "default" : "destructive",
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) =>
      apiRequest('POST', '/api/notification/delete', { notificationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
    },
  });

  const handleRespond = (notificationId: string, accepted: boolean) => {
    respondToNotificationMutation.mutate({ notificationId, accepted });
  };

  const activeNotifications = gameState.notifications.filter(n => n.isActive);
  const historicalNotifications = gameState.notifications.filter(n => !n.isActive);

  // Deletar notificações weak_password_warning ao abrir a aba
  useEffect(() => {
    const weakPasswordNotifs = gameState.notifications.filter(
      n => n.type === 'weak_password_warning' && n.isActive
    );
    weakPasswordNotifs.forEach(notif => {
      deleteNotificationMutation.mutate(notif.id);
    });
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'phishing':
        return <Mail className="h-5 w-5 text-amber-500" />;
      case 'social_engineering':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'security_alert':
        return <ShieldAlert className="h-5 w-5 text-red-500" />;
      case 'suspicious_login':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'password_reset':
        return <Info className="h-5 w-5 text-blue-500" />;
      case '2fa_confirm':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'email_verify_confirm':
        return <Mail className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'phishing':
        return 'Phishing';
      case 'social_engineering':
        return 'Engenharia Social';
      case 'security_alert':
        return 'Alerta de Segurança';
      case 'suspicious_login':
        return 'Login Suspeito';
      case 'password_reset':
        return 'Redefinição de Senha';
      case '2fa_confirm':
        return 'Confirmação 2FA';
      case 'email_verify_confirm':
        return 'Confirmação de Email';
      default:
        return 'Notificação';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Central de Notificações</h1>
        <p className="mt-2 text-muted-foreground">
          Gerencie alertas de segurança e ações suspeitas
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeNotifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gameState.notifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ataques Detectados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gameState.hacker.attacksAttempted}</div>
          </CardContent>
        </Card>
      </div>

      {activeNotifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Notificações Ativas</CardTitle>
            <CardDescription>Responda a estas solicitações com cuidado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeNotifications.map((notification) => {
              // Renderiza chatbot de engenharia social inline
              if (notification.type === 'social_engineering') {
                return (
                  <SocialEngineeringChat
                    key={notification.id}
                    notificationId={notification.id}
                    scenarioType={notification.scenarioIndex ?? 0}
                  />
                );
              }

              // Renderiza notificações normais
              return (
                <div
                  key={notification.id}
                  className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{notification.title}</h4>
                          <Badge variant="outline" className="mt-1">
                            {getNotificationTypeLabel(notification.type)}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      
                      {notification.requiresAction && (
                        <div className="flex gap-2 pt-2">
                          {notification.ctaType === 'confirm_email' || 
                           notification.ctaType === 'confirm_2fa' || 
                           notification.ctaType === 'confirm_email_verification' ? (
                            // Confirmações de segurança - apenas botão de confirmar
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleRespond(notification.id, true)}
                              disabled={respondToNotificationMutation.isPending}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              {notification.ctaLabel || 'Confirmar'}
                            </Button>
                          ) : notification.ctaType === 'phishing_learn_more' ? (
                            // Phishing - botão "Saber Mais" abre modal de login falso
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setActivePhishingModalId(notification.id)}
                                disabled={respondToNotificationMutation.isPending}
                                className="flex-1"
                              >
                                <Mail className="mr-2 h-4 w-4" />
                                {notification.ctaLabel || 'Saber Mais'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRespond(notification.id, false)}
                                disabled={respondToNotificationMutation.isPending}
                                className="flex-1"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Recusar
                              </Button>
                            </>
                          ) : (
                            // Outros ataques e ameaças - aceitar/recusar
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRespond(notification.id, true)}
                                disabled={respondToNotificationMutation.isPending}
                                className="flex-1"
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                {notification.ctaLabel || 'Aceitar'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRespond(notification.id, false)}
                                disabled={respondToNotificationMutation.isPending}
                                className="flex-1"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Recusar
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {historicalNotifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico</CardTitle>
            <CardDescription>Notificações anteriores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {historicalNotifications.slice(-10).reverse().map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 opacity-60">
                <div className="mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    {notification.userFellFor !== undefined && (
                      <Badge 
                        variant={notification.userFellFor ? "destructive" : "default"}
                        className="text-xs"
                      >
                        {notification.userFellFor ? "Aceito" : "Recusado"}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{notification.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeNotifications.length === 0 && historicalNotifications.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground/20" />
            <h3 className="font-semibold">Nenhuma notificação</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Você verá alertas de segurança aqui quando o hacker tentar atacar
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-blue-900 dark:text-blue-100">Dica de Segurança</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Sempre verifique:</strong> Emails suspeitos, links estranhos e solicitações não esperadas. 
            Em caso de dúvida, é mais seguro recusar do que aceitar uma ameaça.
          </p>
        </CardContent>
      </Card>

      {/* Modal de Phishing - Página de Login Falsa */}
      {activePhishingModalId && (
        <FakeLoginPage
          gameState={gameState}
          notificationId={activePhishingModalId}
          onClose={() => setActivePhishingModalId(null)}
        />
      )}
    </div>
  );
}

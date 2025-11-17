/**
 * Componente de Página de Login Falsa
 * 
 * Este componente simula uma página de login falsa que aparece quando o usuário
 * clica em "Saber Mais" em uma notificação de phishing.
 * 
 * Compara as credenciais inseridas com as credenciais reais do usuário para
 * determinar se a conta foi comprometida.
 */

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { GameState } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Lock, Mail, Gift, AlertTriangle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FakeLoginPageProps {
  gameState: GameState;
  notificationId: string;
  onClose: () => void;
}

export function FakeLoginPage({ gameState, notificationId, onClose }: FakeLoginPageProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const respondMutation = useMutation({
    mutationFn: (accepted: boolean) =>
      apiRequest('POST', '/api/notification/respond', { 
        notificationId, 
        accepted 
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
      setIsSubmitting(false);
      
      if (variables.accepted) {
        toast({
          title: "Credenciais Comprometidas!",
          description: "Você inseriu suas credenciais reais em um site falso de phishing.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Você se protegeu!",
          description: "Bom trabalho! Você não caiu no golpe de phishing.",
          variant: "default",
        });
      }
      
      setTimeout(() => onClose(), 2000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Compara as credenciais inseridas com as credenciais reais do usuário
    const emailMatches = email.toLowerCase() === gameState.casualUser.email?.toLowerCase();
    const passwordMatches = password === gameState.casualUser.password;
    
    // Se as credenciais coincidirem, a conta foi comprometida
    const isCompromised = emailMatches && passwordMatches;

    // Simula um pequeno delay de "processamento"
    setTimeout(() => {
      respondMutation.mutate(isCompromised);
    }, 1500);
  };

  const handleCancel = () => {
    respondMutation.mutate(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md roudeded-sm-lg border-0 shadow-lg">
        <CardHeader className="relative border-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg p-6  ">
          <button
            onClick={handleCancel}
            className="absolute right-4 top-4 rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            aria-label="Fechar"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 ">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">Parabéns!</CardTitle>
              <CardDescription className="text-amber-50">
                Você ganhou um prêmio especial!
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-7">
          <Alert className="border-amber-200 bg-amber-50">
            <Gift className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900">
              Para resgatar seu prêmio de <strong>R$ 500,00</strong>, faça login com sua conta
            </AlertDescription>
          </Alert>

         

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fake-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fake-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fake-password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fake-password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <Badge variant="outline" className="border-amber-300 text-amber-700">
                Site Seguro ✓
              </Badge>
              <span>www.premio-especial-2024.com</span>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {isSubmitting ? "Verificando..." : "Resgatar Prêmio"}
              </Button>
            </div>
          </form>

          
        </CardContent>
      </Card>
    </div>
  );
}

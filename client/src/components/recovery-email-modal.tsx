// Modal para configurar email de recuperação
// Usuário escreve o email e confirma digitando novamente
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react";

interface RecoveryEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecoveryEmailModal({ open, onOpenChange }: RecoveryEmailModalProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  
  const configureMutation = useMutation({
    mutationFn: (email: string) =>
      apiRequest('POST', '/api/security/recovery-email', { email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
      toast({
        title: "Email de Recuperação Configurado!",
        description: "Um email de confirmação foi enviado para seu email de recuperação.",
      });
      onOpenChange(false);
      setEmail("");
      setConfirmEmail("");
    },
  });

  const handleConfirm = () => {
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, forneça um endereço de email válido.",
        variant: "destructive",
      });
      return;
    }
    
    // Verificar se os emails coincidem
    if (email !== confirmEmail) {
      toast({
        title: "Emails não coincidem",
        description: "Os emails digitados não são iguais. Por favor, verifique e tente novamente.",
        variant: "destructive",
      });
      return;
    }
    
    configureMutation.mutate(email);
  };

  const emailsMatch = email.length > 0 && email === confirmEmail;
  const emailsDiffer = email.length > 0 && confirmEmail.length > 0 && email !== confirmEmail;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email de Recuperação
          </DialogTitle>
          <DialogDescription>
            Configure um email alternativo para recuperar sua conta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <Label htmlFor="recovery-email">Email de Recuperação</Label>
            <Input
              id="recovery-email"
              type="email"
              placeholder="recuperacao@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Confirmar email */}
          <div>
            <Label htmlFor="confirm-email">Confirmar Email</Label>
            <div className="relative">
              <Input
                id="confirm-email"
                type="email"
                placeholder="Digite o email novamente"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className={`mt-2 pr-10 ${
                  emailsMatch ? 'border-green-500' : 
                  emailsDiffer ? 'border-red-500' : ''
                }`}
              />
              {emailsMatch && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 h-5 w-5 text-green-500" />
              )}
              {emailsDiffer && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 h-5 w-5 text-red-500" />
              )}
            </div>
            {emailsDiffer && (
              <p className="mt-1 text-xs text-red-500">
                Os emails não coincidem
              </p>
            )}
            {emailsMatch && (
              <p className="mt-1 text-xs text-green-600">
                Os emails coincidem!
              </p>
            )}
          </div>

          <Button
            className="w-full"
            onClick={handleConfirm}
            disabled={configureMutation.isPending || !emailsMatch}
          >
            Confirmar e Ativar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

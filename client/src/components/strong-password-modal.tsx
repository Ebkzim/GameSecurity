// Modal para configurar senha forte
// Permite o usuário criar sua própria senha ou usar uma sugerida pelo sistema
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
import { Key, RefreshCw, Check, X } from "lucide-react";

interface StrongPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Gera uma senha forte aleatória
function generateStrongPassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const all = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  for (let i = 0; i < 12; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Calcula a força da senha
function calculatePasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];
  
  if (password.length >= 8) {
    score += 25;
  } else {
    feedback.push("Mínimo 8 caracteres");
  }
  
  if (password.length >= 12) {
    score += 15;
  } else {
    feedback.push("Recomendado 12+ caracteres");
  }
  
  if (/[a-z]/.test(password)) {
    score += 15;
  } else {
    feedback.push("Adicione letras minúsculas");
  }
  
  if (/[A-Z]/.test(password)) {
    score += 15;
  } else {
    feedback.push("Adicione letras maiúsculas");
  }
  
  if (/[0-9]/.test(password)) {
    score += 15;
  } else {
    feedback.push("Adicione números");
  }
  
  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 15;
  } else {
    feedback.push("Adicione símbolos (!@#$%)");
  }
  
  return { score: Math.min(score, 100), feedback };
}

export function StrongPasswordModal({ open, onOpenChange }: StrongPasswordModalProps) {
  const { toast } = useToast();
  const [customPassword, setCustomPassword] = useState("");
  const [suggestedPassword] = useState(generateStrongPassword());
  const [useCustom, setUseCustom] = useState(true);
  
  const strength = calculatePasswordStrength(useCustom ? customPassword : suggestedPassword);
  
  const configureMutation = useMutation({
    mutationFn: (password: string) =>
      apiRequest('POST', '/api/security/strong-password', { password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
      toast({
        title: "Senha Forte Configurada!",
        description: "Sua senha foi atualizada com sucesso.",
      });
      onOpenChange(false);
      setCustomPassword("");
    },
  });

  const handleConfirm = () => {
    const finalPassword = useCustom ? customPassword : suggestedPassword;
    
    if (useCustom && strength.score < 60) {
      toast({
        title: "Senha fraca",
        description: "Sua senha precisa ser mais forte. Tente adicionar mais caracteres variados.",
        variant: "destructive",
      });
      return;
    }
    
    configureMutation.mutate(finalPassword);
  };
  
  const handleGenerateNew = () => {
    const newPassword = generateStrongPassword();
    if (useCustom) {
      setCustomPassword(newPassword);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Configurar Senha Forte
          </DialogTitle>
          <DialogDescription>
            Escolha entre criar sua própria senha ou usar uma gerada pelo sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Opções de escolha */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={useCustom ? "default" : "outline"}
              onClick={() => setUseCustom(true)}
              className="w-full"
            >
              Criar Minha Senha
            </Button>
            <Button
              variant={!useCustom ? "default" : "outline"}
              onClick={() => setUseCustom(false)}
              className="w-full"
            >
              Usar Sugerida
            </Button>
          </div>

          {/* Senha customizada */}
          {useCustom && (
            <div>
              <Label htmlFor="custom-password">Digite sua senha forte</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="custom-password"
                  type="text"
                  placeholder="Digite uma senha forte..."
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleGenerateNew}
                  title="Gerar senha aleatória"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Senha sugerida */}
          {!useCustom && (
            <div>
              <Label>Senha gerada pelo sistema</Label>
              <div className="mt-2 rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <code className="text-lg font-bold">{suggestedPassword}</code>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  ⚠️ Anote esta senha em local seguro!
                </p>
              </div>
            </div>
          )}

          {/* Indicador de força */}
          <div className="rounded-lg border p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Força da Senha</span>
              <span className={`text-sm font-bold ${
                strength.score >= 80 ? 'text-green-600' :
                strength.score >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {strength.score}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full transition-all ${
                  strength.score >= 80 ? 'bg-green-600' :
                  strength.score >= 60 ? 'bg-yellow-600' :
                  'bg-red-600'
                }`}
                style={{ width: `${strength.score}%` }}
              />
            </div>
            
            {/* Feedback */}
            {useCustom && strength.feedback.length > 0 && (
              <div className="mt-3 space-y-1">
                {strength.feedback.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <X className="h-3 w-3 text-red-500" />
                    {item}
                  </div>
                ))}
              </div>
            )}
            
            {strength.score >= 80 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
                <Check className="h-3 w-3" />
                Senha forte! Excelente escolha.
              </div>
            )}
          </div>

          <Button
            className="w-full"
            onClick={handleConfirm}
            disabled={configureMutation.isPending || (useCustom && customPassword.length === 0)}
          >
            Confirmar e Ativar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

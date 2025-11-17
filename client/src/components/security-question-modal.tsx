// Modal para configurar pergunta de segurança
// Pergunta fixa: "Qual foi o seu professor de sistemas computacionais e segurança"
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
import { HelpCircle } from "lucide-react";

interface SecurityQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SecurityQuestionModal({ open, onOpenChange }: SecurityQuestionModalProps) {
  const { toast } = useToast();
  const [answer, setAnswer] = useState("");
  
  // Pergunta fixa conforme solicitado
  const question = "Qual foi o seu professor de sistemas computacionais e segurança";
  
  const configureMutation = useMutation({
    mutationFn: (data: { question: string; answer: string }) =>
      apiRequest('POST', '/api/security/security-question', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
      toast({
        title: "Pergunta de Segurança Configurada!",
        description: "Sua resposta foi salva com sucesso.",
      });
      onOpenChange(false);
      setAnswer("");
    },
  });

  const handleConfirm = () => {
    if (answer.trim().length < 3) {
      toast({
        title: "Resposta muito curta",
        description: "Por favor, forneça uma resposta mais detalhada.",
        variant: "destructive",
      });
      return;
    }
    
    configureMutation.mutate({ question, answer: answer.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Pergunta de Segurança
          </DialogTitle>
          <DialogDescription>
            Esta pergunta será usada para recuperação da sua conta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Pergunta fixa */}
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium text-foreground">
              {question}?
            </p>
          </div>

          {/* Campo de resposta */}
          <div>
            <Label htmlFor="answer">Sua Resposta</Label>
            <Input
              id="answer"
              type="text"
              placeholder="Digite sua resposta..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Lembre-se desta resposta - você precisará dela para recuperar sua conta
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleConfirm}
            disabled={configureMutation.isPending || answer.trim().length < 3}
          >
            Salvar e Ativar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

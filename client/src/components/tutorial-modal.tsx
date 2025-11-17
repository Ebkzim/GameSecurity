import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, User, Terminal, Zap, ShieldCheck } from "lucide-react";

interface TutorialModalProps {
  onComplete: () => void;
  onClose: () => void;
}

const tutorialSteps = [
  {
    title: "Bem-vindo ao Jogo de Segurança Digital!",
    description:
      "Você vai controlar dois personagens ao mesmo tempo: um usuário casual e um hacker. Aprenda sobre segurança digital vendo como ataques funcionam e como se proteger.",
    icon: Shield,
  },
  {
    title: "Painel do Usuário (Esquerda)",
    description:
      "Aqui você cria uma conta e ativa medidas de segurança como autenticação de dois fatores, senhas fortes e verificação de emails. Cada proteção dificulta os ataques.",
    icon: User,
  },
  {
    title: "Painel do Hacker (Direita)",
    description:
      "Aqui você lança ataques contra o usuário: phishing, engenharia social, força bruta e mais. Cada ataque tem um tempo de recarga após ser usado.",
    icon: Terminal,
  },
  {
    title: "Como os Ataques Funcionam",
    description:
      "Quando você lança um ataque, ele aparece como notificação para o usuário. Se o usuário não tiver proteções ativadas ou cair no golpe, o ataque pode ter sucesso!",
    icon: Zap,
  },
  {
    title: "Objetivo do Jogo",
    description:
      "Aprenda experimentando! Veja quais ataques funcionam e quais proteções os bloqueiam. A barra de segurança mostra o quão vulnerável a conta está. Boa sorte!",
    icon: ShieldCheck,
  },
];

export function TutorialModal({ onComplete, onClose }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const completeTutorialMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/tutorial/complete', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
      onComplete();
    },
  });

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorialMutation.mutate();
    }
  };

  const handleSkip = () => {
    completeTutorialMutation.mutate();
  };

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg" data-testid="modal-tutorial">
        <DialogHeader>
          <div className="mx-auto mb-4 rounded-full bg-primary/10 p-4">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl font-heading">
            {step.title}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-2 py-4">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentStep
                  ? "w-6 bg-primary"
                  : index < currentStep
                  ? "bg-primary/50"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleSkip}
            data-testid="button-skip-tutorial"
          >
            Pular Tutorial
          </Button>
          <Button
            onClick={handleNext}
            data-testid="button-next-tutorial"
          >
            {currentStep < tutorialSteps.length - 1 ? "Próximo" : "Começar!"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

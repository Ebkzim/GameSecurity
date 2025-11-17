import { Shield, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GameHeaderProps {
  onShowTutorial: () => void;
}

export function GameHeader({ onShowTutorial }: GameHeaderProps) {
  return (
    <header className="border-b bg-card px-4 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-primary p-2">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight md:text-2xl">
              Jogo de Segurança Digital
            </h1>
            <p className="text-xs text-muted-foreground md:text-sm">
              Aprenda sobre proteção de senhas
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onShowTutorial}
          data-testid="button-show-tutorial"
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          Como Jogar
        </Button>
      </div>
    </header>
  );
}

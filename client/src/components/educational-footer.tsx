import { useState, useEffect } from "react";
import { Lightbulb } from "lucide-react";

const educationalTips = [
  "Senhas fortes devem ter pelo menos 12 caracteres com letras, números e símbolos.",
  "A autenticação de dois fatores (2FA) adiciona uma camada extra de proteção à sua conta.",
  "Phishing é uma das técnicas mais comuns de invasão - sempre verifique o remetente de emails.",
  "Nunca compartilhe suas senhas, mesmo com pessoas que parecem confiáveis.",
  "Ataques de força bruta tentam adivinhar sua senha - senhas complexas os tornam inviáveis.",
  "Keyloggers podem capturar tudo que você digita - use antivírus e seja cauteloso.",
  "Vazamentos de dados expõem senhas antigas - mude suas senhas regularmente.",
  "Engenharia social manipula você psicologicamente - sempre questione pedidos suspeitos.",
];

export function EducationalFooter() {
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % educationalTips.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="border-t bg-card px-4 py-3">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 rounded-md bg-primary/10 p-2">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Dica de Segurança
            </p>
            <p className="text-sm font-medium transition-opacity">
              {educationalTips[currentTip]}
            </p>
          </div>
          <div className="flex gap-1">
            {educationalTips.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-1.5 rounded-full transition-all ${
                  index === currentTip ? "w-4 bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

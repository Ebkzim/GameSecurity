/**
 * Modal de Dica de Senha Fraca
 * 
 * Exibido após o usuário criar uma conta com senha fraca.
 * Aparece com animação de bounce e guia o usuário para melhorar a senha.
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Lock, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WeakPasswordTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToSettings: () => void;
  passwordStrength: number;
}

export function WeakPasswordTipModal({ 
  isOpen, 
  onClose, 
  onGoToSettings,
  passwordStrength 
}: WeakPasswordTipModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShowContent(true), 100);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  const getStrengthLabel = (strength: number) => {
    if (strength < 40) return "Muito Fraca";
    if (strength < 60) return "Fraca";
    if (strength < 80) return "Média";
    return "Forte";
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 40) return "text-red-500";
    if (strength < 60) return "text-orange-500";
    if (strength < 80) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0 gap-0">
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ 
                type: "spring", 
                duration: 0.5,
                bounce: 0.4
              }}
              className="relative"
            >
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-10"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 p-6 border-b">
                <DialogHeader>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring",
                      delay: 0.2,
                      duration: 0.6,
                      bounce: 0.5
                    }}
                    className="mx-auto mb-4 rounded-full bg-amber-500/20 p-4 w-fit"
                  >
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                  </motion.div>
                  <DialogTitle className="text-center text-2xl font-heading">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Atenção: Senha Fraca Detectada!
                    </motion.div>
                  </DialogTitle>
                  <DialogDescription className="text-center">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="mt-2"
                    >
                      Sua conta foi criada, mas sua senha está vulnerável a ataques
                    </motion.div>
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="p-6 space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-lg border-2 border-amber-500/30 bg-amber-500/5 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Força da Senha Atual:</span>
                    <span className={`text-lg font-bold ${getStrengthColor(passwordStrength)}`}>
                      {passwordStrength}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${passwordStrength}%` }}
                      transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                      className={`h-full ${
                        passwordStrength < 40 ? "bg-red-500" :
                        passwordStrength < 60 ? "bg-orange-500" :
                        passwordStrength < 80 ? "bg-yellow-500" :
                        "bg-green-500"
                      }`}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Status: <span className={`font-semibold ${getStrengthColor(passwordStrength)}`}>
                      {getStrengthLabel(passwordStrength)}
                    </span>
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-2"
                >
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    Dicas para uma Senha Forte:
                  </h4>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Mínimo de 12 caracteres</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Combine letras maiúsculas e minúsculas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Inclua números e caracteres especiais (!@#$%)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Evite palavras comuns e informações pessoais</span>
                    </li>
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex gap-3 pt-2"
                >
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1"
                  >
                    Depois
                  </Button>
                  <Button
                    onClick={() => {
                      onGoToSettings();
                      onClose();
                    }}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    Melhorar Agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

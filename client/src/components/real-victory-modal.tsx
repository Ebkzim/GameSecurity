import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Trophy, AlertTriangle, Lightbulb, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import type { GameState } from "@shared/schema";

interface RealVictoryModalProps {
  isOpen: boolean;
  onRestart: () => void;
  gameState: GameState;
}

export function RealVictoryModal({ isOpen, onRestart, gameState }: RealVictoryModalProps) {
  const attacksBlocked = gameState.hacker.attacksAttempted - gameState.hacker.attacksSuccessful;
  const blockRate = gameState.hacker.attacksAttempted > 0
    ? Math.round((attacksBlocked / gameState.hacker.attacksAttempted) * 100)
    : 0;

  return (
    <Dialog open={isOpen}>
      <DialogContent 
        className="sm:max-w-md border-4 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 w-11/12"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="text-center py-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              duration: 0.8
            }}
            className="flex justify-center mb-3"
          >
            <div className="relative">
              <ShieldCheck className="w-16 h-16 text-green-600" />
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="absolute -top-2 -right-2"
              >
                <Trophy className="w-8 h-8 text-yellow-500" />
              </motion.div>
            </div>
          </motion.div>

          <motion.h2 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-green-700 mb-3"
          >
            🎉 VITÓRIA! VOCÊ REALMENTE GANHOU! 🎉
          </motion.h2>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="bg-white rounded-lg p-4 mb-4 shadow-lg text-sm"
          >
            <p className="text-gray-700 mb-3 leading-relaxed">
              Você acabou de cair em uma armadilha! O "prêmio" era falso e os popups simulam vírus reais.
            </p>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3 mb-3">
              <p className="font-semibold text-orange-800 mb-2 text-xs">
                Nunca confie em:
              </p>
              <ul className="text-xs text-orange-700 space-y-1">
                <li>• Mensagens de "você ganhou um prêmio"</li>
                <li>• Popups pedindo para instalar</li>
                <li>• Ofertas "boas demais para ser verdade"</li>
              </ul>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
              <p className="font-semibold text-green-800 text-xs mb-1">
                ✅ Você fez a escolha certa!
              </p>
              <p className="text-xs text-green-700">
                Sempre desconfie de ofertas suspeitas.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-3 mb-4"
          >
            <h3 className="text-lg font-bold mb-2">🏆 Estatísticas</h3>
            <div className="grid grid-cols-2 gap-3 text-xs text-left">
              <div>
                <p className="text-green-100">Ataques</p>
                <p className="text-lg font-bold">{gameState.hacker.attacksAttempted}</p>
              </div>
              <div>
                <p className="text-green-100">Bloqueados</p>
                <p className="text-lg font-bold">{attacksBlocked}</p>
              </div>
              <div>
                <p className="text-green-100">Taxa</p>
                <p className="text-lg font-bold">{blockRate}%</p>
              </div>
              <div>
                <p className="text-green-100">Status</p>
                <p className="text-base font-bold">SEGURO! ✓</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <Button
              onClick={onRestart}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-6 py-3 shadow-lg transform hover:scale-105 transition-all text-sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Jogar Novamente
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

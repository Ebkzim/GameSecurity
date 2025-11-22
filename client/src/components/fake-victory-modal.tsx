import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Gift, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";

interface FakeVictoryModalProps {
  isOpen: boolean;
  onInstallClick: () => void;
  onNotInterested: () => void;
}

export function FakeVictoryModal({ isOpen, onInstallClick, onNotInterested }: FakeVictoryModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent 
        className="sm:max-w-lg border-4 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="text-center py-6">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              duration: 0.8
            }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <Trophy className="w-24 h-24 text-yellow-500" />
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="absolute -top-2 -right-2"
              >
                <PartyPopper className="w-12 h-12 text-orange-500" />
              </motion.div>
            </div>
          </motion.div>

          <motion.h2 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-orange-600 mb-4"
          >
            PARABÉNS! VOCÊ VENCEU!
          </motion.h2>

          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-gray-700 mb-4"
          >
            Você conseguiu proteger sua conta contra todos os ataques!
          </motion.p>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: "spring" }}
            className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg p-6 mb-6"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <Gift className="w-8 h-8 text-purple-600" />
              <h3 className="text-xl font-bold text-purple-700">
                Você ganhou um PRÊMIO ESPECIAL!
              </h3>
            </div>
            <p className="text-purple-600 font-semibold mb-4">
              Parabéns! Você ganhou um pacote premium de segurança GRATUITO!
            </p>
            <p className="text-sm text-purple-500 mb-4">
              Instale agora para proteção máxima e recursos exclusivos!
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex gap-3 justify-center"
          >
            <Button
              onClick={onInstallClick}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg px-6 py-3 shadow-lg transform hover:scale-105 transition-all"
            >
              ✓ Sim, Instalar Agora!
            </Button>
            <Button
              onClick={onNotInterested}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold text-lg px-6 py-3 shadow-lg transform hover:scale-105 transition-all"
            >
              ✕ Não, Obrigado
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-xs text-gray-400 mt-4"
          >
            100% Grátis • Sem compromisso • Oferta limitada
          </motion.p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

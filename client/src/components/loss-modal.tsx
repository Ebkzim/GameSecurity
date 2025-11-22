import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Shield, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface LossModalProps {
  isOpen: boolean;
  onRestart: () => void;
}

export function LossModal({ isOpen, onRestart }: LossModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent 
        className="sm:max-w-sm border-4 border-yellow-500 bg-gradient-to-br from-yellow-50 to-amber-50 w-11/12"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="text-center py-4">
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              duration: 0.8
            }}
            className="flex justify-center gap-2 mb-3"
          >
            <CheckCircle className="w-16 h-16 text-green-600" />
            <AlertTriangle className="w-16 h-16 text-yellow-600" />
          </motion.div>

          <motion.h2 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-yellow-700 mb-3"
          >
             VOCÊ PERDEU! 
          </motion.h2>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="bg-white rounded-lg p-4 mb-4 shadow-lg text-sm"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-green-600" />
              <p className="font-semibold text-green-700">
                 Antivírus funcionou!
              </p>
            </div>

            <p className="text-gray-700 mb-3 leading-relaxed font-semibold">
              Você se safou do vírus, mas infelizmente perdeu o jogo!
            </p>

            <p className="text-gray-700 mb-3 leading-relaxed">
              O "Anti-Virus Iris" conseguiu tirar o vírus do seu navegador. Ao clicar, você o eliminou completamente, mas perdeu a partida como punição por ter caído na armadilha.
            </p>

            

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                Tente novamente! Com todas as 11 defesas ativas, você conseguirá vencer!
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
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

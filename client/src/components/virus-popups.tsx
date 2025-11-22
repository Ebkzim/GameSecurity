import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Download, Gift, DollarSign, Zap, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VirusPopup {
  id: string;
  title: string;
  message: string;
  icon: any;
  color: string;
  isAntiVirus: boolean;
  position: { x: number; y: number };
}

interface VirusPopupsProps {
  isActive: boolean;
  onClose: () => void;
  onAntiVirusIrisClicked: () => void;
}

const popupTemplates = [
  {
    title: "🎁 VOCÊ GANHOU UM iPHONE!",
    message: "Clique aqui para resgatar seu prêmio agora!",
    icon: Gift,
    color: "from-red-500 to-pink-500",
    isAntiVirus: false
  },
  {
    title: "⚠️ ANTI-VIRUS IRIS",
    message: "Clique em qualquer opção para remover vírus",
    icon: AlertTriangle,
    color: "from-red-600 to-red-700",
    isAntiVirus: true
  },
  {
    title: "💰 GANHE R$ 5.000 AGORA!",
    message: "Você foi selecionado! Baixe o app para receber!",
    icon: DollarSign,
    color: "from-green-500 to-emerald-600",
    isAntiVirus: false
  },
  {
    title: "📱 NOVO SMARTPHONE GRÁTIS!",
    message: "Parabéns! Você ganhou o último modelo Samsung!",
    icon: Smartphone,
    color: "from-blue-500 to-cyan-500",
    isAntiVirus: false
  },
  {
    title: "⚡ ATUALIZAÇÂO URGENTE!",
    message: "Sistema desatualizado! Instale agora para evitar problemas!",
    icon: Zap,
    color: "from-yellow-500 to-orange-500",
    isAntiVirus: false
  },
  {
    title: "🎯 OFERTA EXCLUSIVA!",
    message: "Última chance! Baixe agora e ganhe 90% de desconto!",
    icon: Download,
    color: "from-purple-500 to-pink-500",
    isAntiVirus: false
  },
];

export function VirusPopups({ isActive, onClose, onAntiVirusIrisClicked }: VirusPopupsProps) {
  const [popups, setPopups] = useState<VirusPopup[]>([]);

  useEffect(() => {
    if (!isActive) {
      setPopups([]);
      return;
    }

    const intervals: NodeJS.Timeout[] = [];
    let antiVirusCounter = 0;
    
    const createPopup = () => {
      // Anti-Virus Iris aparece a cada 4 popups (menos frequente)
      antiVirusCounter++;
      let template;
      
      if (antiVirusCounter % 4 === 0) {
        template = popupTemplates[1]; // Anti-Virus Iris
      } else {
        // Escolher template aleatório (excluindo anti-virus)
        const nonAntiVirusTemplates = popupTemplates.filter((_, i) => i !== 1);
        template = nonAntiVirusTemplates[Math.floor(Math.random() * nonAntiVirusTemplates.length)];
      }
      
      const newPopup: VirusPopup = {
        id: Math.random().toString(36),
        ...template,
        position: {
          x: Math.random() * (window.innerWidth - 400),
          y: Math.random() * (window.innerHeight - 300),
        },
      };
      
      setPopups(prev => [...prev, newPopup]);
    };

    createPopup();
    
    // Popups aparecem MAIS RÁPIDO: 400ms, 600ms, 900ms (reduzido de 800, 1200, 1500)
    intervals.push(setInterval(createPopup, 400));
    intervals.push(setInterval(createPopup, 600));
    intervals.push(setInterval(createPopup, 900));

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [isActive]);

  const removePopup = (id: string) => {
    setPopups(prev => prev.filter(p => p.id !== id));
  };

  if (!isActive) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[100]" />
      
      <AnimatePresence>
        {popups.map((popup) => (
          <motion.div
            key={popup.id}
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="fixed z-[101]"
            style={{
              left: `${popup.position.x}px`,
              top: `${popup.position.y}px`,
            }}
          >
            <div className={`bg-gradient-to-br ${popup.color} text-white rounded-lg shadow-2xl p-6 w-80 border-4 border-white`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <popup.icon className="w-8 h-8" />
                  <h3 className="font-bold text-lg">{popup.title}</h3>
                </div>
                <button
                  onClick={() => removePopup(popup.id)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-white/90 mb-6">{popup.message}</p>
              
              <div className="flex gap-2">
                {popup.isAntiVirus ? (
                  <>
                    <Button 
                      onClick={onAntiVirusIrisClicked}
                      variant="secondary"
                      className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/50 text-xs"
                    >
                      Remover
                    </Button>
                    <Button 
                      onClick={onAntiVirusIrisClicked}
                      variant="outline"
                      className="flex-1 bg-white text-gray-800 hover:bg-gray-100 text-xs"
                    >
                      OK
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      onClick={() => {}}
                      variant="secondary"
                      className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/50 text-xs cursor-not-allowed"
                    >
                      Instalar
                    </Button>
                    <Button 
                      onClick={() => {}}
                      variant="outline"
                      className="flex-1 bg-white text-gray-800 hover:bg-gray-100 text-xs cursor-not-allowed"
                    >
                      Não interessa
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
}

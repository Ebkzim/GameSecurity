import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { GameState } from "@shared/schema";
import { CasualUserPanel } from "@/components/casual-user-panel-new";
import { HackerPanelImproved } from "@/components/hacker-panel-improved";
import { TutorialModal } from "@/components/tutorial-modal";
import { GameOverModal } from "@/components/game-over-modal";
import { WeakPasswordTipModal } from "@/components/weak-password-tip-modal";

export default function Game() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [showGameOver, setShowGameOver] = useState(false);
  const [mobileView, setMobileView] = useState<'user' | 'hacker'>('user');
  const [showWeakPasswordModal, setShowWeakPasswordModal] = useState(false);

  const { data: gameState, isLoading } = useQuery<GameState>({
    queryKey: ['/api/game-state'],
  });

  const startGameMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/game/start', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
    },
  });

  useEffect(() => {
    if (gameState?.tutorialCompleted && !showTutorial) {
      if (!gameState.gameStarted) {
        startGameMutation.mutate();
      }
    }
  }, [gameState?.tutorialCompleted, showTutorial]);

  useEffect(() => {
    if (gameState?.casualUser.accountCompromised && !showGameOver) {
      setShowGameOver(true);
    }
  }, [gameState?.casualUser.accountCompromised, showGameOver]);

  useEffect(() => {
    if (gameState?.notifications) {
      const weakPasswordNotif = gameState.notifications.find(
        n => n.type === 'weak_password_warning' && n.isActive
      );
      if (weakPasswordNotif) {
        setShowWeakPasswordModal(true);
      } else {
        setShowWeakPasswordModal(false);
      }
    }
  }, [gameState?.notifications]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  const handleRestartGame = () => {
    setShowGameOver(false);
    startGameMutation.mutate();
  };

  const handleCloseGameOver = () => {
    setShowGameOver(false);
  };

  const handleWeakPasswordClose = () => {
    setShowWeakPasswordModal(false);
    if (gameState?.notifications) {
      const weakPasswordNotif = gameState.notifications.find(
        n => n.type === 'weak_password_warning'
      );
      if (weakPasswordNotif) {
        apiRequest('POST', '/api/notification/delete', { notificationId: weakPasswordNotif.id });
      }
    }
  };

  const getWeakPasswordStrength = () => {
    const weakPasswordNotif = gameState?.notifications.find(
      n => n.type === 'weak_password_warning'
    );
    return weakPasswordNotif?.passwordStrength ?? 0;
  };

  if (isLoading || !gameState) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-slate-300">Carregando jogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
      <div className="flex flex-1 overflow-hidden min-h-0">
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-px w-full overflow-hidden">
          <div className="relative overflow-hidden">
            <CasualUserPanel gameState={gameState} />
            <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
          </div>
          <div className="overflow-hidden">
            <HackerPanelImproved gameState={gameState} />
          </div>
        </div>

        <div className="lg:hidden flex flex-col w-full overflow-hidden">
          <div className="flex border-b border-slate-700 flex-shrink-0">
            <button 
              onClick={() => setMobileView('user')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                mobileView === 'user'
                  ? 'border-b-2 border-user-safe bg-user-safe/5 text-slate-100'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              SUA CONTA
            </button>
            <button 
              onClick={() => setMobileView('hacker')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                mobileView === 'hacker'
                  ? 'border-b-2 border-red-600 bg-red-600/5 text-slate-100'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              VISÃO DO HACKER
            </button>
          </div>
          <div className="flex-1 overflow-auto min-h-0">
            {mobileView === 'user' ? (
              <CasualUserPanel gameState={gameState} />
            ) : (
              <HackerPanelImproved gameState={gameState} />
            )}
          </div>
        </div>
      </div>

      {showTutorial && (
        <TutorialModal
          onComplete={handleTutorialComplete}
          onClose={() => setShowTutorial(false)}
        />
      )}

      <GameOverModal
        gameState={gameState}
        onRestart={handleRestartGame}
        onClose={handleCloseGameOver}
        isOpen={showGameOver}
      />

      {gameState && (
        <WeakPasswordTipModal
          isOpen={showWeakPasswordModal}
          onClose={handleWeakPasswordClose}
          onGoToSettings={() => {
            // This will be handled by the parent component navigation
            setShowWeakPasswordModal(false);
          }}
          passwordStrength={getWeakPasswordStrength()}
        />
      )}
    </div>
  );
}

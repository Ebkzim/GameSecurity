import type { GameState } from "@shared/schema";
import { OSWorkspaceShell } from "@/components/os-workspace-shell";

interface CasualUserPanelProps {
  gameState: GameState;
}

export function CasualUserPanel({ gameState }: CasualUserPanelProps) {
  return <OSWorkspaceShell gameState={gameState} />;
}

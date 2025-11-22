import type { GameState } from "@shared/schema";
import { OSWorkspaceShell } from "@/components/os-workspace-shell";

interface CasualUserPanelProps {
  gameState: GameState;
  forceOpenStrongPassword?: boolean;
  setForceOpenStrongPassword?: (value: boolean) => void;
}

export function CasualUserPanel({ gameState, forceOpenStrongPassword, setForceOpenStrongPassword }: CasualUserPanelProps) {
  return <OSWorkspaceShell gameState={gameState} forceOpenStrongPassword={forceOpenStrongPassword} setForceOpenStrongPassword={setForceOpenStrongPassword} />;
}

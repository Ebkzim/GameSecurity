import type { GameState } from "@shared/schema";
import type { SessionData } from "express-session";

function deepClone<T>(obj: T): T {
  return structuredClone(obj);
}

function deepMerge(target: any, source: any): any {
  const output = { ...target };
  
  for (const key in source) {
    if (source[key] === null || source[key] === undefined) {
      output[key] = source[key];
    } else if (Array.isArray(source[key])) {
      output[key] = deepClone(source[key]);
    } else if (typeof source[key] === 'object') {
      if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
        output[key] = deepMerge(target[key], source[key]);
      } else {
        output[key] = deepClone(source[key]);
      }
    } else {
      output[key] = source[key];
    }
  }
  
  return output;
}

export const initialGameState: GameState = {
  casualUser: {
    name: undefined,
    email: undefined,
    password: undefined,
    accountCreated: false,
    accountCreationStep: 0,
    securityMeasures: {
      twoFactorAuth: false,
      strongPassword: false,
      emailVerification: false,
      securityQuestions: false,
      backupEmail: false,
      authenticatorApp: false,
      smsBackup: false,
      trustedDevices: false,
      loginAlerts: false,
      sessionManagement: false,
      ipWhitelist: false,
      passwordVault: false,
    },
    securitySetupFlows: {},
    securityConfig: {
      strongPassword: { password: '', strength: 0 },
      securityQuestion: { question: '', answer: '' },
      recoveryEmail: { email: '', verified: false },
    },
    passwordVault: [],
    accountCompromised: false,
  },
  hacker: {
    attacksAttempted: 0,
    attacksSuccessful: 0,
    activeAttacks: [],
    cooldowns: {},
    attackFlows: {},
    socialEngineeringScenarioCursor: 0,
  },
  notifications: [],
  vulnerabilityScore: 100,
  gameStarted: false,
  tutorialCompleted: false,
  roundId: '0',
  activityLog: [],
};

export function getGameState(session: SessionData): GameState {
  if (!session.gameState) {
    session.gameState = deepClone(initialGameState);
  }
  return deepClone(session.gameState);
}

export function updateGameState(session: SessionData, updates: Partial<GameState>): GameState {
  if (!session.gameState) {
    session.gameState = deepClone(initialGameState);
  }
  
  const clonedState = deepClone(session.gameState);
  const mergedState = deepMerge(clonedState, updates) as GameState;
  session.gameState = mergedState;
  
  return deepClone(session.gameState);
}

export function resetGameState(session: SessionData): GameState {
  session.gameState = deepClone(initialGameState);
  return deepClone(session.gameState);
}

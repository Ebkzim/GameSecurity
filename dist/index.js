// server/index.ts
import express2 from "express";
import session from "express-session";
import createMemoryStore from "memorystore";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
function deepClone(obj) {
  return structuredClone(obj);
}
function deepMerge(target, source) {
  const output = { ...target };
  for (const key in source) {
    if (source[key] === null || source[key] === void 0) {
      output[key] = source[key];
    } else if (Array.isArray(source[key])) {
      output[key] = deepClone(source[key]);
    } else if (typeof source[key] === "object") {
      if (target[key] && typeof target[key] === "object" && !Array.isArray(target[key])) {
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
var initialGameState = {
  casualUser: {
    name: void 0,
    email: void 0,
    password: void 0,
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
      ipWhitelist: false
    },
    securitySetupFlows: {},
    securityConfig: {
      strongPassword: { password: "", strength: 0 },
      securityQuestion: { question: "", answer: "" },
      recoveryEmail: { email: "", verified: false }
    },
    passwordVault: [],
    accountCompromised: false
  },
  hacker: {
    attacksAttempted: 0,
    attacksSuccessful: 0,
    activeAttacks: [],
    cooldowns: {},
    attackFlows: {},
    socialEngineeringScenarioCursor: 0
  },
  notifications: [],
  vulnerabilityScore: 100,
  gameStarted: false,
  tutorialCompleted: false,
  activityLog: []
};
function getGameState(session2) {
  if (!session2.gameState) {
    session2.gameState = deepClone(initialGameState);
  }
  return deepClone(session2.gameState);
}
function updateGameState(session2, updates) {
  if (!session2.gameState) {
    session2.gameState = deepClone(initialGameState);
  }
  const clonedState = deepClone(session2.gameState);
  const mergedState = deepMerge(clonedState, updates);
  session2.gameState = mergedState;
  return deepClone(session2.gameState);
}
function resetGameState(session2) {
  session2.gameState = deepClone(initialGameState);
  return deepClone(session2.gameState);
}

// shared/schema.ts
import { z } from "zod";
var securitySetupFlowSchema = z.object({
  twoFactorAuth: z.object({
    step: z.number().default(0),
    // 0: not started, 1: choose method, 2: enter code, 3: save recovery codes, 4: complete
    method: z.enum(["app", "sms"]).optional(),
    code: z.string().optional(),
    completed: z.boolean().default(false)
  }).optional(),
  securityQuestions: z.object({
    step: z.number().default(0),
    question: z.string().optional(),
    answer: z.string().optional(),
    completed: z.boolean().default(false)
  }).optional(),
  backupEmail: z.object({
    step: z.number().default(0),
    email: z.string().optional(),
    verificationCode: z.string().optional(),
    completed: z.boolean().default(false)
  }).optional()
});
var securityConfigSchema = z.object({
  // Configuração de senha forte
  strongPassword: z.object({
    password: z.string().optional(),
    strength: z.number().optional()
  }).optional(),
  // Configuração de perguntas de segurança
  securityQuestion: z.object({
    question: z.string().optional(),
    answer: z.string().optional()
  }).optional(),
  // Configuração de email de recuperação
  recoveryEmail: z.object({
    email: z.string().optional(),
    verified: z.boolean().default(false)
  }).optional(),
  authenticatorApp: z.object({
    secret: z.string().optional(),
    recoveryCodes: z.array(z.string()).optional()
  }).optional(),
  smsBackup: z.object({
    phoneNumber: z.string().optional(),
    verified: z.boolean().default(false)
  }).optional(),
  trustedDevices: z.object({
    devices: z.array(z.object({
      id: z.string(),
      name: z.string(),
      fingerprint: z.string(),
      addedAt: z.number()
    })).default([])
  }).optional(),
  loginAlerts: z.object({
    emailAlerts: z.boolean().default(false),
    smsAlerts: z.boolean().default(false),
    newLocationAlerts: z.boolean().default(false)
  }).optional(),
  sessionManagement: z.object({
    maxSessions: z.number().default(3),
    autoLogoutMinutes: z.number().default(30),
    activeSessions: z.array(z.object({
      id: z.string(),
      deviceName: z.string(),
      location: z.string(),
      lastActive: z.number()
    })).default([])
  }).optional(),
  ipWhitelist: z.object({
    enabled: z.boolean().default(false),
    allowedIPs: z.array(z.string()).default([])
  }).optional()
});
var attackFlowSchema = z.object({
  step: z.number().default(0),
  // 0: not started, 1: recon, 2: execution, 3: outcome
  tool: z.string().optional(),
  command: z.string().optional(),
  progress: z.number().default(0)
});
var passwordVaultEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  website: z.string().optional(),
  username: z.string().optional(),
  password: z.string(),
  createdAt: z.number(),
  category: z.string().optional()
});
var gameStateSchema = z.object({
  casualUser: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    password: z.string().optional(),
    accountCreated: z.boolean().default(false),
    accountCreationStep: z.number().default(0),
    // 0: not started, 1: profile, 2: credentials, 3: complete
    securityMeasures: z.object({
      twoFactorAuth: z.boolean().default(false),
      strongPassword: z.boolean().default(false),
      emailVerification: z.boolean().default(false),
      securityQuestions: z.boolean().default(false),
      backupEmail: z.boolean().default(false),
      authenticatorApp: z.boolean().default(false),
      smsBackup: z.boolean().default(false),
      trustedDevices: z.boolean().default(false),
      loginAlerts: z.boolean().default(false),
      sessionManagement: z.boolean().default(false),
      ipWhitelist: z.boolean().default(false),
      passwordVault: z.boolean().default(false)
    }),
    securitySetupFlows: securitySetupFlowSchema.default({}),
    securityConfig: securityConfigSchema.default({}),
    passwordVault: z.array(passwordVaultEntrySchema).default([]),
    accountCompromised: z.boolean().default(false)
  }),
  hacker: z.object({
    attacksAttempted: z.number().default(0),
    attacksSuccessful: z.number().default(0),
    activeAttacks: z.array(z.string()).default([]),
    cooldowns: z.record(z.string(), z.number()).default({}),
    attackFlows: z.record(z.string(), attackFlowSchema).default({}),
    // Cursor para rotacionar cenários de engenharia social (0, 1, 2)
    socialEngineeringScenarioCursor: z.number().min(0).max(2).default(0)
  }),
  notifications: z.array(z.object({
    id: z.string(),
    type: z.enum(["phishing", "social_engineering", "password_reset", "suspicious_login", "security_alert", "2fa_confirm", "email_verify_confirm"]),
    title: z.string(),
    message: z.string(),
    isActive: z.boolean().default(true),
    requiresAction: z.boolean().default(false),
    userFellFor: z.boolean().optional(),
    // Campos adicionais para phishing e confirmações
    ctaLabel: z.string().optional(),
    // "Saber Mais", "Confirmar", etc
    ctaType: z.enum(["phishing_learn_more", "confirm_2fa", "confirm_email", "confirm_email_verification"]).optional(),
    // Índice do cenário para engenharia social (0, 1, ou 2)
    scenarioIndex: z.number().min(0).max(2).optional()
  })).default([]),
  vulnerabilityScore: z.number().min(0).max(100).default(100),
  gameStarted: z.boolean().default(false),
  tutorialCompleted: z.boolean().default(false),
  activityLog: z.array(z.object({
    id: z.string(),
    timestamp: z.number(),
    actor: z.enum(["user", "hacker", "system"]),
    action: z.string(),
    detail: z.string().optional()
  })).default([])
});
var attackTypes = [
  {
    id: "social_engineering",
    name: "Engenharia Social",
    description: "Manipular o usu\xE1rio para revelar informa\xE7\xF5es",
    cooldown: 15e3,
    icon: "Users"
  },
  {
    id: "phishing",
    name: "Phishing Email",
    description: "Enviar email falso para roubar credenciais",
    cooldown: 2e4,
    icon: "Mail"
  },
  {
    id: "brute_force",
    name: "For\xE7a Bruta",
    description: "Tentar adivinhar a senha",
    cooldown: 3e4,
    icon: "Lock"
  },
  {
    id: "keylogger",
    name: "Keylogger",
    description: "Capturar as teclas digitadas",
    cooldown: 25e3,
    icon: "Keyboard"
  },
  {
    id: "password_leak",
    name: "Database Leak",
    description: "Explorar vazamento de banco de dados",
    cooldown: 35e3,
    icon: "Database"
  },
  {
    id: "session_hijacking",
    name: "Sequestro de Sess\xE3o",
    description: "Roubar token de sess\xE3o ativo do usu\xE1rio",
    cooldown: 28e3,
    icon: "Cookie"
  },
  {
    id: "man_in_the_middle",
    name: "Man-in-the-Middle",
    description: "Interceptar comunica\xE7\xE3o entre usu\xE1rio e servidor",
    cooldown: 32e3,
    icon: "Network"
  },
  {
    id: "credential_stuffing",
    name: "Credential Stuffing",
    description: "Usar credenciais vazadas de outros sites",
    cooldown: 26e3,
    icon: "KeyRound"
  },
  {
    id: "sim_swap",
    name: "SIM Swap",
    description: "Clonar SIM card para interceptar SMS",
    cooldown: 4e4,
    icon: "Smartphone"
  },
  {
    id: "malware_injection",
    name: "Inje\xE7\xE3o de Malware",
    description: "Infectar dispositivo com software malicioso",
    cooldown: 33e3,
    icon: "Bug"
  },
  {
    id: "dns_spoofing",
    name: "DNS Spoofing",
    description: "Redirecionar para site falso via DNS",
    cooldown: 29e3,
    icon: "Globe"
  },
  {
    id: "zero_day_exploit",
    name: "Zero-Day Exploit",
    description: "Explorar vulnerabilidade desconhecida",
    cooldown: 5e4,
    icon: "Zap"
  }
];
var executeAttackSchema = z.object({
  attackId: z.string()
});
var updateSecuritySchema = z.object({
  measure: z.enum(["twoFactorAuth", "strongPassword", "emailVerification", "securityQuestions", "backupEmail", "authenticatorApp", "smsBackup", "trustedDevices", "loginAlerts", "sessionManagement", "ipWhitelist", "passwordVault"]),
  enabled: z.boolean()
});
var configureSecuritySchema = z.discriminatedUnion("measure", [
  z.object({
    measure: z.literal("strongPassword"),
    config: z.object({
      password: z.string().min(1),
      strength: z.number().min(0).max(100)
    })
  }),
  z.object({
    measure: z.literal("authenticatorApp"),
    config: z.object({
      secret: z.string().min(1),
      recoveryCodes: z.array(z.string()).min(4)
    })
  }),
  z.object({
    measure: z.literal("smsBackup"),
    config: z.object({
      phoneNumber: z.string().min(10),
      verified: z.boolean()
    })
  }),
  z.object({
    measure: z.literal("trustedDevices"),
    config: z.object({
      devices: z.array(z.object({
        id: z.string(),
        name: z.string(),
        fingerprint: z.string(),
        addedAt: z.number()
      }))
    })
  }),
  z.object({
    measure: z.literal("loginAlerts"),
    config: z.object({
      emailAlerts: z.boolean(),
      smsAlerts: z.boolean(),
      newLocationAlerts: z.boolean()
    })
  }),
  z.object({
    measure: z.literal("sessionManagement"),
    config: z.object({
      maxSessions: z.number().min(1).max(10),
      autoLogoutMinutes: z.number().min(5).max(120),
      activeSessions: z.array(z.object({
        id: z.string(),
        deviceName: z.string(),
        location: z.string(),
        lastActive: z.number()
      }))
    })
  }),
  z.object({
    measure: z.literal("ipWhitelist"),
    config: z.object({
      enabled: z.boolean(),
      allowedIPs: z.array(z.string())
    })
  })
]);
var createAccountSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1)
});
var respondToNotificationSchema = z.object({
  notificationId: z.string(),
  accepted: z.boolean()
});
var securityFlowStepSchema = z.object({
  flowType: z.enum(["twoFactorAuth", "securityQuestions", "backupEmail"]),
  step: z.number(),
  data: z.record(z.string(), z.any()).optional()
});
var attackFlowStepSchema = z.object({
  attackId: z.string(),
  step: z.number(),
  data: z.record(z.string(), z.any()).optional()
});
var accountCreationStepSchema = z.object({
  step: z.number(),
  data: z.record(z.string(), z.any()).optional()
});
var savePasswordSchema = z.object({
  title: z.string(),
  website: z.string().optional(),
  username: z.string().optional(),
  password: z.string(),
  category: z.string().optional()
});
var deletePasswordSchema = z.object({
  id: z.string()
});

// server/routes.ts
import { randomUUID } from "crypto";
function addActivityLog(gameState, actor, action, detail) {
  const newLog = {
    id: randomUUID(),
    timestamp: Date.now(),
    actor,
    action,
    detail
  };
  return {
    ...gameState,
    activityLog: [...gameState.activityLog || [], newLog]
  };
}
function calculateVulnerability(gameState) {
  const measures = gameState.casualUser.securityMeasures;
  const config = gameState.casualUser.securityConfig || {};
  let totalReduction = 0;
  if (measures.strongPassword) totalReduction += 10;
  if (measures.twoFactorAuth) totalReduction += 15;
  if (measures.emailVerification) totalReduction += 10;
  if (measures.securityQuestions) totalReduction += 10;
  if (measures.backupEmail) totalReduction += 5;
  if (measures.authenticatorApp) totalReduction += 20;
  if (measures.smsBackup && config.smsBackup?.verified) totalReduction += 12;
  if (measures.trustedDevices && config.trustedDevices?.devices?.length > 0) totalReduction += 15;
  if (measures.loginAlerts && (config.loginAlerts?.emailAlerts || config.loginAlerts?.smsAlerts)) totalReduction += 10;
  if (measures.sessionManagement) totalReduction += 12;
  if (measures.ipWhitelist && config.ipWhitelist?.enabled && config.ipWhitelist?.allowedIPs?.length > 0) totalReduction += 18;
  if (measures.passwordVault && gameState.casualUser.passwordVault?.length >= 3) totalReduction += 8;
  const vulnerability = Math.max(0, Math.min(100, 100 - totalReduction));
  return vulnerability;
}
function calculatePasswordStrength(password) {
  let strength = 0;
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 20;
  if (/[a-z]/.test(password)) strength += 20;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 10;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
  return Math.min(strength, 100);
}
function getAttackSuccessChance(attackId, gameState) {
  const measures = gameState.casualUser.securityMeasures;
  const config = gameState.casualUser.securityConfig || {};
  const passwordStrength = calculatePasswordStrength(gameState.casualUser.password || "");
  let baseChance = 70;
  switch (attackId) {
    case "brute_force":
      baseChance = 80;
      if (measures.authenticatorApp) baseChance = Math.max(0, baseChance - 70);
      if (measures.twoFactorAuth) baseChance = Math.max(0, baseChance - 60);
      if (measures.strongPassword || passwordStrength >= 80) baseChance -= 40;
      if (measures.ipWhitelist && config.ipWhitelist?.enabled) baseChance -= 20;
      if (measures.sessionManagement) baseChance -= 15;
      break;
    case "phishing":
      baseChance = 70;
      if (measures.authenticatorApp) baseChance -= 40;
      if (measures.twoFactorAuth) baseChance -= 30;
      if (measures.emailVerification) baseChance -= 25;
      if (measures.loginAlerts && config.loginAlerts?.emailAlerts) baseChance -= 20;
      if (measures.trustedDevices && config.trustedDevices?.devices?.length > 0) baseChance -= 15;
      break;
    case "social_engineering":
      baseChance = 65;
      if (measures.securityQuestions) baseChance -= 20;
      if (measures.twoFactorAuth) baseChance -= 25;
      if (measures.loginAlerts && (config.loginAlerts?.emailAlerts || config.loginAlerts?.smsAlerts)) baseChance -= 20;
      break;
    case "keylogger":
      baseChance = 60;
      if (measures.authenticatorApp) baseChance -= 30;
      if (measures.twoFactorAuth) baseChance -= 25;
      if (measures.sessionManagement) baseChance -= 15;
      break;
    case "password_leak":
      baseChance = 75;
      if (measures.authenticatorApp) baseChance -= 50;
      if (measures.twoFactorAuth) baseChance -= 40;
      if (measures.strongPassword) baseChance -= 20;
      if (measures.smsBackup && config.smsBackup?.verified) baseChance -= 15;
      break;
    default:
      baseChance = 50;
  }
  return Math.max(0, Math.min(100, baseChance));
}
function createNotification(attackId, gameState) {
  const notifications = {
    phishing: {
      type: "phishing",
      title: "Novo Email Recebido",
      message: "Voc\xEA ganhou um pr\xEAmio! Clique aqui para resgatar agora. Confirme seus dados para receber.",
      requiresAction: true,
      ctaLabel: "Saber Mais",
      ctaType: "phishing_learn_more"
    },
    social_engineering: {
      type: "social_engineering",
      title: "Nova Conversa",
      message: "Voc\xEA tem uma nova mensagem. Clique para visualizar.",
      requiresAction: true,
      scenarioIndex: gameState.hacker.socialEngineeringScenarioCursor
    },
    brute_force: {
      type: "security_alert",
      title: "Alerta de Seguran\xE7a",
      message: "M\xFAltiplas tentativas de login detectadas. Seu acesso pode estar em risco.",
      requiresAction: false
    },
    keylogger: {
      type: "suspicious_login",
      title: "Download Autom\xE1tico",
      message: "Um programa est\xE1 tentando se instalar no seu computador. Permitir?",
      requiresAction: true
    },
    password_leak: {
      type: "security_alert",
      title: "Vazamento de Dados",
      message: "Sua senha pode ter sido exposta em um vazamento de dados recente. Considere alter\xE1-la.",
      requiresAction: false
    }
  };
  const template = notifications[attackId] || notifications.phishing;
  return {
    id: randomUUID(),
    ...template,
    isActive: true,
    userFellFor: void 0
  };
}
async function registerRoutes(app2) {
  app2.get("/api/game-state", async (req, res) => {
    try {
      const gameState = getGameState(req.session);
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to get game state" });
    }
  });
  app2.post("/api/game/start", async (req, res) => {
    try {
      resetGameState(req.session);
      const gameState = updateGameState(req.session, {
        gameStarted: true,
        tutorialCompleted: true
      });
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to start game" });
    }
  });
  app2.post("/api/tutorial/complete", async (req, res) => {
    try {
      const gameState = updateGameState(req.session, {
        tutorialCompleted: true
      });
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete tutorial" });
    }
  });
  app2.post("/api/account/create", async (req, res) => {
    try {
      const result = createAccountSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      const { name, email, password } = result.data;
      const passwordStrength = calculatePasswordStrength(password);
      const currentState = getGameState(req.session);
      let gameState = updateGameState(req.session, {
        casualUser: {
          ...currentState.casualUser,
          name,
          email,
          password,
          accountCreated: true,
          securityMeasures: {
            ...currentState.casualUser.securityMeasures,
            strongPassword: passwordStrength >= 80
          }
        }
      });
      gameState = addActivityLog(gameState, "user", "Conta criada", `Nome: ${name}, Email: ${email}, For\xE7a da senha: ${passwordStrength}%`);
      const updatedState = updateGameState(req.session, {
        ...gameState,
        vulnerabilityScore: calculateVulnerability(gameState)
      });
      res.json(updatedState);
    } catch (error) {
      res.status(500).json({ error: "Failed to create account" });
    }
  });
  app2.post("/api/security/update", async (req, res) => {
    try {
      const result = updateSecuritySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      const { measure, enabled } = result.data;
      const currentState = getGameState(req.session);
      let gameState = updateGameState(req.session, {
        casualUser: {
          ...currentState.casualUser,
          securityMeasures: {
            ...currentState.casualUser.securityMeasures,
            [measure]: enabled
          }
        }
      });
      const measureNames = {
        twoFactorAuth: "Autentica\xE7\xE3o de Dois Fatores",
        strongPassword: "Senha Forte",
        emailVerification: "Verifica\xE7\xE3o de Email",
        securityQuestions: "Perguntas de Seguran\xE7a",
        backupEmail: "Email de Recupera\xE7\xE3o",
        authenticatorApp: "Aplicativo Autenticador",
        smsBackup: "Backup por SMS",
        trustedDevices: "Dispositivos Confi\xE1veis",
        loginAlerts: "Alertas de Login",
        sessionManagement: "Gerenciamento de Sess\xE3o",
        ipWhitelist: "Lista de IPs Permitidos",
        passwordVault: "Cofre de Senhas"
      };
      gameState = addActivityLog(
        gameState,
        "user",
        enabled ? "Prote\xE7\xE3o ativada" : "Prote\xE7\xE3o desativada",
        measureNames[measure] || measure
      );
      const updatedState = updateGameState(req.session, {
        ...gameState,
        vulnerabilityScore: calculateVulnerability(gameState)
      });
      res.json(updatedState);
    } catch (error) {
      res.status(500).json({ error: "Failed to update security" });
    }
  });
  app2.post("/api/security/strong-password", async (req, res) => {
    try {
      const { password, strength: clientStrength } = req.body;
      if (!password || typeof password !== "string") {
        return res.status(400).json({ error: "Password is required" });
      }
      const currentState = getGameState(req.session);
      const strength = clientStrength || calculatePasswordStrength(password);
      const updatedUser = {
        ...currentState.casualUser,
        password,
        securityMeasures: {
          ...currentState.casualUser.securityMeasures,
          strongPassword: strength >= 60
          // Ativa se força >= 60%
        },
        securityConfig: {
          ...currentState.casualUser.securityConfig,
          strongPassword: { password, strength }
        }
      };
      const gameState = updateGameState(req.session, {
        casualUser: updatedUser
      });
      const updatedState = updateGameState(req.session, {
        vulnerabilityScore: calculateVulnerability(gameState)
      });
      res.json(updatedState);
    } catch (error) {
      res.status(500).json({ error: "Failed to configure strong password" });
    }
  });
  app2.post("/api/security/security-question", async (req, res) => {
    try {
      const { question, answer } = req.body;
      if (!question || !answer) {
        return res.status(400).json({ error: "Question and answer are required" });
      }
      const currentState = getGameState(req.session);
      const updatedUser = {
        ...currentState.casualUser,
        securityMeasures: {
          ...currentState.casualUser.securityMeasures,
          securityQuestions: true
        },
        securityConfig: {
          ...currentState.casualUser.securityConfig,
          securityQuestion: { question, answer }
        }
      };
      const gameState = updateGameState(req.session, {
        casualUser: updatedUser
      });
      const updatedState = updateGameState(req.session, {
        vulnerabilityScore: calculateVulnerability(gameState)
      });
      res.json(updatedState);
    } catch (error) {
      res.status(500).json({ error: "Failed to configure security question" });
    }
  });
  app2.post("/api/security/two-factor", async (req, res) => {
    try {
      const currentState = getGameState(req.session);
      const existingNotification = currentState.notifications.find(
        (n) => n.isActive && n.requiresAction && n.ctaType === "confirm_2fa"
      );
      if (existingNotification) {
        return res.json(currentState);
      }
      const notification = {
        id: randomUUID(),
        type: "2fa_confirm",
        title: "Ativar Autentica\xE7\xE3o de Dois Fatores",
        message: "Voc\xEA est\xE1 prestes a ativar a Autentica\xE7\xE3o de Dois Fatores (2FA). Esta medida adicionar\xE1 uma camada extra de seguran\xE7a \xE0 sua conta, exigindo um c\xF3digo de verifica\xE7\xE3o al\xE9m da sua senha. Clique em Confirmar para ativar.",
        isActive: true,
        requiresAction: true,
        userFellFor: void 0,
        ctaLabel: "Confirmar",
        ctaType: "confirm_2fa"
      };
      const updatedState = updateGameState(req.session, {
        notifications: [...currentState.notifications, notification]
      });
      res.json(updatedState);
    } catch (error) {
      res.status(500).json({ error: "Failed to configure two factor auth" });
    }
  });
  app2.post("/api/security/email-verification", async (req, res) => {
    try {
      const currentState = getGameState(req.session);
      const existingNotification = currentState.notifications.find(
        (n) => n.isActive && n.requiresAction && n.ctaType === "confirm_email_verification"
      );
      if (existingNotification) {
        return res.json(currentState);
      }
      const notification = {
        id: randomUUID(),
        type: "email_verify_confirm",
        title: "Ativar Verifica\xE7\xE3o de Email",
        message: `Enviamos um c\xF3digo de verifica\xE7\xE3o para ${currentState.casualUser.email || "seu email"}. Confirme para verificar sua identidade e aumentar a seguran\xE7a da conta.`,
        isActive: true,
        requiresAction: true,
        userFellFor: void 0,
        ctaLabel: "Confirmar",
        ctaType: "confirm_email_verification"
      };
      const updatedState = updateGameState(req.session, {
        notifications: [...currentState.notifications, notification]
      });
      res.json(updatedState);
    } catch (error) {
      res.status(500).json({ error: "Failed to configure email verification" });
    }
  });
  app2.post("/api/security/recovery-email", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email is required" });
      }
      const currentState = getGameState(req.session);
      const notification = {
        id: randomUUID(),
        type: "email_verify_confirm",
        title: "Confirmar Email de Recupera\xE7\xE3o",
        message: `Enviamos um c\xF3digo de verifica\xE7\xE3o para ${email}. Clique em Confirmar para ativar o email de recupera\xE7\xE3o e aumentar sua seguran\xE7a.`,
        isActive: true,
        requiresAction: true,
        userFellFor: void 0,
        ctaLabel: "Confirmar",
        ctaType: "confirm_email"
      };
      const updatedUser = {
        ...currentState.casualUser,
        securityConfig: {
          ...currentState.casualUser.securityConfig,
          recoveryEmail: { email, verified: false }
          // Aguardando confirmação
        }
      };
      const updatedState = updateGameState(req.session, {
        casualUser: updatedUser,
        notifications: [...currentState.notifications, notification]
      });
      res.json(updatedState);
    } catch (error) {
      res.status(500).json({ error: "Failed to configure recovery email" });
    }
  });
  app2.post("/api/security/configure", async (req, res) => {
    try {
      const result = configureSecuritySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request data", details: result.error });
      }
      const { measure, config } = result.data;
      const currentState = getGameState(req.session);
      const currentConfig = currentState.casualUser.securityConfig?.[measure];
      let mergedConfig = { ...config };
      if (measure === "trustedDevices" && currentConfig && "devices" in currentConfig && "devices" in config) {
        const existingDevices = currentConfig.devices || [];
        const newDevices = config.devices || [];
        const existingIds = new Set(existingDevices.map((d) => d.id));
        const uniqueNewDevices = newDevices.filter((d) => !existingIds.has(d.id));
        mergedConfig = {
          devices: [...existingDevices, ...uniqueNewDevices]
        };
      } else if (measure === "ipWhitelist" && currentConfig && "allowedIPs" in currentConfig && "allowedIPs" in config) {
        const existingIPs = currentConfig.allowedIPs || [];
        const newIPs = config.allowedIPs || [];
        const ipSet = /* @__PURE__ */ new Set([...existingIPs, ...newIPs]);
        const uniqueIPs = Array.from(ipSet);
        mergedConfig = {
          enabled: config.enabled,
          allowedIPs: uniqueIPs
        };
      }
      let isEnabled = true;
      if (measure === "ipWhitelist" && "enabled" in config) {
        isEnabled = config.enabled;
      } else if (measure === "loginAlerts" && "emailAlerts" in config) {
        isEnabled = config.emailAlerts || config.smsAlerts || config.newLocationAlerts;
      }
      const gameState = updateGameState(req.session, {
        casualUser: {
          ...currentState.casualUser,
          securityMeasures: {
            ...currentState.casualUser.securityMeasures,
            [measure]: isEnabled
          },
          securityConfig: {
            ...currentState.casualUser.securityConfig,
            [measure]: mergedConfig
          }
        }
      });
      const updatedState = updateGameState(req.session, {
        vulnerabilityScore: calculateVulnerability(gameState)
      });
      res.json(updatedState);
    } catch (error) {
      res.status(500).json({ error: "Failed to configure security" });
    }
  });
  app2.post("/api/attack/execute", async (req, res) => {
    try {
      const result = executeAttackSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      const { attackId } = result.data;
      const attack = attackTypes.find((a) => a.id === attackId);
      if (!attack) {
        return res.status(404).json({ error: "Attack not found" });
      }
      const currentState = getGameState(req.session);
      if (currentState.hacker.cooldowns[attackId] && currentState.hacker.cooldowns[attackId] > Date.now()) {
        return res.status(400).json({ error: "Attack on cooldown" });
      }
      const successChance = getAttackSuccessChance(attackId, currentState);
      const isSuccessful = Math.random() * 100 < successChance;
      const notification = createNotification(attackId, currentState);
      const newCooldowns = { ...currentState.hacker.cooldowns };
      newCooldowns[attackId] = Date.now() + attack.cooldown;
      const newScenarioCursor = attackId === "social_engineering" ? (currentState.hacker.socialEngineeringScenarioCursor + 1) % 3 : currentState.hacker.socialEngineeringScenarioCursor;
      let gameState = updateGameState(req.session, {
        hacker: {
          ...currentState.hacker,
          attacksAttempted: currentState.hacker.attacksAttempted + 1,
          attacksSuccessful: isSuccessful ? currentState.hacker.attacksSuccessful + 1 : currentState.hacker.attacksSuccessful,
          cooldowns: newCooldowns,
          socialEngineeringScenarioCursor: newScenarioCursor
        },
        notifications: [...currentState.notifications, notification],
        casualUser: {
          ...currentState.casualUser,
          accountCompromised: isSuccessful || currentState.casualUser.accountCompromised
        }
      });
      gameState = addActivityLog(
        gameState,
        "hacker",
        `Ataque executado: ${attack.name}`,
        `${isSuccessful ? "Sucesso!" : "Falhou."} Chance de sucesso: ${Math.round(successChance)}%`
      );
      const finalState = updateGameState(req.session, gameState);
      res.json(finalState);
    } catch (error) {
      res.status(500).json({ error: "Failed to execute attack" });
    }
  });
  app2.post("/api/notification/respond", async (req, res) => {
    try {
      const result = respondToNotificationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      const { notificationId, accepted } = result.data;
      const currentState = getGameState(req.session);
      const notification = currentState.notifications.find((n) => n.id === notificationId);
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      const updatedNotifications = currentState.notifications.map(
        (n) => n.id === notificationId ? { ...n, isActive: false, userFellFor: accepted } : n
      );
      let accountCompromised = currentState.casualUser.accountCompromised;
      let updatedUser = currentState.casualUser;
      if (accepted && notification.type === "phishing") {
        accountCompromised = true;
      } else if (accepted && notification.type === "social_engineering") {
        accountCompromised = true;
      } else if (accepted && notification.type === "suspicious_login") {
        accountCompromised = true;
      }
      if (accepted && notification.ctaType === "confirm_email") {
        const recoveryEmail = currentState.casualUser.securityConfig?.recoveryEmail;
        if (recoveryEmail) {
          updatedUser = {
            ...currentState.casualUser,
            accountCompromised,
            securityMeasures: {
              ...currentState.casualUser.securityMeasures,
              backupEmail: true
            },
            securityConfig: {
              ...currentState.casualUser.securityConfig,
              recoveryEmail: {
                ...recoveryEmail,
                verified: true
              }
            }
          };
        }
      } else if (accepted && notification.ctaType === "confirm_2fa") {
        updatedUser = {
          ...currentState.casualUser,
          accountCompromised,
          securityMeasures: {
            ...currentState.casualUser.securityMeasures,
            twoFactorAuth: true
          }
        };
      } else if (accepted && notification.ctaType === "confirm_email_verification") {
        updatedUser = {
          ...currentState.casualUser,
          accountCompromised,
          securityMeasures: {
            ...currentState.casualUser.securityMeasures,
            emailVerification: true
          }
        };
      } else {
        updatedUser = {
          ...currentState.casualUser,
          accountCompromised
        };
      }
      const tempState = {
        ...currentState,
        casualUser: updatedUser
      };
      const newVulnerability = calculateVulnerability(tempState);
      const gameState = updateGameState(req.session, {
        notifications: updatedNotifications,
        casualUser: updatedUser,
        vulnerabilityScore: newVulnerability
      });
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to respond to notification" });
    }
  });
  app2.post("/api/account/step", async (req, res) => {
    try {
      const result = accountCreationStepSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      const { step, data } = result.data;
      const currentState = getGameState(req.session);
      const gameState = updateGameState(req.session, {
        casualUser: {
          ...currentState.casualUser,
          accountCreationStep: step,
          ...data || {}
        }
      });
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to update account step" });
    }
  });
  app2.post("/api/security/flow", async (req, res) => {
    try {
      const result = securityFlowStepSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      const { flowType, step, data } = result.data;
      const currentState = getGameState(req.session);
      const updatedFlows = {
        ...currentState.casualUser.securitySetupFlows,
        [flowType]: {
          ...currentState.casualUser.securitySetupFlows[flowType] || {},
          step,
          ...data || {}
        }
      };
      const gameState = updateGameState(req.session, {
        casualUser: {
          ...currentState.casualUser,
          securitySetupFlows: updatedFlows
        }
      });
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to update security flow" });
    }
  });
  app2.post("/api/attack/step", async (req, res) => {
    try {
      const result = attackFlowStepSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      const { attackId, step, data } = result.data;
      const currentState = getGameState(req.session);
      const updatedFlows = {
        ...currentState.hacker.attackFlows,
        [attackId]: {
          ...currentState.hacker.attackFlows[attackId] || {},
          step,
          progress: 0,
          ...data || {}
        }
      };
      const gameState = updateGameState(req.session, {
        hacker: {
          ...currentState.hacker,
          attackFlows: updatedFlows
        }
      });
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to update attack step" });
    }
  });
  app2.post("/api/passwords/save", async (req, res) => {
    try {
      const result = savePasswordSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      const currentState = getGameState(req.session);
      const newPassword = {
        id: randomUUID(),
        ...result.data,
        createdAt: Date.now()
      };
      const newVault = [...currentState.casualUser.passwordVault, newPassword];
      const shouldActivateVault = newVault.length >= 3 && !currentState.casualUser.securityMeasures.passwordVault;
      const activityLog = [
        ...currentState.activityLog,
        {
          id: randomUUID(),
          timestamp: Date.now(),
          actor: "user",
          action: "Senha salva no cofre",
          detail: `"${result.data.title}" adicionada ao cofre de senhas`
        }
      ];
      if (shouldActivateVault) {
        activityLog.push({
          id: randomUUID(),
          timestamp: Date.now(),
          actor: "system",
          action: "Cofre de Senhas ativado",
          detail: "3 ou mais senhas armazenadas - b\xF4nus de seguran\xE7a aplicado"
        });
      }
      const gameState = updateGameState(req.session, {
        casualUser: {
          ...currentState.casualUser,
          passwordVault: newVault,
          securityMeasures: {
            ...currentState.casualUser.securityMeasures,
            passwordVault: shouldActivateVault || currentState.casualUser.securityMeasures.passwordVault
          }
        },
        activityLog
      });
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to save password" });
    }
  });
  app2.post("/api/passwords/delete", async (req, res) => {
    try {
      const result = deletePasswordSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      const { id } = result.data;
      const currentState = getGameState(req.session);
      const deletedPassword = currentState.casualUser.passwordVault.find((p) => p.id === id);
      const newVault = currentState.casualUser.passwordVault.filter((p) => p.id !== id);
      const shouldDeactivateVault = newVault.length < 3 && currentState.casualUser.securityMeasures.passwordVault;
      const activityLog = [
        ...currentState.activityLog,
        {
          id: randomUUID(),
          timestamp: Date.now(),
          actor: "user",
          action: "Senha removida do cofre",
          detail: deletedPassword ? `"${deletedPassword.title}" removida` : "Senha removida"
        }
      ];
      if (shouldDeactivateVault) {
        activityLog.push({
          id: randomUUID(),
          timestamp: Date.now(),
          actor: "system",
          action: "Cofre de Senhas desativado",
          detail: "Menos de 3 senhas - b\xF4nus de seguran\xE7a removido"
        });
      }
      const gameState = updateGameState(req.session, {
        casualUser: {
          ...currentState.casualUser,
          passwordVault: newVault,
          securityMeasures: {
            ...currentState.casualUser.securityMeasures,
            passwordVault: !shouldDeactivateVault && currentState.casualUser.securityMeasures.passwordVault
          }
        },
        activityLog
      });
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete password" });
    }
  });
  app2.post("/api/passwords/generate", async (req, res) => {
    try {
      const { length = 16, includeSymbols = true, includeNumbers = true } = req.body;
      const lowercase = "abcdefghijklmnopqrstuvwxyz";
      const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const numbers = "0123456789";
      const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
      let chars = lowercase + uppercase;
      if (includeNumbers) chars += numbers;
      if (includeSymbols) chars += symbols;
      let password = "";
      for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      res.json({ password });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate password" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
import { fileURLToPath as fileURLToPath2 } from "url";
var __dirname2 = path2.dirname(fileURLToPath2(import.meta.url));
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath, {
    maxAge: "1h",
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith("index.html")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      }
    }
  }));
  app2.use("*", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
var MemoryStore = createMemoryStore(session);
var sessionSecret = process.env.SESSION_SECRET || "dev-secret-change-in-production";
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  store: new MemoryStore({
    checkPeriod: 864e5
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1e3,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }
}));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  const listenOptions = {
    port,
    host: "0.0.0.0"
  };
  if (process.platform !== "win32") {
    listenOptions.reusePort = true;
  }
  const onListening = () => {
    log(`serving on port ${port}`);
  };
  server.listen(listenOptions, onListening).on("error", (err) => {
    if (err && err.code === "ENOTSUP" && listenOptions.reusePort) {
      log("reusePort not supported on this platform, retrying without it");
      const fallbackOptions = { port, host: "0.0.0.0" };
      server.listen(fallbackOptions, onListening);
    } else {
      throw err;
    }
  });
})();

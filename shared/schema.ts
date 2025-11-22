/**
 * Schemas e Tipos do Jogo de Segurança Digital
 * 
 * Este arquivo define todos os schemas Zod e tipos TypeScript usados
 * tanto no backend quanto no frontend da aplicação.
 * 
 * Principais schemas:
 * - GameState: Estado completo do jogo
 * - Notifications: Notificações e alertas para o usuário
 * - SecurityMeasures: Medidas de segurança disponíveis
 * - AttackTypes: Tipos de ataques do hacker
 */

import { z } from "zod";

// Schemas de fluxos multi-etapa para configurações de segurança
export const securitySetupFlowSchema = z.object({
  twoFactorAuth: z.object({
    step: z.number().default(0), // 0: not started, 1: choose method, 2: enter code, 3: save recovery codes, 4: complete
    method: z.enum(['app', 'sms']).optional(),
    code: z.string().optional(),
    completed: z.boolean().default(false),
  }).optional(),
  securityQuestions: z.object({
    step: z.number().default(0),
    question: z.string().optional(),
    answer: z.string().optional(),
    completed: z.boolean().default(false),
  }).optional(),
  backupEmail: z.object({
    step: z.number().default(0),
    email: z.string().optional(),
    verificationCode: z.string().optional(),
    completed: z.boolean().default(false),
  }).optional(),
});

// Security Configurations (data filled in modals)
export const securityConfigSchema = z.object({
  // Configuração de senha forte
  strongPassword: z.object({
    password: z.string().optional(),
    strength: z.number().optional(),
  }).optional(),
  // Configuração de perguntas de segurança
  securityQuestion: z.object({
    question: z.string().optional(),
    answer: z.string().optional(),
  }).optional(),
  // Configuração de email de recuperação
  recoveryEmail: z.object({
    email: z.string().optional(),
    verified: z.boolean().default(false),
  }).optional(),
  authenticatorApp: z.object({
    secret: z.string().optional(),
    recoveryCodes: z.array(z.string()).optional(),
  }).optional(),
  smsBackup: z.object({
    phoneNumber: z.string().optional(),
    verified: z.boolean().default(false),
  }).optional(),
  trustedDevices: z.object({
    devices: z.array(z.object({
      id: z.string(),
      name: z.string(),
      fingerprint: z.string(),
      addedAt: z.number(),
    })).default([]),
  }).optional(),
  loginAlerts: z.object({
    emailAlerts: z.boolean().default(false),
    smsAlerts: z.boolean().default(false),
    newLocationAlerts: z.boolean().default(false),
  }).optional(),
  sessionManagement: z.object({
    maxSessions: z.number().default(3),
    autoLogoutMinutes: z.number().default(30),
    activeSessions: z.array(z.object({
      id: z.string(),
      deviceName: z.string(),
      location: z.string(),
      lastActive: z.number(),
    })).default([]),
  }).optional(),
  ipWhitelist: z.object({
    enabled: z.boolean().default(false),
    allowedIPs: z.array(z.string()).default([]),
  }).optional(),
});

export const attackFlowSchema = z.object({
  step: z.number().default(0), // 0: not started, 1: recon, 2: execution, 3: outcome
  tool: z.string().optional(),
  command: z.string().optional(),
  progress: z.number().default(0),
});

// Password Vault Schema
export const passwordVaultEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  website: z.string().optional(),
  username: z.string().optional(),
  password: z.string(),
  createdAt: z.number(),
  category: z.string().optional(),
});

export type PasswordVaultEntry = z.infer<typeof passwordVaultEntrySchema>;

// Game State Schema
export const gameStateSchema = z.object({
  casualUser: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    password: z.string().optional(),
    accountCreated: z.boolean().default(false),
    accountCreationStep: z.number().default(0), // 0: not started, 1: profile, 2: credentials, 3: complete
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
      passwordVault: z.boolean().default(false),
    }),
    securitySetupFlows: securitySetupFlowSchema.default({}),
    securityConfig: securityConfigSchema.default({}),
    passwordVault: z.array(passwordVaultEntrySchema).default([]),
    accountCompromised: z.boolean().default(false),
  }),
  hacker: z.object({
    attacksAttempted: z.number().default(0),
    attacksSuccessful: z.number().default(0),
    activeAttacks: z.array(z.string()).default([]),
    cooldowns: z.record(z.string(), z.number()).default({}),
    attackFlows: z.record(z.string(), attackFlowSchema).default({}),
    // Cursor para rotacionar cenários de engenharia social (0, 1, 2)
    socialEngineeringScenarioCursor: z.number().min(0).max(2).default(0),
  }),
  notifications: z.array(z.object({
    id: z.string(),
    type: z.enum(['phishing', 'social_engineering', 'password_reset', 'suspicious_login', 'security_alert', '2fa_confirm', 'email_verify_confirm', 'weak_password_warning']),
    title: z.string(),
    message: z.string(),
    isActive: z.boolean().default(true),
    requiresAction: z.boolean().default(false),
    userFellFor: z.boolean().optional(),
    // Campos adicionais para phishing e confirmações
    ctaLabel: z.string().optional(), // "Saber Mais", "Confirmar", etc
    ctaType: z.enum(['phishing_learn_more', 'confirm_2fa', 'confirm_email', 'confirm_email_verification']).optional(),
    // Índice do cenário para engenharia social (0, 1, ou 2)
    scenarioIndex: z.number().min(0).max(2).optional(),
    // Força da senha para notificações de senha fraca
    passwordStrength: z.number().optional(),
  })).default([]),
  vulnerabilityScore: z.number().min(0).max(100).default(100),
  gameStarted: z.boolean().default(false),
  tutorialCompleted: z.boolean().default(false),
  activityLog: z.array(z.object({
    id: z.string(),
    timestamp: z.number(),
    actor: z.enum(['user', 'hacker', 'system']),
    action: z.string(),
    detail: z.string().optional(),
  })).default([]),
});

export type GameState = z.infer<typeof gameStateSchema>;

// Attack Types
export const attackTypes = [
  {
    id: 'social_engineering',
    name: 'Engenharia Social',
    description: 'Manipular o usuário para revelar informações',
    cooldown: 15000,
    icon: 'Users',
  },
  {
    id: 'phishing',
    name: 'Phishing Email',
    description: 'Enviar email falso para roubar credenciais',
    cooldown: 20000,
    icon: 'Mail',
  },
  {
    id: 'brute_force',
    name: 'Força Bruta',
    description: 'Tentar adivinhar a senha',
    cooldown: 30000,
    icon: 'Lock',
  },
  {
    id: 'keylogger',
    name: 'Keylogger',
    description: 'Capturar as teclas digitadas',
    cooldown: 25000,
    icon: 'Keyboard',
  },
  {
    id: 'password_leak',
    name: 'Database Leak',
    description: 'Explorar vazamento de banco de dados',
    cooldown: 35000,
    icon: 'Database',
  },
  {
    id: 'session_hijacking',
    name: 'Sequestro de Sessão',
    description: 'Roubar token de sessão ativo do usuário',
    cooldown: 28000,
    icon: 'Cookie',
  },
  {
    id: 'man_in_the_middle',
    name: 'Man-in-the-Middle',
    description: 'Interceptar comunicação entre usuário e servidor',
    cooldown: 32000,
    icon: 'Network',
  },
  {
    id: 'credential_stuffing',
    name: 'Credential Stuffing',
    description: 'Usar credenciais vazadas de outros sites',
    cooldown: 26000,
    icon: 'KeyRound',
  },
  {
    id: 'sim_swap',
    name: 'SIM Swap',
    description: 'Clonar SIM card para interceptar SMS',
    cooldown: 40000,
    icon: 'Smartphone',
  },
  {
    id: 'malware_injection',
    name: 'Injeção de Malware',
    description: 'Infectar dispositivo com software malicioso',
    cooldown: 33000,
    icon: 'Bug',
  },
  {
    id: 'dns_spoofing',
    name: 'DNS Spoofing',
    description: 'Redirecionar para site falso via DNS',
    cooldown: 29000,
    icon: 'Globe',
  },
  {
    id: 'zero_day_exploit',
    name: 'Zero-Day Exploit',
    description: 'Explorar vulnerabilidade desconhecida',
    cooldown: 50000,
    icon: 'Zap',
  },
] as const;

export type AttackType = typeof attackTypes[number];

// API Request/Response Types
export const executeAttackSchema = z.object({
  attackId: z.string(),
});

export const updateSecuritySchema = z.object({
  measure: z.enum(['twoFactorAuth', 'strongPassword', 'emailVerification', 'securityQuestions', 'backupEmail', 'authenticatorApp', 'smsBackup', 'trustedDevices', 'loginAlerts', 'sessionManagement', 'ipWhitelist', 'passwordVault']),
  enabled: z.boolean(),
});

export const configureSecuritySchema = z.discriminatedUnion('measure', [
  z.object({
    measure: z.literal('strongPassword'),
    config: z.object({
      password: z.string().min(1),
      strength: z.number().min(0).max(100),
    }),
  }),
  z.object({
    measure: z.literal('authenticatorApp'),
    config: z.object({
      secret: z.string().min(1),
      recoveryCodes: z.array(z.string()).min(4),
    }),
  }),
  z.object({
    measure: z.literal('smsBackup'),
    config: z.object({
      phoneNumber: z.string().min(10),
      verified: z.boolean(),
    }),
  }),
  z.object({
    measure: z.literal('trustedDevices'),
    config: z.object({
      devices: z.array(z.object({
        id: z.string(),
        name: z.string(),
        fingerprint: z.string(),
        addedAt: z.number(),
      })),
    }),
  }),
  z.object({
    measure: z.literal('loginAlerts'),
    config: z.object({
      emailAlerts: z.boolean(),
      smsAlerts: z.boolean(),
      newLocationAlerts: z.boolean(),
    }),
  }),
  z.object({
    measure: z.literal('sessionManagement'),
    config: z.object({
      maxSessions: z.number().min(1).max(10),
      autoLogoutMinutes: z.number().min(5).max(120),
      activeSessions: z.array(z.object({
        id: z.string(),
        deviceName: z.string(),
        location: z.string(),
        lastActive: z.number(),
      })),
    }),
  }),
  z.object({
    measure: z.literal('ipWhitelist'),
    config: z.object({
      enabled: z.boolean(),
      allowedIPs: z.array(z.string()),
    }),
  }),
]);

export const createAccountSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
});

export const respondToNotificationSchema = z.object({
  notificationId: z.string(),
  accepted: z.boolean(),
});

export const securityFlowStepSchema = z.object({
  flowType: z.enum(['twoFactorAuth', 'securityQuestions', 'backupEmail']),
  step: z.number(),
  data: z.record(z.string(), z.any()).optional(),
});

export const attackFlowStepSchema = z.object({
  attackId: z.string(),
  step: z.number(),
  data: z.record(z.string(), z.any()).optional(),
});

export const accountCreationStepSchema = z.object({
  step: z.number(),
  data: z.record(z.string(), z.any()).optional(),
});

export const savePasswordSchema = z.object({
  title: z.string(),
  website: z.string().optional(),
  username: z.string().optional(),
  password: z.string(),
  category: z.string().optional(),
});

export const deletePasswordSchema = z.object({
  id: z.string(),
});

export type ExecuteAttackRequest = z.infer<typeof executeAttackSchema>;
export type UpdateSecurityRequest = z.infer<typeof updateSecuritySchema>;
export type ConfigureSecurityRequest = z.infer<typeof configureSecuritySchema>;
export type CreateAccountRequest = z.infer<typeof createAccountSchema>;
export type RespondToNotificationRequest = z.infer<typeof respondToNotificationSchema>;
export type SecurityFlowStepRequest = z.infer<typeof securityFlowStepSchema>;
export type AttackFlowStepRequest = z.infer<typeof attackFlowStepSchema>;
export type AccountCreationStepRequest = z.infer<typeof accountCreationStepSchema>;
export type SavePasswordRequest = z.infer<typeof savePasswordSchema>;
export type DeletePasswordRequest = z.infer<typeof deletePasswordSchema>;

/**
 * Rotas da API do Jogo de Segurança Digital
 * 
 * Este arquivo define todas as rotas HTTP da aplicação, incluindo:
 * - Gerenciamento do estado do jogo
 * - Criação e configuração de conta de usuário
 * - Configuração de medidas de segurança
 * - Execução de ataques do hacker
 * - Resposta a notificações
 * 
 * A aplicação usa armazenamento em memória (storage.ts) para simplicidade educacional.
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import { getGameState, updateGameState, resetGameState } from "./storage";
import {
  executeAttackSchema,
  updateSecuritySchema,
  configureSecuritySchema,
  createAccountSchema,
  respondToNotificationSchema,
  securityFlowStepSchema,
  attackFlowStepSchema,
  accountCreationStepSchema,
  savePasswordSchema,
  deletePasswordSchema,
  attackTypes,
} from "@shared/schema";
import { randomUUID } from "crypto";

/**
 * Adiciona uma entrada ao log de atividades
 */
function addActivityLog(gameState: any, actor: 'user' | 'hacker' | 'system', action: string, detail?: string) {
  const newLog = {
    id: randomUUID(),
    timestamp: Date.now(),
    actor,
    action,
    detail,
  };
  
  return {
    ...gameState,
    activityLog: [...(gameState.activityLog || []), newLog],
  };
}

/**
 * Calcula o nível de vulnerabilidade do usuário (0-100%)
 * 
 * Cada medida de segurança ativa reduz a vulnerabilidade:
 * - Senha forte: -10%
 * - 2FA: -15%
 * - Verificação de email: -10%
 * - Perguntas de segurança: -10%
 * - Email de recuperação: -5%
 * - Aplicativo autenticador: -20%
 * - SMS backup: -12% (se verificado)
 * - Dispositivos confiáveis: -15% (se configurados)
 * - Alertas de login: -10% (se configurados)
 * - Gerenciamento de sessão: -12%
 * - Lista de IPs permitidos: -18% (se ativa e com IPs)
 */
function calculateVulnerability(gameState: any): number {
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

function calculatePasswordStrength(password: string): number {
  let strength = 0;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 20;
  if (hasLowercase) strength += 20;
  if (hasUppercase) strength += 20;
  if (hasNumber) strength += 10;
  if (hasSpecial) strength += 10;
  
  // Senha só é considerada forte (>=80) se tiver TODOS os requisitos:
  // maiúscula + minúscula + número + caractere especial
  const hasAllRequirements = hasLowercase && hasUppercase && hasNumber && hasSpecial;
  if (!hasAllRequirements && strength >= 80) {
    strength = 79; // Limita a 79 se não tiver todos os requisitos
  }
  
  return Math.min(strength, 100);
}

function getAttackSuccessChance(attackId: string, gameState: any): number {
  const measures = gameState.casualUser.securityMeasures;
  const config = gameState.casualUser.securityConfig || {};
  const passwordStrength = calculatePasswordStrength(gameState.casualUser.password || '');
  
  let baseChance = 70;
  
  switch (attackId) {
    case 'brute_force':
      baseChance = 80;
      if (measures.authenticatorApp) baseChance -= 70;
      if (measures.twoFactorAuth) baseChance -= 60;
      if (measures.strongPassword || passwordStrength >= 80) baseChance -= 40;
      if (measures.ipWhitelist && config.ipWhitelist?.enabled) baseChance -= 20;
      if (measures.sessionManagement) baseChance -= 15;
      break;
      
    case 'phishing':
      baseChance = 70;
      if (measures.authenticatorApp) baseChance -= 40;
      if (measures.twoFactorAuth) baseChance -= 30;
      if (measures.emailVerification) baseChance -= 25;
      if (measures.loginAlerts && config.loginAlerts?.emailAlerts) baseChance -= 20;
      if (measures.trustedDevices && config.trustedDevices?.devices?.length > 0) baseChance -= 15;
      break;
      
    case 'social_engineering':
      baseChance = 65;
      if (measures.twoFactorAuth) baseChance -= 25;
      if (measures.securityQuestions) baseChance -= 20;
      if (measures.loginAlerts && (config.loginAlerts?.emailAlerts || config.loginAlerts?.smsAlerts)) baseChance -= 20;
      break;
      
    case 'keylogger':
      baseChance = 60;
      if (measures.authenticatorApp) baseChance -= 30;
      if (measures.twoFactorAuth) baseChance -= 25;
      if (measures.sessionManagement) baseChance -= 15;
      break;
      
    case 'password_leak':
      baseChance = 75;
      if (measures.authenticatorApp) baseChance -= 50;
      if (measures.twoFactorAuth) baseChance -= 40;
      if (measures.strongPassword) baseChance -= 20;
      if (measures.smsBackup && config.smsBackup?.verified) baseChance -= 15;
      break;
      
    case 'session_hijacking':
      baseChance = 50;
      if (measures.loginAlerts && (config.loginAlerts?.emailAlerts || config.loginAlerts?.smsAlerts)) baseChance -= 25;
      if (measures.sessionManagement) baseChance -= 20;
      if (measures.trustedDevices && config.trustedDevices?.devices?.length > 0) baseChance -= 15;
      if (measures.authenticatorApp) baseChance -= 10;
      break;
      
    case 'man_in_the_middle':
      baseChance = 50;
      if (measures.trustedDevices && config.trustedDevices?.devices?.length > 0) baseChance -= 30;
      if (measures.authenticatorApp) baseChance -= 20;
      if (measures.twoFactorAuth) baseChance -= 10;
      break;
      
    case 'credential_stuffing':
      baseChance = 50;
      if (measures.passwordVault && gameState.casualUser.passwordVault?.length >= 3) baseChance -= 25;
      if (measures.authenticatorApp) baseChance -= 15;
      if (measures.twoFactorAuth) baseChance -= 10;
      if (measures.strongPassword) baseChance -= 5;
      break;
      
    case 'sim_swap':
      baseChance = 50;
      if (measures.authenticatorApp) baseChance -= 40;
      if (measures.twoFactorAuth) baseChance -= 10;
      break;
      
    case 'malware_injection':
      baseChance = 50;
      if (measures.trustedDevices && config.trustedDevices?.devices?.length > 0) baseChance -= 30;
      if (measures.authenticatorApp) baseChance -= 20;
      if (measures.sessionManagement) baseChance -= 15;
      break;
      
    case 'dns_spoofing':
      baseChance = 50;
      if (measures.trustedDevices && config.trustedDevices?.devices?.length > 0) baseChance -= 25;
      if (measures.loginAlerts && (config.loginAlerts?.emailAlerts || config.loginAlerts?.smsAlerts)) baseChance -= 15;
      if (measures.authenticatorApp) baseChance -= 10;
      if (measures.emailVerification) baseChance -= 5;
      break;
      
    case 'zero_day_exploit':
      baseChance = 50;
      if (measures.authenticatorApp) baseChance -= 25;
      if (measures.twoFactorAuth) baseChance -= 20;
      if (measures.ipWhitelist && config.ipWhitelist?.enabled && config.ipWhitelist?.allowedIPs?.length > 0) baseChance -= 10;
      if (measures.sessionManagement) baseChance -= 5;
      break;
      
    default:
      baseChance = 50;
  }
  
  return Math.max(0, Math.min(100, baseChance));
}

/**
 * Cria uma notificação baseada no tipo de ataque
 * 
 * Para phishing: adiciona botão "Saber Mais" que abre página de login falsa
 * Para engenharia social: usa rotação de cenários (0, 1, 2) para variedade
 */
function createNotification(attackId: string, gameState: any) {
  const notifications: Record<string, any> = {
    phishing: {
      type: 'phishing',
      title: 'Novo Email Recebido',
      message: 'Você ganhou um prêmio! Clique aqui para resgatar agora. Confirme seus dados para receber.',
      requiresAction: true,
      ctaLabel: 'Saber Mais',
      ctaType: 'phishing_learn_more',
    },
    social_engineering: {
      type: 'social_engineering',
      title: 'Nova Conversa',
      message: 'Você tem uma nova mensagem. Clique para visualizar.',
      requiresAction: true,
      scenarioIndex: gameState.hacker.socialEngineeringScenarioCursor,
    },
    brute_force: {
      type: 'security_alert',
      title: 'Alerta de Segurança',
      message: 'Múltiplas tentativas de login detectadas. Seu acesso pode estar em risco.',
      requiresAction: false,
    },
    keylogger: {
      type: 'suspicious_login',
      title: 'Download Automático',
      message: 'Um programa está tentando se instalar no seu computador. Permitir?',
      requiresAction: true,
    },
    password_leak: {
      type: 'security_alert',
      title: 'Vazamento de Dados',
      message: 'Sua senha pode ter sido exposta em um vazamento de dados recente. Considere alterá-la.',
      requiresAction: false,
    },
  };
  
  const template = notifications[attackId] || notifications.phishing;
  return {
    id: randomUUID(),
    ...template,
    isActive: true,
    userFellFor: undefined,
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/game-state", async (req, res) => {
    try {
      const gameState = getGameState(req.session);
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to get game state" });
    }
  });

  app.post("/api/game/start", async (req, res) => {
    try {
      resetGameState(req.session);
      const gameState = updateGameState(req.session, {
        gameStarted: true,
        tutorialCompleted: true,
      });
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to start game" });
    }
  });

  app.post("/api/tutorial/complete", async (req, res) => {
    try {
      const gameState = updateGameState(req.session, {
        tutorialCompleted: true,
      });
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete tutorial" });
    }
  });

  app.post("/api/account/create", async (req, res) => {
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
            strongPassword: passwordStrength >= 80,
          },
        },
      });
      
      gameState = addActivityLog(gameState, 'user', 'Conta criada', `Nome: ${name}, Email: ${email}, Força da senha: ${passwordStrength}%`);
      
      // Adicionar notificação de senha fraca se a senha não tiver força >= 80
      if (passwordStrength < 80) {
        const weakPasswordNotification = {
          id: randomUUID(),
          type: 'weak_password_warning' as const,
          title: 'Atenção: Senha Fraca Detectada',
          message: `Sua conta foi criada, mas sua senha está vulnerável a ataques. Força atual: ${passwordStrength}%. Recomendamos melhorar sua senha nas configurações.`,
          requiresAction: false,
          isActive: true,
          passwordStrength,
        };
        
        gameState = {
          ...gameState,
          notifications: [...gameState.notifications, weakPasswordNotification],
        };
      }
      
      const updatedState = updateGameState(req.session, {
        ...gameState,
        vulnerabilityScore: calculateVulnerability(gameState),
      });
      
      res.json(updatedState);
    } catch (error) {
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/security/update", async (req, res) => {
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
            [measure]: enabled,
          },
        },
      });
      
      const measureNames: Record<string, string> = {
        twoFactorAuth: 'Autenticação de Dois Fatores',
        strongPassword: 'Senha Forte',
        emailVerification: 'Verificação de Email',
        securityQuestions: 'Perguntas de Segurança',
        backupEmail: 'Email de Recuperação',
        authenticatorApp: 'Aplicativo Autenticador',
        smsBackup: 'Backup por SMS',
        trustedDevices: 'Dispositivos Confiáveis',
        loginAlerts: 'Alertas de Login',
        sessionManagement: 'Gerenciamento de Sessão',
        ipWhitelist: 'Lista de IPs Permitidos',
        passwordVault: 'Cofre de Senhas',
      };
      
      gameState = addActivityLog(
        gameState, 
        'user', 
        enabled ? 'Proteção ativada' : 'Proteção desativada', 
        measureNames[measure] || measure
      );
      
      const updatedState = updateGameState(req.session, {
        ...gameState,
        vulnerabilityScore: calculateVulnerability(gameState),
      });
      
      res.json(updatedState);
    } catch (error) {
      res.status(500).json({ error: "Failed to update security" });
    }
  });

  // Endpoint para configurar senha forte
  app.post("/api/security/strong-password", async (req, res) => {
    try {
      const { password, strength: clientStrength } = req.body;
      
      if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: "Password is required" });
      }

      const currentState = getGameState(req.session);
      
      // Sempre recalcular força da senha no servidor para garantir segurança
      const strength = calculatePasswordStrength(password);
      
      // Atualizar senha do usuário
      const updatedUser = {
        ...currentState.casualUser,
        password,
        securityMeasures: {
          ...currentState.casualUser.securityMeasures,
          strongPassword: strength >= 80, // Ativa se força >= 80% (todos os requisitos)
        },
        securityConfig: {
          ...currentState.casualUser.securityConfig,
          strongPassword: { password, strength },
        },
      };

      const gameState = updateGameState(req.session, {
        casualUser: updatedUser,
      });
      
      // Recalcular vulnerabilidade
      const updatedState = updateGameState(req.session, {
        vulnerabilityScore: calculateVulnerability(gameState),
      });
      
      res.json(updatedState);
    } catch (error) {
      res.status(500).json({ error: "Failed to configure strong password" });
    }
  });

  // Endpoint para configurar pergunta de segurança
  app.post("/api/security/security-question", async (req, res) => {
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
          securityQuestions: true,
        },
        securityConfig: {
          ...currentState.casualUser.securityConfig,
          securityQuestion: { question, answer },
        },
      };

      const gameState = updateGameState(req.session, {
        casualUser: updatedUser,
      });
      
      const updatedState = updateGameState(req.session, {
        vulnerabilityScore: calculateVulnerability(gameState),
      });
      
      res.json(updatedState);
    } catch (error) {
      res.status(500).json({ error: "Failed to configure security question" });
    }
  });

  // Endpoint para ativar 2FA (aguarda confirmação via notificação)
  app.post("/api/security/two-factor", async (req, res) => {
    try {
      const currentState = getGameState(req.session);
      
      // Verificar se já existe notificação pendente de 2FA
      const existingNotification = currentState.notifications.find(
        n => n.isActive && n.requiresAction && n.ctaType === 'confirm_2fa'
      );
      
      if (existingNotification) {
        // Já existe notificação pendente, retornar estado atual
        return res.json(currentState);
      }
      
      // Criar notificação de confirmação para 2FA
      const notification = {
        id: randomUUID(),
        type: '2fa_confirm' as const,
        title: 'Ativar Autenticação de Dois Fatores',
        message: 'Você está prestes a ativar a Autenticação de Dois Fatores (2FA). Esta medida adicionará uma camada extra de segurança à sua conta, exigindo um código de verificação além da sua senha. Clique em Confirmar para ativar.',
        isActive: true,
        requiresAction: true,
        userFellFor: undefined,
        ctaLabel: 'Confirmar',
        ctaType: 'confirm_2fa' as const,
      };

      // Atualizar estado com notificação (medida NÃO ativada ainda)
      const updatedState = updateGameState(req.session, {
        notifications: [...currentState.notifications, notification],
      });
      
      res.json(updatedState);
    } catch (error) {
      res.status(500).json({ error: "Failed to configure two factor auth" });
    }
  });

  // Endpoint para ativar verificação de email (aguarda confirmação via notificação)
  app.post("/api/security/email-verification", async (req, res) => {
    try {
      const currentState = getGameState(req.session);
      
      // Verificar se já existe notificação pendente de email verification
      const existingNotification = currentState.notifications.find(
        n => n.isActive && n.requiresAction && n.ctaType === 'confirm_email_verification'
      );
      
      if (existingNotification) {
        // Já existe notificação pendente, retornar estado atual
        return res.json(currentState);
      }
      
      // Criar notificação de confirmação para verificação de email
      const notification = {
        id: randomUUID(),
        type: 'email_verify_confirm' as const,
        title: 'Ativar Verificação de Email',
        message: `Enviamos um código de verificação para ${currentState.casualUser.email || 'seu email'}. Confirme para verificar sua identidade e aumentar a segurança da conta.`,
        isActive: true,
        requiresAction: true,
        userFellFor: undefined,
        ctaLabel: 'Confirmar',
        ctaType: 'confirm_email_verification' as const,
      };

      // Atualizar estado com notificação (medida NÃO ativada ainda)
      const updatedState = updateGameState(req.session, {
        notifications: [...currentState.notifications, notification],
      });
      
      res.json(updatedState);
    } catch (error) {
      res.status(500).json({ error: "Failed to configure email verification" });
    }
  });

  // Endpoint para configurar email de recuperação (aguarda confirmação via notificação)
  app.post("/api/security/recovery-email", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: "Email is required" });
      }

      const currentState = getGameState(req.session);
      
      // Criar notificação de confirmação
      const notification = {
        id: randomUUID(),
        type: 'email_verify_confirm' as const,
        title: 'Confirmar Email de Recuperação',
        message: `Enviamos um código de verificação para ${email}. Clique em Confirmar para ativar o email de recuperação e aumentar sua segurança.`,
        isActive: true,
        requiresAction: true,
        userFellFor: undefined,
        ctaLabel: 'Confirmar',
        ctaType: 'confirm_email' as const,
      };
      
      // Atualizar usuário com email (mas NÃO ativar medida ainda)
      const updatedUser = {
        ...currentState.casualUser,
        securityConfig: {
          ...currentState.casualUser.securityConfig,
          recoveryEmail: { email, verified: false }, // Aguardando confirmação
        },
      };

      // Atualizar estado com usuário e notificação
      const updatedState = updateGameState(req.session, {
        casualUser: updatedUser,
        notifications: [...currentState.notifications, notification],
      });
      
      res.json(updatedState);
    } catch (error) {
      res.status(500).json({ error: "Failed to configure recovery email" });
    }
  });

  app.post("/api/security/configure", async (req, res) => {
    try {
      const result = configureSecuritySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request data", details: result.error });
      }

      const { measure, config } = result.data;
      const currentState = getGameState(req.session);
      
      const currentConfig = currentState.casualUser.securityConfig?.[measure];
      let mergedConfig: any = { ...config };
      
      if (measure === 'trustedDevices' && currentConfig && 'devices' in currentConfig && 'devices' in config) {
        const existingDevices = currentConfig.devices || [];
        const newDevices = config.devices || [];
        const existingIds = new Set(existingDevices.map((d: any) => d.id));
        const uniqueNewDevices = newDevices.filter((d: any) => !existingIds.has(d.id));
        
        mergedConfig = {
          devices: [...existingDevices, ...uniqueNewDevices],
        };
      } else if (measure === 'ipWhitelist' && currentConfig && 'allowedIPs' in currentConfig && 'allowedIPs' in config) {
        const existingIPs = currentConfig.allowedIPs || [];
        const newIPs = config.allowedIPs || [];
        const ipSet = new Set([...existingIPs, ...newIPs]);
        const uniqueIPs = Array.from(ipSet);
        
        mergedConfig = {
          enabled: config.enabled,
          allowedIPs: uniqueIPs,
        };
      }
      
      let isEnabled = true;
      
      if (measure === 'ipWhitelist' && 'enabled' in config) {
        isEnabled = config.enabled;
      } else if (measure === 'loginAlerts' && 'emailAlerts' in config) {
        isEnabled = config.emailAlerts || config.smsAlerts || config.newLocationAlerts;
      }
      
      const gameState = updateGameState(req.session, {
        casualUser: {
          ...currentState.casualUser,
          securityMeasures: {
            ...currentState.casualUser.securityMeasures,
            [measure]: isEnabled,
          },
          securityConfig: {
            ...currentState.casualUser.securityConfig,
            [measure]: mergedConfig,
          },
        },
      });
      
      const updatedState = updateGameState(req.session, {
        vulnerabilityScore: calculateVulnerability(gameState),
      });
      
      res.json(updatedState);
    } catch (error) {
      res.status(500).json({ error: "Failed to configure security" });
    }
  });

  app.post("/api/attack/execute", async (req, res) => {
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
      
      if (currentState.hacker.cooldowns[attackId] && 
          currentState.hacker.cooldowns[attackId] > Date.now()) {
        return res.status(400).json({ error: "Attack on cooldown" });
      }

      const successChance = getAttackSuccessChance(attackId, currentState);
      const isSuccessful = Math.random() * 100 < successChance;
      
      const notification = createNotification(attackId, currentState);
      
      const newCooldowns = { ...currentState.hacker.cooldowns };
      newCooldowns[attackId] = Date.now() + attack.cooldown;
      
      // Rotaciona o cursor de cenários de engenharia social (0 -> 1 -> 2 -> 0)
      const newScenarioCursor = attackId === 'social_engineering'
        ? (currentState.hacker.socialEngineeringScenarioCursor + 1) % 3
        : currentState.hacker.socialEngineeringScenarioCursor;
      
      let gameState = updateGameState(req.session, {
        hacker: {
          ...currentState.hacker,
          attacksAttempted: currentState.hacker.attacksAttempted + 1,
          attacksSuccessful: isSuccessful 
            ? currentState.hacker.attacksSuccessful + 1 
            : currentState.hacker.attacksSuccessful,
          cooldowns: newCooldowns,
          socialEngineeringScenarioCursor: newScenarioCursor,
        },
        notifications: [...currentState.notifications, notification],
        casualUser: {
          ...currentState.casualUser,
          accountCompromised: isSuccessful || currentState.casualUser.accountCompromised,
        },
      });
      
      // Adicionar log de atividade do ataque
      gameState = addActivityLog(
        gameState,
        'hacker',
        `Ataque executado: ${attack.name}`,
        `${isSuccessful ? 'Sucesso!' : 'Falhou.'} Chance de sucesso: ${Math.round(successChance)}%`
      );
      
      const finalState = updateGameState(req.session, gameState);
      
      res.json(finalState);
    } catch (error) {
      res.status(500).json({ error: "Failed to execute attack" });
    }
  });

  app.post("/api/notification/delete", async (req, res) => {
    try {
      const { notificationId } = req.body;
      if (!notificationId) {
        return res.status(400).json({ error: "Notification ID is required" });
      }

      const currentState = getGameState(req.session);
      const updatedNotifications = currentState.notifications.filter(
        (n) => n.id !== notificationId
      );

      const gameState = updateGameState(req.session, {
        notifications: updatedNotifications,
      });

      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete notification" });
    }
  });

  app.post("/api/notification/respond", async (req, res) => {
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

      const updatedNotifications = currentState.notifications.map((n) =>
        n.id === notificationId
          ? { ...n, isActive: false, userFellFor: accepted }
          : n
      );
      
      let accountCompromised = currentState.casualUser.accountCompromised;
      let updatedUser = currentState.casualUser;
      
      // Tratar phishing e ataques maliciosos
      if (accepted && notification.type === 'phishing') {
        accountCompromised = true;
      } else if (accepted && notification.type === 'social_engineering') {
        accountCompromised = true;
      } else if (accepted && notification.type === 'suspicious_login') {
        accountCompromised = true;
      }
      
      // Tratar confirmações de segurança (ctaType)
      if (accepted && notification.ctaType === 'confirm_email') {
        // Confirmar email de recuperação
        const recoveryEmail = currentState.casualUser.securityConfig?.recoveryEmail;
        if (recoveryEmail) {
          updatedUser = {
            ...currentState.casualUser,
            accountCompromised,
            securityMeasures: {
              ...currentState.casualUser.securityMeasures,
              backupEmail: true,
            },
            securityConfig: {
              ...currentState.casualUser.securityConfig,
              recoveryEmail: {
                ...recoveryEmail,
                verified: true,
              },
            },
          };
        }
      } else if (accepted && notification.ctaType === 'confirm_2fa') {
        // Confirmar 2FA
        updatedUser = {
          ...currentState.casualUser,
          accountCompromised,
          securityMeasures: {
            ...currentState.casualUser.securityMeasures,
            twoFactorAuth: true,
          },
        };
      } else if (accepted && notification.ctaType === 'confirm_email_verification') {
        // Confirmar verificação de email
        updatedUser = {
          ...currentState.casualUser,
          accountCompromised,
          securityMeasures: {
            ...currentState.casualUser.securityMeasures,
            emailVerification: true,
          },
        };
      } else {
        updatedUser = {
          ...currentState.casualUser,
          accountCompromised,
        };
      }
      
      // Preparar estado temporário para calcular vulnerabilidade
      const tempState = {
        ...currentState,
        casualUser: updatedUser,
      };
      
      // Calcular nova vulnerabilidade
      const newVulnerability = calculateVulnerability(tempState);
      
      const gameState = updateGameState(req.session, {
        notifications: updatedNotifications,
        casualUser: updatedUser,
        vulnerabilityScore: newVulnerability,
      });
      
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to respond to notification" });
    }
  });

  app.post("/api/account/step", async (req, res) => {
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
          ...(data || {}),
        },
      });
      
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to update account step" });
    }
  });

  app.post("/api/security/flow", async (req, res) => {
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
          ...(currentState.casualUser.securitySetupFlows[flowType] || {}),
          step,
          ...(data || {}),
        },
      };
      
      const gameState = updateGameState(req.session, {
        casualUser: {
          ...currentState.casualUser,
          securitySetupFlows: updatedFlows,
        },
      });
      
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to update security flow" });
    }
  });

  app.post("/api/attack/step", async (req, res) => {
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
          ...(currentState.hacker.attackFlows[attackId] || {}),
          step,
          progress: 0,
          ...(data || {}),
        },
      };
      
      const gameState = updateGameState(req.session, {
        hacker: {
          ...currentState.hacker,
          attackFlows: updatedFlows,
        },
      });
      
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to update attack step" });
    }
  });

  app.post("/api/passwords/save", async (req, res) => {
    try {
      const result = savePasswordSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const currentState = getGameState(req.session);
      const newPassword = {
        id: randomUUID(),
        ...result.data,
        createdAt: Date.now(),
      };

      const newVault = [...currentState.casualUser.passwordVault, newPassword];
      const shouldActivateVault = newVault.length >= 3 && !currentState.casualUser.securityMeasures.passwordVault;

      const activityLog = [
        ...currentState.activityLog,
        {
          id: randomUUID(),
          timestamp: Date.now(),
          actor: 'user' as const,
          action: 'Senha salva no cofre',
          detail: `"${result.data.title}" adicionada ao cofre de senhas`,
        },
      ];

      if (shouldActivateVault) {
        activityLog.push({
          id: randomUUID(),
          timestamp: Date.now(),
          actor: 'system' as const,
          action: 'Cofre de Senhas ativado',
          detail: '3 ou mais senhas armazenadas - bônus de segurança aplicado',
        });
      }

      const gameState = updateGameState(req.session, {
        casualUser: {
          ...currentState.casualUser,
          passwordVault: newVault,
          securityMeasures: {
            ...currentState.casualUser.securityMeasures,
            passwordVault: shouldActivateVault || currentState.casualUser.securityMeasures.passwordVault,
          },
        },
        activityLog,
      });

      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to save password" });
    }
  });

  app.post("/api/passwords/delete", async (req, res) => {
    try {
      const result = deletePasswordSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const { id } = result.data;
      const currentState = getGameState(req.session);
      const deletedPassword = currentState.casualUser.passwordVault.find(p => p.id === id);
      const newVault = currentState.casualUser.passwordVault.filter(p => p.id !== id);
      const shouldDeactivateVault = newVault.length < 3 && currentState.casualUser.securityMeasures.passwordVault;

      const activityLog = [
        ...currentState.activityLog,
        {
          id: randomUUID(),
          timestamp: Date.now(),
          actor: 'user' as const,
          action: 'Senha removida do cofre',
          detail: deletedPassword ? `"${deletedPassword.title}" removida` : 'Senha removida',
        },
      ];

      if (shouldDeactivateVault) {
        activityLog.push({
          id: randomUUID(),
          timestamp: Date.now(),
          actor: 'system' as const,
          action: 'Cofre de Senhas desativado',
          detail: 'Menos de 3 senhas - bônus de segurança removido',
        });
      }

      const gameState = updateGameState(req.session, {
        casualUser: {
          ...currentState.casualUser,
          passwordVault: newVault,
          securityMeasures: {
            ...currentState.casualUser.securityMeasures,
            passwordVault: !shouldDeactivateVault && currentState.casualUser.securityMeasures.passwordVault,
          },
        },
        activityLog,
      });

      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete password" });
    }
  });

  app.post("/api/passwords/generate", async (req, res) => {
    try {
      const { length = 16, includeSymbols = true, includeNumbers = true } = req.body;
      
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const numbers = '0123456789';
      const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      
      let chars = lowercase + uppercase;
      if (includeNumbers) chars += numbers;
      if (includeSymbols) chars += symbols;
      
      let password = '';
      for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      res.json({ password });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate password" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

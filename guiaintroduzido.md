# Mapeamento de Ataques e Defesas

Este documento mostra **qual configuração de segurança defende contra qual ataque** de forma direta.

---

## BRUTE FORCE
**Chance Base:** 80%

| Configuração | Redução | Total com Defesa |
|--------------|---------|-----------------|
| Aplicativo Autenticador | -70% | 10% |
| Autenticação 2FA | -60% | 20% |
| Senha Forte | -40% | 40% |
| IP Whitelist (ativado) | -20% | 60% |
| Gerenciamento de Sessão | -15% | 65% |

---

## PHISHING
**Chance Base:** 70%

| Configuração | Redução | Total com Defesa |
|--------------|---------|-----------------|
| Aplicativo Autenticador | -40% | 30% |
| Autenticação 2FA | -30% | 40% |
| Verificação de Email | -25% | 45% |
| Alertas de Login (email) | -20% | 50% |
| Dispositivos Confiáveis (configurado) | -15% | 55% |

---

## ENGENHARIA SOCIAL
**Chance Base:** 65%

| Configuração | Redução | Total com Defesa |
|--------------|---------|-----------------|
| Autenticação 2FA | -25% | 40% |
| Perguntas de Segurança | -20% | 45% |
| Alertas de Login (email/SMS) | -20% | 45% |

---

## KEYLOGGER
**Chance Base:** 60%

| Configuração | Redução | Total com Defesa |
|--------------|---------|-----------------|
| Aplicativo Autenticador | -30% | 30% |
| Autenticação 2FA | -25% | 35% |
| Gerenciamento de Sessão | -15% | 45% |

---

## VAZAMENTO DE SENHA
**Chance Base:** 75%

| Configuração | Redução | Total com Defesa |
|--------------|---------|-----------------|
| Aplicativo Autenticador | -50% | 25% |
| Autenticação 2FA | -40% | 35% |
| Senha Forte | -20% | 55% |
| SMS Backup (verificado) | -15% | 60% |

---

## SEQUESTRO DE SESSÃO
**Chance Base:** 50%

| Configuração | Redução | Total com Defesa |
|--------------|---------|-----------------|
| Alertas de Login (email/SMS) | -25% | 25% |
| Gerenciamento de Sessão | -20% | 30% |
| Dispositivos Confiáveis (configurado) | -15% | 35% |
| Aplicativo Autenticador | -10% | 40% |

---

## MAN-IN-THE-MIDDLE (MITM)
**Chance Base:** 50%

| Configuração | Redução | Total com Defesa |
|--------------|---------|-----------------|
| Dispositivos Confiáveis (configurado) | -30% | 20% |
| Aplicativo Autenticador | -20% | 30% |
| Autenticação 2FA | -10% | 40% |

---

## CREDENTIAL STUFFING
**Chance Base:** 50%

| Configuração | Redução | Total com Defesa |
|--------------|---------|-----------------|
| Cofre de Senhas (3+ senhas) | -25% | 25% |
| Aplicativo Autenticador | -15% | 35% |
| Autenticação 2FA | -10% | 40% |
| Senha Forte | -5% | 45% |

---

## SIM SWAP
**Chance Base:** 50%

| Configuração | Redução | Total com Defesa |
|--------------|---------|-----------------|
| Aplicativo Autenticador | -40% | 10% |
| Autenticação 2FA | -10% | 40% |

---

## INJEÇÃO DE MALWARE
**Chance Base:** 50%

| Configuração | Redução | Total com Defesa |
|--------------|---------|-----------------|
| Dispositivos Confiáveis (configurado) | -30% | 20% |
| Aplicativo Autenticador | -20% | 30% |
| Gerenciamento de Sessão | -15% | 35% |

---

## DNS SPOOFING
**Chance Base:** 50%

| Configuração | Redução | Total com Defesa |
|--------------|---------|-----------------|
| Dispositivos Confiáveis (configurado) | -25% | 25% |
| Alertas de Login (email/SMS) | -15% | 35% |
| Aplicativo Autenticador | -10% | 40% |
| Verificação de Email | -5% | 45% |

---

## ZERO-DAY EXPLOIT
**Chance Base:** 50%

| Configuração | Redução | Total com Defesa |
|--------------|---------|-----------------|
| Aplicativo Autenticador | -25% | 25% |
| Autenticação 2FA | -20% | 30% |
| IP Whitelist (ativado com IPs) | -10% | 40% |
| Gerenciamento de Sessão | -5% | 45% |

---

## RESUMO: DEFESAS MAIS EFICAZES

### Mais Poderosa
- **Aplicativo Autenticador** → Defende contra 9 ataques (até -70%)
- **Autenticação 2FA** → Defende contra 9 ataques (até -60%)

### Muito Eficaz
- **Dispositivos Confiáveis** → Defende contra 5 ataques (até -30%)
- **Gerenciamento de Sessão** → Defende contra 5 ataques (até -20%)

### Moderado
- **Alertas de Login** → Defende contra 4 ataques (até -25%)
- **Senha Forte** → Defende contra 4 ataques (até -40%)

---

## SEGURANÇA 100% (IMPOSSÍVEL HACKEAR)

**Quando TODAS as 12 medidas estão ativas E configuradas:**
- Senha forte (força ≥ 80%)
- IP Whitelist com pelo menos 1 IP
- Dispositivos Confiáveis com pelo menos 1 dispositivo
- Alertas de Login (email ou SMS)
- SMS Backup verificado
- Cofre de Senhas com 3+ senhas
- Todos os 12 sistemas de segurança ativos

**Resultado:** Chance de sucesso = **0%** para TODOS os ataques

---

## Legendas
- **Chance Base:** Probabilidade inicial do ataque sem defesas
- **Redução:** Quanto essa configuração reduz a chance (cumulativo)
- **Total com Defesa:** Chance resultante após aplicar essa defesa específica

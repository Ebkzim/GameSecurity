/**
 * Componente de Chatbot para Engenharia Social
 * 
 * Este componente simula um chat onde o hacker tenta enganar o usuário
 * através de diferentes cenários de engenharia social.
 * 
 * Existem 3 tipos de conversas:
 * 1. Suporte Técnico
 * 2. Gerente de Banco
 * 3. Amigo Perdido
 */

import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, User, Bot, Send, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  sender: 'bot' | 'user';
  text: string;
  options?: string[];
}

interface SocialEngineeringChatProps {
  notificationId: string;
  scenarioType: number; // 0, 1, ou 2 para escolher o cenário
}

// Três cenários diferentes de engenharia social
const scenarios = [
  {
    // Cenário 1: Suporte Técnico
    title: "Suporte Técnico",
    initialMessage: "Olá! Sou do suporte técnico. Detectamos atividade suspeita em sua conta. Para sua segurança, precisamos verificar algumas informações.",
    messages: [
      {
        text: "Você é o titular da conta associada ao email {email}?",
        options: [
          "Sim, sou eu",
          "Não, deve ser engano",
          "Como assim atividade suspeita?"
        ],
        responses: {
          0: "Perfeito! Por segurança, pode nos informar a senha atual da sua conta para confirmarmos?",
          1: "Desculpe o incômodo! Vou verificar nossos registros novamente.",
          2: "Foram detectadas várias tentativas de login de um local desconhecido. Precisamos verificar sua identidade."
        }
      },
      {
        text: "Para confirmar sua identidade, poderia nos fornecer sua senha atual?",
        options: [
          "Aqui está: {password}",
          "Não me sinto confortável compartilhando",
          "Por que vocês precisam da minha senha?"
        ],
        responses: {
          0: "Obrigado! Vamos processar essa informação e proteger sua conta.",
          1: "Entendo sua preocupação. Podemos enviar um código de verificação ao invés?",
          2: "É procedimento padrão de segurança. Sem isso, não podemos ajudar a proteger sua conta."
        }
      }
    ],
    compromised: [0] // Opções que comprometem a conta
  },
  {
    // Cenário 2: Gerente de Banco
    title: "Gerente de Conta.",
    initialMessage: "Bom dia! Aqui é a Ana Paula, sua gerente de conta no Banco Digital. Temos uma ótima notícia sobre um upgrade gratuito para sua conta!",
    messages: [
      {
        text: "Você foi selecionado para um upgrade premium GRATUITO! Só precisamos confirmar alguns dados. Qual seu nome completo?",
        options: [
          "Me chamo {name}",
          "Por que precisa dessa informação?",
          "Não tenho interesse no upgrade"
        ],
        responses: {
          0: "Ótimo, {name}! Agora, para ativar o upgrade, preciso que você acesse este link e faça login...",
          1: "É apenas para confirmar que estou falando com o titular correto da conta.",
          2: "Que pena! São muitos benefícios exclusivos. Tem certeza que não quer saber mais?"
        }
      },
      {
        text: "Para finalizar a ativação do upgrade, acesse este link e faça login: www.banco-digitall.com/upgrade",
        options: [
          "Vou acessar agora",
          "Esse site parece suspeito",
          "Prefiro ligar para o banco antes"
        ],
        responses: {
          0: "Perfeito! Assim que você fizer login, o upgrade será ativado automaticamente.",
          1: "Garanto que é seguro! É o site oficial do banco, apenas com uma promoção especial.",
          2: "Claro, pode ligar! Mas esta promoção expira hoje às 18h."
        }
      }
    ],
    compromised: [0] // Opções que comprometem a conta
  },
  {
    // Cenário 3: Amigo Perdido
    title: "Mensagem Privada",
    initialMessage: "Oi! Você se lembra de mim? Nós estudamos juntos há alguns anos atrás. Achei seu contato nas redes sociais!",
    messages: [
      {
        text: "Estou organizando um reencontro da turma! Mas perdi meus contatos. Você ainda usa o mesmo email?",
        options: [
          "Sim, ainda é {email}",
          "Desculpe, não me lembro de você",
          "Qual turma mesmo?"
        ],
        responses: {
          0: "Que legal! Vou te adicionar na lista. Para confirmar que é você, qual era o nome do professor de matemática?",
          1: "Não acredito! Sentávamos juntos na sala. Não se lembra mesmo?",
          2: "A turma de 2015! Nossa, como o tempo passa rápido!"
        }
      },
      {
        text: "Estou enviando o convite do evento por email. Pode confirmar sua senha do email para eu saber que chegou na caixa certa?",
        options: [
          "Claro, é {password}",
          "Isso não faz sentido, você não precisa da minha senha",
          "Vou esperar o email chegar"
        ],
        responses: {
          0: "Perfeito! Já enviei o convite. Vai ser incrível rever todo mundo!",
          1: "Ah, desculpa! Estava confuso. É que alguns emails vão direto pro spam.",
          2: "Ok! Qualquer coisa me avisa se não chegar."
        }
      }
    ],
    compromised: [0] // Opções que comprometem a conta
  }
];

export function SocialEngineeringChat({ notificationId, scenarioType }: SocialEngineeringChatProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [chatEnded, setChatEnded] = useState(false);
  const [wasCompromised, setWasCompromised] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Seleciona o cenário baseado no tipo (0-2)
  const scenario = scenarios[scenarioType % 3];

  const respondMutation = useMutation({
    mutationFn: (accepted: boolean) =>
      apiRequest('POST', '/api/notification/respond', { 
        notificationId, 
        accepted 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
    },
  });

  // Inicializa o chat com a mensagem inicial
  useEffect(() => {
    setMessages([
      {
        id: 0,
        sender: 'bot',
        text: scenario.initialMessage,
        options: scenario.messages[0].options
      }
    ]);
  }, [scenarioType]);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOptionClick = (optionIndex: number) => {
    const currentMessage = scenario.messages[currentStep];
    const userMessage = currentMessage.options[optionIndex];
    
    // Adiciona mensagem do usuário
    const newUserMessage: Message = {
      id: messages.length,
      sender: 'user',
      text: userMessage
    };

    setMessages(prev => [...prev, newUserMessage]);

    // Verifica se a conta foi comprometida
    const isCompromised = scenario.compromised.includes(optionIndex);
    if (isCompromised) {
      setWasCompromised(true);
    }

    // Espera um pouco antes de adicionar resposta do bot
    setTimeout(() => {
      const botResponse = currentMessage.responses[optionIndex as keyof typeof currentMessage.responses];
      
      const newBotMessage: Message = {
        id: messages.length + 1,
        sender: 'bot',
        text: botResponse,
        options: currentStep < scenario.messages.length - 1 
          ? scenario.messages[currentStep + 1].options 
          : undefined
      };

      setMessages(prev => [...prev, newBotMessage]);

      // Avança para o próximo passo ou encerra o chat
      if (currentStep < scenario.messages.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setChatEnded(true);
        // Finaliza a interação após 2 segundos
        setTimeout(() => {
          respondMutation.mutate(isCompromised);
        }, 2000);
      }
    }, 1000);
  };

  const handleReject = () => {
    respondMutation.mutate(false);
    toast({
      title: "Conversa Encerrada",
      description: "Você rejeitou a solicitação com sabedoria!",
      variant: "default",
    });
  };

  const handleClose = () => {
    if (!chatEnded) {
      setIsOpen(false);
      setTimeout(() => handleReject(), 200);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 gap-0">
        <DialogHeader className="border-b border-orange-200 px-4 py-3 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold">{scenario.title}</DialogTitle>
              <DialogDescription className="text-xs text-orange-600 dark:text-orange-400">
                Engenharia Social - Tenha cuidado com o que compartilha
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-0">
        <div className="h-64 overflow-y-auto bg-gray-50 p-3 dark:bg-slate-950">
          <div className="space-y-2.5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex max-w-[85%] gap-2 ${
                    message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                      message.sender === 'user'
                        ? 'bg-blue-500'
                        : 'bg-orange-500'
                    }`}
                  >
                    {message.sender === 'user' ? (
                      <User className="h-3 w-3 text-white" />
                    ) : (
                      <Bot className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg px-3 py-1.5 ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100'
                    }`}
                  >
                    <p className="text-xs leading-relaxed">{message.text}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {!chatEnded && messages.length > 0 && messages[messages.length - 1].options && (
          <div className="border-t border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-slate-900">
            <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              Responder:
            </p>
            <div className="space-y-1.5">
              {messages[messages.length - 1].options?.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleOptionClick(index)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 text-xs"
                  disabled={respondMutation.isPending}
                >
                  <Send className="mr-1.5 h-3 w-3" />
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )}

        {chatEnded && (
          <div className="border-t border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-slate-900">
            <div className={`rounded-md p-2.5 ${
              wasCompromised 
                ? 'bg-red-50 text-red-900 dark:bg-red-950/50 dark:text-red-100' 
                : 'bg-green-50 text-green-900 dark:bg-green-950/50 dark:text-green-100'
            }`}>
              <p className="text-xs font-medium">
                {wasCompromised 
                  ? "⚠️ Cuidado! Você pode ter compartilhado informações sensíveis." 
                  : "✅ Boa! Você não caiu na armadilha."}
              </p>
            </div>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

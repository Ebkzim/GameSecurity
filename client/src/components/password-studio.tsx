import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { GameState, SavePasswordRequest } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Key, Copy, Trash2, RefreshCw, Save, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface PasswordStudioProps {
  gameState: GameState;
}

export function PasswordStudio({ gameState }: PasswordStudioProps) {
  const { toast } = useToast();
  const [passwordLength, setPasswordLength] = useState(16);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showVaultPasswords, setShowVaultPasswords] = useState<Record<string, boolean>>({});
  
  const [saveForm, setSaveForm] = useState({
    title: "",
    website: "",
    username: "",
    password: "",
    category: "",
  });

  const generatePasswordMutation = useMutation({
    mutationFn: (params: { length: number; includeSymbols: boolean; includeNumbers: boolean }) =>
      apiRequest('POST', '/api/passwords/generate', params),
    onSuccess: (data: { password: string }) => {
      setGeneratedPassword(data.password);
      setSaveForm({ ...saveForm, password: data.password });
      setShowPassword(true);
      toast({
        title: "Senha gerada!",
        description: "Sua senha forte foi criada com sucesso.",
      });
    },
  });

  const savePasswordMutation = useMutation({
    mutationFn: (data: SavePasswordRequest) =>
      apiRequest('POST', '/api/passwords/save', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
      setSaveForm({
        title: "",
        website: "",
        username: "",
        password: "",
        category: "",
      });
      setGeneratedPassword("");
      toast({
        title: "Senha salva!",
        description: "A senha foi adicionada ao seu cofre com segurança.",
      });
    },
  });

  const deletePasswordMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest('POST', '/api/passwords/delete', { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-state'] });
      toast({
        title: "Senha removida",
        description: "A senha foi removida do cofre.",
      });
    },
  });

  const handleGenerate = () => {
    generatePasswordMutation.mutate({
      length: passwordLength,
      includeSymbols,
      includeNumbers,
    });
  };

  const handleCopy = (password: string) => {
    navigator.clipboard.writeText(password);
    toast({
      title: "Copiado!",
      description: "Senha copiada para a área de transferência.",
    });
  };

  const handleSave = () => {
    if (saveForm.title && saveForm.password) {
      savePasswordMutation.mutate(saveForm);
    }
  };

  const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    
    const score = Math.min(strength, 100);
    let label = "Fraca";
    let color = "destructive";
    
    if (score >= 80) {
      label = "Muito Forte";
      color = "default";
    } else if (score >= 60) {
      label = "Forte";
      color = "secondary";
    } else if (score >= 40) {
      label = "Média";
      color = "outline";
    }
    
    return { score, label, color };
  };

  const strength = calculatePasswordStrength(generatedPassword || saveForm.password);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle>Gerador de Senhas</CardTitle>
          </div>
          <CardDescription>
            Crie senhas fortes e seguras automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Comprimento da senha: {passwordLength} caracteres</Label>
            <Slider
              value={[passwordLength]}
              onValueChange={(value) => setPasswordLength(value[0])}
              min={8}
              max={32}
              step={1}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="include-numbers">Incluir números</Label>
            <Switch
              id="include-numbers"
              checked={includeNumbers}
              onCheckedChange={setIncludeNumbers}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="include-symbols">Incluir símbolos</Label>
            <Switch
              id="include-symbols"
              checked={includeSymbols}
              onCheckedChange={setIncludeSymbols}
            />
          </div>

          <Button
            onClick={handleGenerate}
            className="w-full"
            disabled={generatePasswordMutation.isPending}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {generatePasswordMutation.isPending ? "Gerando..." : "Gerar Senha"}
          </Button>

          {generatedPassword && (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <Label>Senha gerada:</Label>
                <Badge variant={strength.color as any}>{strength.label}</Badge>
              </div>
              <div className="flex gap-2">
                <Input
                  value={generatedPassword}
                  type={showPassword ? "text" : "password"}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(generatedPassword)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {generatedPassword && (
            <div className="space-y-3 rounded-lg border p-4">
              <h4 className="font-semibold">Salvar no Cofre</h4>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Conta do Email"
                    value={saveForm.title}
                    onChange={(e) => setSaveForm({ ...saveForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="https://exemplo.com"
                    value={saveForm.website}
                    onChange={(e) => setSaveForm({ ...saveForm, website: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="username">Usuário/Email</Label>
                  <Input
                    id="username"
                    placeholder="seu@email.com"
                    value={saveForm.username}
                    onChange={(e) => setSaveForm({ ...saveForm, username: e.target.value })}
                  />
                </div>
                <Button
                  onClick={handleSave}
                  disabled={!saveForm.title || !saveForm.password || savePasswordMutation.isPending}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {savePasswordMutation.isPending ? "Salvando..." : "Salvar no Cofre"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cofre de Senhas</CardTitle>
          <CardDescription>
            {gameState.casualUser.passwordVault.length} senha(s) armazenada(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {gameState.casualUser.passwordVault.length >= 3 && gameState.casualUser.securityMeasures.passwordVault && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
              <div className="flex items-start gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                  <Key className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Bônus de Segurança Ativo!
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Você tem {gameState.casualUser.passwordVault.length} senhas salvas. Isso reduz sua vulnerabilidade em 8%!
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {gameState.casualUser.passwordVault.length > 0 && gameState.casualUser.passwordVault.length < 3 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="flex items-start gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                  <Key className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Quase lá!
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Salve {3 - gameState.casualUser.passwordVault.length} senha(s) a mais para ativar o bônus de segurança!
                  </p>
                </div>
              </div>
            </div>
          )}

          {gameState.casualUser.passwordVault.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Key className="mx-auto mb-2 h-12 w-12 opacity-20" />
              <p>Nenhuma senha salva ainda</p>
              <p className="text-sm">Use o gerador acima para criar e salvar senhas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Senha</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gameState.casualUser.passwordVault.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.website || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.username || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                            {showVaultPasswords[entry.id] ? entry.password : "••••••••"}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              setShowVaultPasswords({
                                ...showVaultPasswords,
                                [entry.id]: !showVaultPasswords[entry.id],
                              })
                            }
                          >
                            {showVaultPasswords[entry.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCopy(entry.password)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => deletePasswordMutation.mutate(entry.id)}
                            disabled={deletePasswordMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

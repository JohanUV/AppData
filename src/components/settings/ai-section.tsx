'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  HelpCircle,
  Loader2,
  Trash2,
  X,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { providers, providerOrder, type ProviderId } from '@/lib/ai/providers-meta';
import type { AIPrefs } from '@/types/datapath-api';
import { cn } from '@/lib/utils';

export function AISection() {
  const [encryptionOk, setEncryptionOk] = useState<boolean | null>(null);
  const [settings, setSettings] = useState<AIPrefs | null>(null);
  const [configured, setConfigured] = useState<ProviderId[]>([]);
  const [usage, setUsage] = useState<Record<string, { requests: number; tokens: number }>>({});
  const [logs, setLogs] = useState<{ provider: ProviderId; ok: boolean; error?: string; ts: number }[]>([]);

  async function refresh() {
    if (typeof window === 'undefined' || !window.datapath) return;
    const [enc, s, c, u, l] = await Promise.all([
      window.datapath.ai.encryptionAvailable(),
      window.datapath.ai.getSettings(),
      window.datapath.ai.configuredProviders(),
      window.datapath.ai.usageToday(),
      window.datapath.ai.fallbackLogs(),
    ]);
    setEncryptionOk(enc);
    setSettings(s);
    setConfigured(c);
    setUsage(u);
    setLogs(l);
  }

  useEffect(() => {
    // Hidratación inicial desde IPC (settings + keys + uso). El lint de React 19
    // marca el setState en effect, pero aquí es la única forma: los datos viven
    // en el main process, no son derivables del render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, []);

  if (!settings) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">Cargando…</CardContent>
      </Card>
    );
  }

  async function patch(p: Partial<AIPrefs>) {
    const next = await window.datapath.ai.saveSettings(p);
    setSettings(next);
  }

  return (
    <div className="space-y-6" id="ai">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <CardTitle>Tutor IA</CardTitle>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-xs">
                <p className="font-semibold">¿Qué es una API key?</p>
                <p className="mt-1 text-muted-foreground">
                  Es una clave personal que el proveedor te da gratis al registrarte.
                  Permite que DataPath haga consultas en tu nombre. Tu key se guarda
                  cifrada localmente con safeStorage de Electron — nunca sale de tu
                  máquina excepto al provider que tú elijas.
                </p>
                <p className="mt-2 font-semibold">¿Cuánto cuesta?</p>
                <p className="mt-1 text-muted-foreground">
                  Cero. Cerebras y Groq tienen tiers gratuitos generosos (miles de
                  requests al día) suficientes para un uso normal de estudio.
                </p>
              </PopoverContent>
            </Popover>
          </div>
          <CardDescription>
            Conecta uno o varios proveedores OpenAI-compatible. Las API keys se cifran
            con safeStorage del sistema operativo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {encryptionOk === false && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertTriangle className="h-4 w-4" />
              safeStorage no está disponible en este sistema. Las keys no se podrán
              guardar de forma segura.
            </div>
          )}

          {/* Provider activo + fallback */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Proveedor primario
              </div>
              <select
                value={settings.activeProvider}
                onChange={(e) => void patch({ activeProvider: e.target.value as ProviderId })}
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              >
                {providerOrder.map((id) => (
                  <option key={id} value={id}>
                    {providers[id].name} {configured.includes(id) ? '✓' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Fallback automático
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={settings.fallbackProvider ?? ''}
                  onChange={(e) =>
                    void patch({
                      fallbackProvider: (e.target.value || null) as ProviderId | null,
                    })
                  }
                  disabled={!settings.fallbackEnabled}
                  className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-sm disabled:opacity-50"
                >
                  <option value="">— ninguno —</option>
                  {providerOrder
                    .filter((id) => id !== settings.activeProvider)
                    .map((id) => (
                      <option key={id} value={id}>
                        {providers[id].name} {configured.includes(id) ? '✓' : ''}
                      </option>
                    ))}
                </select>
                <label className="flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={settings.fallbackEnabled}
                    onChange={(e) => void patch({ fallbackEnabled: e.target.checked })}
                  />
                  ON
                </label>
              </div>
            </div>
          </div>

          {/* Modelo del provider activo */}
          <div>
            <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Modelo ({providers[settings.activeProvider].name})
            </div>
            <select
              value={
                settings.modelByProvider[settings.activeProvider] ??
                providers[settings.activeProvider].defaultModel
              }
              onChange={(e) =>
                void patch({
                  modelByProvider: {
                    ...settings.modelByProvider,
                    [settings.activeProvider]: e.target.value,
                  },
                })
              }
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            >
              {providers[settings.activeProvider].models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Provider cards */}
      {providerOrder.map((id) => (
        <ProviderCard
          key={id}
          providerId={id}
          configured={configured.includes(id)}
          usage={usage[id]}
          onUpdate={() => void refresh()}
        />
      ))}

      {/* Fallback logs */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Log de fallbacks (últimas {logs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-xs">
              {logs.slice(0, 10).map((l, i) => (
                <li key={i} className="flex items-center gap-2">
                  {l.ok ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-destructive" />
                  )}
                  <span className="font-medium">{providers[l.provider].name}</span>
                  {l.error && <span className="text-muted-foreground">— {l.error}</span>}
                  <span className="ml-auto text-muted-foreground">
                    {new Date(l.ts).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface ProviderCardProps {
  providerId: ProviderId;
  configured: boolean;
  usage?: { requests: number; tokens: number };
  onUpdate: () => void;
}

function ProviderCard({ providerId, configured, usage, onUpdate }: ProviderCardProps) {
  const meta = providers[providerId];
  const [key, setKey] = useState('');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  async function save() {
    if (!key.trim()) return;
    setBusy(true);
    setStatus('idle');
    setStatusMsg(null);
    try {
      // Validar antes de guardar
      const validation = await window.datapath.ai.validateKey({
        provider: providerId,
        key,
        customEndpoint: customEndpoint || undefined,
      });
      if (!validation.ok) {
        setStatus('error');
        setStatusMsg(validation.error ?? 'No se pudo validar la key');
        setBusy(false);
        return;
      }
      const result = await window.datapath.ai.saveKey({
        provider: providerId,
        key,
        customEndpoint: customEndpoint || undefined,
      });
      if (result.ok) {
        setStatus('ok');
        setStatusMsg('Key validada y guardada');
        setKey('');
        onUpdate();
      } else {
        setStatus('error');
        setStatusMsg(result.error ?? 'Error al guardar');
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    await window.datapath.ai.deleteKey(providerId);
    setStatus('idle');
    setStatusMsg(null);
    onUpdate();
  }

  const limits = meta.rateLimits;
  const limitText = [
    limits.perMinute ? `${limits.perMinute}/min` : null,
    limits.perDay ? `${limits.perDay.toLocaleString()}/día` : null,
    limits.tokensPerDay ? `${(limits.tokensPerDay / 1000).toFixed(0)}K tokens/día` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const usagePercent =
    usage && limits.perDay ? Math.min(100, (usage.requests / limits.perDay) * 100) : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">{meta.name}</CardTitle>
          {configured ? (
            <Badge variant="secondary" className="border border-success/40 bg-success/10 text-success">
              <Check className="mr-1 h-3 w-3" />
              configurado
            </Badge>
          ) : (
            <Badge variant="secondary">no configurado</Badge>
          )}
          {meta.signupUrl && (
            <a
              href={meta.signupUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
            >
              Obtener key gratis
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        {limitText && (
          <CardDescription className="text-xs">
            Límites: {limitText}
            {meta.notes && <span className="ml-1 italic">— {meta.notes}</span>}
          </CardDescription>
        )}
        {meta.privacyNote && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-warning">
            <AlertTriangle className="h-3 w-3" />
            {meta.privacyNote}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {providerId === 'custom' && (
          <div>
            <div className="mb-1 text-xs text-muted-foreground">Endpoint OpenAI-compat</div>
            <Input
              type="url"
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value)}
              placeholder="https://api.example.com/v1/chat/completions"
            />
          </div>
        )}

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={show ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={configured ? '••••• (key ya guardada)' : 'sk-...'}
              className="pr-9"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          <Button onClick={save} disabled={!key || busy} size="sm">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Validar y guardar'}
          </Button>
          {configured && (
            <Button variant="outline" size="icon" onClick={remove} aria-label="Eliminar key">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {statusMsg && (
          <div
            className={cn(
              'rounded-md border p-2 text-xs',
              status === 'ok'
                ? 'border-success/40 bg-success/10 text-success'
                : 'border-destructive/40 bg-destructive/10 text-destructive',
            )}
          >
            {statusMsg}
          </div>
        )}

        {usage && (
          <div className="space-y-1 rounded-md border border-border/60 p-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Hoy:</span>
              <span className="tabular-nums">
                {usage.requests} req · {usage.tokens.toLocaleString()} tokens
              </span>
            </div>
            {usagePercent !== null && (
              <div className="h-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    'h-full transition-all',
                    usagePercent >= 80 ? 'bg-warning' : 'bg-primary',
                  )}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            )}
            {usagePercent !== null && usagePercent >= 80 && (
              <div className="flex items-center gap-1 text-[10px] text-warning">
                <AlertTriangle className="h-3 w-3" />
                {Math.round(usagePercent)}% del límite diario
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

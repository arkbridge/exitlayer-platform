'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Key, Loader2, CheckCircle2, ExternalLink, Eye, EyeOff } from 'lucide-react';

export default function ApiKeySettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [currentKeyPreview, setCurrentKeyPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch current key preview
    const fetchKey = async () => {
      const response = await fetch('/api/settings/api-key');
      if (response.ok) {
        const data = await response.json();
        setCurrentKeyPreview(data.keyPreview);
      }
    };
    fetchKey();
  }, []);

  const validateKey = async () => {
    if (!apiKey.startsWith('sk-ant-')) {
      setError('Invalid API key format. Anthropic keys start with "sk-ant-"');
      setIsValid(false);
      return false;
    }

    setValidating(true);
    setError(null);

    try {
      const response = await fetch('/api/validate-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();

      if (data.valid) {
        setIsValid(true);
        return true;
      } else {
        setError(data.error || 'Invalid API key');
        setIsValid(false);
        return false;
      }
    } catch {
      setError('Failed to validate API key');
      setIsValid(false);
      return false;
    } finally {
      setValidating(false);
    }
  };

  const handleSave = async () => {
    setError(null);

    const valid = await validateKey();
    if (!valid) return;

    setLoading(true);

    try {
      const response = await fetch('/api/settings/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save API key');
      }

      const data = await response.json();
      setCurrentKeyPreview(data.keyPreview);
      setApiKey('');
      setIsValid(null);
      toast.success('API key saved successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save API key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API Key</h1>
        <p className="text-gray-500">Manage your Anthropic API key</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Anthropic API Key
          </CardTitle>
          <CardDescription>
            Your API key is used to execute skills with Claude.
            It&apos;s encrypted and never shared.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentKeyPreview && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">API key configured</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Current key: {currentKeyPreview}
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="apiKey">
              {currentKeyPreview ? 'Update API Key' : 'API Key'}
            </Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                placeholder="sk-ant-..."
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setIsValid(null);
                  setError(null);
                }}
                className={isValid === true ? 'pr-10 border-green-500' : ''}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Get your API key from{' '}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline inline-flex items-center gap-1"
              >
                console.anthropic.com
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={loading || validating || !apiKey}
          >
            {(loading || validating) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {validating ? 'Validating...' : loading ? 'Saving...' : 'Save API Key'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage & Billing</CardTitle>
          <CardDescription>
            API usage is billed directly to your Anthropic account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Exit Layer doesn&apos;t charge for AI usage. All Claude API calls are billed
            directly to your Anthropic account. You can monitor usage and set limits
            in the Anthropic console.
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <a
              href="https://console.anthropic.com/settings/usage"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Usage in Anthropic Console
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

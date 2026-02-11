'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Copy, Eye, EyeOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function DemoApiKeyPage() {
  const [showKey, setShowKey] = useState(false);
  const apiKey = 'xl_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-medium text-[#1a1a1a]">API Key</h1>
        <p className="text-[#666]">Manage your API access credentials</p>
      </div>

      <Card className="border-[#e5e5e5]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <Key className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-base text-[#1a1a1a]">Production API Key</CardTitle>
              <CardDescription className="text-[#666]">Use this key to authenticate API requests</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[#f8f8f6] border border-[#e5e5e5] rounded-lg px-4 py-3 font-mono text-sm">
              {showKey ? apiKey : '•'.repeat(apiKey.length)}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="border-[#e5e5e5]"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-[#e5e5e5]"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              Active
            </Badge>
            <span className="text-[#999]">Created Dec 15, 2024</span>
            <span className="text-[#999]">Last used 2 hours ago</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Keep your API key secure</p>
              <p className="text-sm text-amber-700 mt-1">
                Never share your API key publicly or commit it to version control.
                If you believe your key has been compromised, regenerate it immediately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#e5e5e5]">
        <CardHeader>
          <CardTitle className="text-base text-[#1a1a1a]">Regenerate API Key</CardTitle>
          <CardDescription className="text-[#666]">
            Generate a new API key. Your old key will be immediately invalidated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate Key
          </Button>
        </CardContent>
      </Card>

      <Card className="border-[#e5e5e5]">
        <CardHeader>
          <CardTitle className="text-base text-[#1a1a1a]">API Usage</CardTitle>
          <CardDescription className="text-[#666]">Your API usage this billing period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-[#666]">API Calls</span>
                <span className="font-medium text-[#1a1a1a]">2,847 / 10,000</span>
              </div>
              <div className="h-2 bg-[#e5e5e5] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '28.47%' }} />
              </div>
            </div>
            <p className="text-xs text-[#999]">Resets on March 1, 2025</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

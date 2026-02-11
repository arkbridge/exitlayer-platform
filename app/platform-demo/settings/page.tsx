'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Shield, Globe, Palette } from 'lucide-react';

export default function DemoSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-medium text-[#1a1a1a]">Settings</h1>
        <p className="text-[#666]">Manage your account preferences</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-[#e5e5e5]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base text-[#1a1a1a]">Notifications</CardTitle>
                <CardDescription className="text-[#666]">Configure how you receive alerts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#1a1a1a]">Email notifications</p>
                <p className="text-sm text-[#666]">Receive email alerts for important events</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#1a1a1a]">Slack notifications</p>
                <p className="text-sm text-[#666]">Get notified in your Slack workspace</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#1a1a1a]">Approval reminders</p>
                <p className="text-sm text-[#666]">Remind me about pending approvals</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e5e5e5]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-base text-[#1a1a1a]">Security</CardTitle>
                <CardDescription className="text-[#666]">Manage security preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#1a1a1a]">Require approval for emails</p>
                <p className="text-sm text-[#666]">All outgoing emails require manual approval</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#1a1a1a]">Require approval for Slack posts</p>
                <p className="text-sm text-[#666]">Review Slack messages before they're sent</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#1a1a1a]">Two-factor authentication</p>
                <p className="text-sm text-[#666]">Add an extra layer of security</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e5e5e5]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Globe className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-base text-[#1a1a1a]">Organization</CardTitle>
                <CardDescription className="text-[#666]">Manage your organization settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Organization name</label>
                <input
                  type="text"
                  defaultValue="Acme Agency"
                  className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Timezone</label>
                <select className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option>America/New_York (EST)</option>
                  <option>America/Los_Angeles (PST)</option>
                  <option>Europe/London (GMT)</option>
                </select>
              </div>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Save changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

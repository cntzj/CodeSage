'use client';

import { FormEvent, useState } from 'react';

import { updateProjectConfig } from '@/lib/api';

interface PageProps {
  params: { id: string };
}

export default function SettingsPage({ params }: PageProps) {
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice('');

    const formData = new FormData(event.currentTarget);
    const payload = {
      model: formData.get('model'),
      reviewRules: {
        security: formData.get('security') === 'on',
        performance: formData.get('performance') === 'on',
        maintainability: formData.get('maintainability') === 'on',
      },
      notifications: {
        slack: formData.get('slackWebhook'),
        discord: formData.get('discordWebhook'),
      },
      webhook: {
        secret: formData.get('webhookSecret'),
      },
    };

    try {
      await updateProjectConfig(params.id, payload);
      setNotice('配置已保存。');
    } catch {
      setNotice('保存失败，请检查后端连接。');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="page-title">项目设置</h2>

      <form onSubmit={onSubmit} className="card grid gap-4 p-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span>AI 模型</span>
          <select name="model" defaultValue="gpt-4.1" className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2">
            <option value="gpt-4.1">gpt-4.1</option>
            <option value="gpt-4.1-mini">gpt-4.1-mini</option>
            <option value="gpt-4o-mini">gpt-4o-mini</option>
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span>GitHub Webhook Secret</span>
          <input name="webhookSecret" className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2" />
        </label>

        <label className="space-y-1 text-sm">
          <span>Slack Webhook URL</span>
          <input name="slackWebhook" className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2" />
        </label>

        <label className="space-y-1 text-sm">
          <span>Discord Webhook URL</span>
          <input name="discordWebhook" className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2" />
        </label>

        <div className="space-y-2 text-sm md:col-span-2">
          <p className="font-medium">审查规则</p>
          <div className="grid gap-2 sm:grid-cols-3">
            <label className="inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-3 py-2">
              <input name="security" type="checkbox" defaultChecked />
              Security
            </label>
            <label className="inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-3 py-2">
              <input name="performance" type="checkbox" defaultChecked />
              Performance
            </label>
            <label className="inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-3 py-2">
              <input name="maintainability" type="checkbox" defaultChecked />
              Maintainability
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-60 md:col-span-2 md:w-fit"
        >
          {saving ? '保存中...' : '保存配置'}
        </button>
        {notice ? <p className="text-sm text-tide md:col-span-2">{notice}</p> : null}
      </form>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { useToast } from '../../context/ToastContext';
import { API_BASE_URL } from '../../api/client';
import { settingsService } from '../../api/settingsService';
import { Settings, Server, MapPin, Bell, Shield, Save, CheckCircle2 } from 'lucide-react';

export const AdminSettingsPage = () => {
  const toast = useToast();
  const [settings, setSettings] = useState({
    slaWarningThresholdHours: 6,
    autoAssignEnabled: false,
    emailNotifications: true,
    publicExplorerEnabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getSettings();
        if (data && typeof data === 'object') {
          setSettings((prev) => ({
            ...prev,
            ...(data.data || data),
          }));
        }
      } catch (err) {
        console.warn('Could not fetch settings from backend:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.updateSettings(settings);
      toast.success('Settings Saved', 'Platform administrative preferences updated.');
    } catch (err) {
      toast.error('Failed to Save Settings', err.message);
    } finally {
      setSaving(false);
    }
  };

  const googleMapsConfigured = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        role="admin"
        title="Platform & Integration Settings"
        subtitle="Manage municipal operational thresholds, backend service bindings, and public access policies."
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Environment Integrations Card */}
        <GlassCard tint="admin" className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-700" />
            <h3 className="font-bold text-base text-[#252238]">Active Backend Integration</h3>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#E9E5F0] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-500">Configured API Base URL:</span>
              <code className="font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                {API_BASE_URL}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-500">Google Maps Platform Integration:</span>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  googleMapsConfigured ? 'text-emerald-700' : 'text-amber-800'
                }`}
              >
                {googleMapsConfigured ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active Tiles API Key
                  </>
                ) : (
                  'Interactive Vector Grid Fallback (No live key set)'
                )}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Operational Policies */}
        <GlassCard className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-700" />
            <h3 className="font-bold text-base text-[#252238]">SLA & Notification Parameters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#252238] mb-1">
                SLA Breach Warning Threshold (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="48"
                value={settings.slaWarningThresholdHours}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    slaWarningThresholdHours: Number(e.target.value),
                  })
                }
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#E9E5F0] rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
              />
              <span className="text-[11px] text-[#6B687A] mt-1 block">
                Flag manager dashboard when an incident is within this many hours of breach
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) =>
                    setSettings({ ...settings, emailNotifications: e.target.checked })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs font-bold text-[#252238]">
                  Enable Citizen Email Notifications
                </span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E9E5F0] flex justify-end">
            <GradientButton
              type="submit"
              role="admin"
              size="md"
              loading={saving}
              icon={Save}
            >
              Save Configuration
            </GradientButton>
          </div>
        </GlassCard>
      </form>
    </div>
  );
};

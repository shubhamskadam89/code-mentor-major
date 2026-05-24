import React, { useState, useEffect } from 'react'
import {
  Moon,
  Sun,
  Bell,
  Shield,
  Database,
  Trash2,
  Info,
  ExternalLink,
  Code,
  Lightbulb,
  BarChart3
} from 'lucide-react'
import { useExtensionState } from '../hooks/useExtensionState'

interface SettingsState {
  theme: 'light' | 'dark' | 'system'
  enabled: boolean
  showHints: boolean
  showProgress: boolean
  autoCapture: boolean
  notifications: boolean
  dataCollection: boolean
}

const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, resetProgress, logout } = useExtensionState()

  const [localSettings, setLocalSettings] = useState<SettingsState>({
    theme: 'system',
    enabled: true,
    showHints: true,
    showProgress: true,
    autoCapture: true,
    notifications: true,
    dataCollection: false
  })

  useEffect(() => {
    setLocalSettings(prev => ({ ...prev, ...settings }))
  }, [settings])

  const handleSettingChange = (key: keyof SettingsState, value: any) => {
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
    updateSettings(newSettings)
  }

  const SettingItem: React.FC<{
    icon: React.ReactNode
    title: string
    description: string
    children: React.ReactNode
  }> = ({ icon, title, description, children }) => (
    <div className="flex items-center justify-between p-3.5 bg-white dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center space-x-3.5">
        <div className="p-2 bg-zinc-100 dark:bg-zinc-700/50 rounded-lg text-zinc-600 dark:text-zinc-300">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            {description}
          </p>
        </div>
      </div>
      {children}
    </div>
  )

  const Toggle: React.FC<{
    enabled: boolean
    onChange: (enabled: boolean) => void
  }> = ({ enabled, onChange }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-300 focus-visible:ring-offset-2 ${enabled ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-200 dark:bg-zinc-700'
        }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-zinc-900 transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
          } shadow-sm`}
      />
    </button>
  )

  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
          Settings
        </h2>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
          Customize your CodeMentor experience
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* General */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
            General
          </h3>

          <div className="space-y-3">

            <SettingItem
              icon={<Code className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
              title="Extension Status"
              description="Enable or disable CodeMentor"
            >
              <Toggle
                enabled={localSettings.enabled}
                onChange={(enabled) => handleSettingChange('enabled', enabled)}
              />
            </SettingItem>

            <SettingItem
              icon={localSettings.theme === 'dark'
                ? <Moon className="w-4 h-4" />
                : <Sun className="w-4 h-4" />}
              title="Theme"
              description="Choose your preferred theme"
            >
              <select
                value={localSettings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="text-sm font-medium border border-zinc-300 dark:border-zinc-700 rounded-md px-2 py-1.5 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300 outline-none transition-shadow"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </SettingItem>

            <SettingItem
              icon={<Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
              title="Notifications"
              description="Receive hints and updates"
            >
              <Toggle
                enabled={localSettings.notifications}
                onChange={(val) => handleSettingChange('notifications', val)}
              />
            </SettingItem>

          </div>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 mt-6">
            Features
          </h3>

          <div className="space-y-3">

            <SettingItem
              icon={<Lightbulb className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
              title="Show Hints"
              description="Display real-time hints"
            >
              <Toggle
                enabled={localSettings.showHints}
                onChange={(val) => handleSettingChange('showHints', val)}
              />
            </SettingItem>

            <SettingItem
              icon={<BarChart3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
              title="Progress Tracking"
              description="Track your coding progress"
            >
              <Toggle
                enabled={localSettings.showProgress}
                onChange={(val) => handleSettingChange('showProgress', val)}
              />
            </SettingItem>

            <SettingItem
              icon={<Database className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
              title="Auto Capture"
              description="Automatically capture code changes"
            >
              <Toggle
                enabled={localSettings.autoCapture}
                onChange={(val) => handleSettingChange('autoCapture', val)}
              />
            </SettingItem>

          </div>
        </div>

        {/* Privacy */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 mt-6">
            Privacy
          </h3>

          <SettingItem
            icon={<Shield className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
            title="Data Collection"
            description="Allow anonymous analytics"
          >
            <Toggle
              enabled={localSettings.dataCollection}
              onChange={(val) => handleSettingChange('dataCollection', val)}
            />
          </SettingItem>
        </div>

        {/* Reset */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 mt-6">
            Data
          </h3>

          <SettingItem
            icon={<Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
            title="Reset Progress"
            description="Clear all progress data"
          >
            <button
              onClick={resetProgress}
              className="px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 rounded-md hover:bg-red-500/20 transition-colors"
            >
              Reset
            </button>
          </SettingItem>
        </div>

        {/* About */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 mt-6">
            About
          </h3>

          <SettingItem
            icon={<Info className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
            title="Version"
            description="CodeMentor v1.0.0"
          >
            <span className="text-sm text-gray-600 dark:text-gray-400">
              v1.0.0
            </span>
          </SettingItem>

          <SettingItem
            icon={<ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
            title="Support"
            description="Get help and report issues"
          >
            <span className="text-sm text-blue-600">Help Center</span>
          </SettingItem>

        </div>

        {/* Account */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 mt-6">
            Account
          </h3>

          <div className="flex items-center justify-between p-3.5 bg-white dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center space-x-3.5">
              <div className="p-2 bg-zinc-105 dark:bg-zinc-700/50 rounded-lg text-zinc-600 dark:text-zinc-300">
                👤
              </div>
              <div>
                <h3 className="text-sm font-medium tracking-tight text-zinc-900 dark:text-zinc-100">Sign Out</h3>
                <p className="text-[11px] text-zinc-550 dark:text-zinc-400 mt-0.5">Unlink this extension from your account</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-3.5 py-2 text-xs font-black bg-red-500 hover:bg-red-650 text-white rounded-lg transition shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          Made with ❤️ for developers
        </p>
      </div>

    </div>
  )
}

export { SettingsPanel }

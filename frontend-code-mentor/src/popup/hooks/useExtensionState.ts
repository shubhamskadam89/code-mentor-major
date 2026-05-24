import { useState, useEffect, useCallback } from 'react'

interface ProblemInfo {
  id: string
  title: string
  language: string
  platform: string
  difficulty?: string
}

interface ProgressData {
  attempts: number
  hintsUsed: number[]
  timeSpent: number
  lastAttempt: number
  solved: boolean
  difficulty: string
}

interface Settings {
  theme: 'light' | 'dark' | 'system'
  enabled: boolean
  showHints: boolean
  showProgress: boolean
  autoCapture: boolean
  notifications: boolean
  dataCollection: boolean
}

export interface AssignmentContext {
  title: string
  course: string
  dueDate: string
  problemsSolved: number
  totalProblems: number
  status: string
}

export const useExtensionState = () => {

  const [isEnabled, setIsEnabled] = useState(true)
  const [currentProblem, setCurrentProblem] = useState<ProblemInfo | null>(null)
  const [progress, setProgress] = useState<Record<string, ProgressData>>({})
  const [settings, setSettings] = useState<Settings>({
    theme: 'system',
    enabled: true,
    showHints: true,
    showProgress: true,
    autoCapture: true,
    notifications: true,
    dataCollection: false
  })

  const [isAuth, setIsAuth] = useState<boolean>(false)
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [email, setEmail] = useState('')
  const [handle, setHandle] = useState('')
  const [activeAssignmentContext, setActiveAssignmentContext] = useState<AssignmentContext | null>(null)

  // 🔹 Load initial state
  useEffect(() => {
    const loadState = async () => {
      try {
        const result = await chrome.storage.local.get([
          'settings',
          'userProgress',
          'currentProblem',
          'codementor_token',
          'activeAssignmentContext',
          'user_role',
          'codementor_email',
          'codementor_handle'
        ])

        if (result.settings) {
          setSettings(result.settings)
          setIsEnabled(result.settings.enabled)
        }

        if (result.userProgress) {
          setProgress(result.userProgress)
        }

        if (result.currentProblem) {
          setCurrentProblem(result.currentProblem)
        }
        
        if (result.activeAssignmentContext) {
          setActiveAssignmentContext(result.activeAssignmentContext)
        }
        
        setIsAuth(!!result.codementor_token)
        if (result.user_role) setRole(result.user_role)
        if (result.codementor_email) setEmail(result.codementor_email)
        if (result.codementor_handle) setHandle(result.codementor_handle)

      } catch (error) {
        console.error('Failed to load extension state:', error)
      }
    }

    loadState()
  }, [])

  // 🔹 Listen for storage updates
  useEffect(() => {

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {

      if (changes.settings) {
        setSettings(changes.settings.newValue)
        setIsEnabled(changes.settings.newValue.enabled)
      }

      if (changes.userProgress) {
        setProgress(changes.userProgress.newValue)
      }

      if (changes.currentProblem) {
        setCurrentProblem(changes.currentProblem.newValue)
      }

      // ⭐ Force re-render when hints update
      if (changes.latestHints) {
        console.log("Hints updated:", changes.latestHints.newValue)

        // force rerender
        setCurrentProblem(prev => prev ? { ...prev } : prev)
      }
      if (changes.codementor_token) {
        setIsAuth(!!changes.codementor_token.newValue)
      }

      if (changes.user_role) {
        setRole(changes.user_role.newValue || 'student')
      }

      if (changes.codementor_email) {
        setEmail(changes.codementor_email.newValue || '')
      }

      if (changes.codementor_handle) {
        setHandle(changes.codementor_handle.newValue || '')
      }

      if (changes.activeAssignmentContext) {
        setActiveAssignmentContext(changes.activeAssignmentContext.newValue || null)
      }

    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => chrome.storage.onChanged.removeListener(handleStorageChange)

  }, [])

  // 🔹 Toggle extension
  const toggleExtension = useCallback(async () => {
    const newEnabled = !isEnabled
    const newSettings = { ...settings, enabled: newEnabled }

    try {
      await chrome.storage.local.set({ settings: newSettings })
      setIsEnabled(newEnabled)
    } catch (error) {
      console.error('Failed to toggle extension:', error)
    }
  }, [isEnabled, settings])

  // 🔹 Update settings
  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings }

    try {
      await chrome.storage.local.set({ settings: updatedSettings })
      setSettings(updatedSettings)
    } catch (error) {
      console.error('Failed to update settings:', error)
    }
  }, [settings])

  // 🔹 Save progress
  const saveProgress = useCallback(async (problemId: string, data: Partial<ProgressData>) => {

    const currentProgress = progress[problemId] || {
      attempts: 0,
      hintsUsed: [],
      timeSpent: 0,
      lastAttempt: Date.now(),
      solved: false,
      difficulty: 'unknown'
    }

    const updatedProgress = {
      ...currentProgress,
      ...data,
      lastAttempt: Date.now()
    }

    const newProgress = {
      ...progress,
      [problemId]: updatedProgress
    }

    try {
      await chrome.storage.local.set({ userProgress: newProgress })
      setProgress(newProgress)
    } catch (error) {
      console.error('Failed to save progress:', error)
    }

  }, [progress])

  // 🔹 RESET progress
  const resetProgress = useCallback(async () => {
    await chrome.storage.local.remove('userProgress')
    setProgress({})
  }, [])

  // ⭐⭐⭐⭐⭐ IMPORTANT FIX ⭐⭐⭐⭐⭐
  // 🔹 READ hints from storage (NOT API)
const getHints = async () => {
  try {
    const result = await chrome.storage.local.get("latestHints")

    if (!result.latestHints || !result.latestHints.hints) return []

    return result.latestHints.hints.map((hint: string, index: number) => ({
      id: index,
      type: "logic",
      message: hint,
      severity: "medium",
      timestamp: Date.now()
    }))
  } catch (err) {
    console.error("Hint read error:", err)
    return []
  }
}


  // 🔹 Send code to AI
  const sendCodeToAI = useCallback(async (code: string, language: string, problemId: string) => {
    try {
      return await chrome.runtime.sendMessage({
        type: 'SEND_CODE_TO_AI',
        data: { code, language, problemId }
      })
    } catch (error) {
      console.error('Failed to send code to AI:', error)
      return null
    }
  }, [])

  // 🔹 Logout
  const logout = useCallback(async () => {
    try {
      await chrome.storage.local.remove([
        'codementor_token',
        'codementor_handle',
        'codementor_email',
        'currentProblem',
        'activeAssignmentContext',
        'latestHints'
      ])
      setIsAuth(false)
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }, [])

  return {
    isAuth,
    role,
    email,
    handle,
    isEnabled,
    currentProblem,
    progress,
    settings,
    activeAssignmentContext,
    toggleExtension,
    updateSettings,
    saveProgress,
    resetProgress,
    getHints,
    sendCodeToAI,
    logout
  }
}

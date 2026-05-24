import { useEffect, useState } from "react"
import { Copy, Check, Sparkles, ExternalLink, BookOpen } from "lucide-react"

interface Hint {
  id: number
  message: string
  type?: 'syntax' | 'logic' | 'performance' | 'best-practice'
  severity?: 'low' | 'medium' | 'high'
}

export default function HintPanel() {
  const [hints, setHints] = useState<Hint[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  // Load hints when panel opens
  useEffect(() => {
    chrome.storage.local.get(["latestHints"], (result) => {
      if (result.latestHints) {
        console.log("Loaded hints from storage:", result.latestHints)
        // Check if latestHints is the raw array or wrapped in an object
        const hintList = Array.isArray(result.latestHints) 
          ? result.latestHints 
          : (result.latestHints.hints || [])
        setHints(hintList)
      }
    })

    // Listen for live updates from background
    const messageListener = (msg: any) => {
      if (msg.type === "HINT_UPDATE") {
        console.log("Received live hint update:", msg.data)
        setHints(msg.data.hints || [])
        setLoading(false)
      }
    }

    chrome.runtime.onMessage.addListener(messageListener)

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [])

  const requestHint = () => {
    setLoading(true)
    chrome.runtime.sendMessage({ type: "REQUEST_HINT" }, () => {
      if (chrome.runtime.lastError) {
        console.error("Failed to request hint:", chrome.runtime.lastError)
        setLoading(false)
      }

      // Failsafe reset after 20s if analysis stalls
      setTimeout(() => setLoading(false), 20000)
    })
  }

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getSeverityStyles = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return {
          border: 'border-l-red-500 dark:border-l-red-650',
          bg: 'bg-red-500/5 dark:bg-red-500/10',
          badge: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
          label: 'Critical'
        }
      case 'medium':
        return {
          border: 'border-l-amber-500 dark:border-l-amber-600',
          bg: 'bg-amber-500/5 dark:bg-amber-500/10',
          badge: 'bg-amber-100 text-amber-700 dark:bg-amber-955/30 dark:text-amber-400',
          label: 'Logic Hint'
        }
      case 'low':
      default:
        return {
          border: 'border-l-emerald-500 dark:border-l-emerald-600',
          bg: 'bg-emerald-500/5 dark:bg-emerald-500/10',
          badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
          label: 'Advice'
        }
    }
  }

  return (
    <div className="flex flex-col h-full h-[calc(100vh-140px)] bg-zinc-50 dark:bg-zinc-950">
      {/* Ask Action Header */}
      <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shrink-0 space-y-3 shadow-sm">
        <button
          onClick={requestHint}
          disabled={loading}
          className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-extrabold transition shadow-sm ${
            loading
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-wait'
              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/10'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Analyzing Editor Code...' : 'Request AI Hint'}</span>
        </button>

        <button
          onClick={() => chrome.runtime.openOptionsPage()}
          className="w-full flex items-center justify-center space-x-1.5 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl transition"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Open Full Dashboard</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Hints Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && (
          <div className="space-y-3 animate-pulse">
            <div className="bg-zinc-150 dark:bg-zinc-900 h-24 rounded-2xl w-full"></div>
            <div className="bg-zinc-150 dark:bg-zinc-900 h-20 rounded-2xl w-full"></div>
          </div>
        )}

        {!loading && !hints.length ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl flex items-center justify-center text-2xl shadow-sm">
              💡
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">Tutoring Assistant Idle</h4>
              <p className="text-[11px] text-zinc-405 dark:text-zinc-500 max-w-xs font-medium px-6">
                Start typing code in the supported browser tab, then request a hint to get logic advice.
              </p>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="space-y-3">
              {hints.map((hint, idx) => {
                const styles = getSeverityStyles(hint.severity);
                return (
                  <div
                    key={hint.id || idx}
                    className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-sm rounded-2xl border-l-4 ${styles.border} ${styles.bg} p-4 transition-all hover:shadow-md flex flex-col space-y-3`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${styles.badge}`}>
                        {styles.label}
                      </span>
                      <button
                        onClick={() => handleCopy(hint.id || idx, hint.message)}
                        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-650 rounded-lg transition"
                        title="Copy Hint"
                      >
                        {copiedId === (hint.id || idx) ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-start space-x-2.5">
                      <div className="text-sm font-semibold text-zinc-805 dark:text-zinc-200 leading-relaxed">
                        {hint.message}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from "react"

function IndexPopup() {
  const [tabCount, setTabCount] = useState(0)
  const [groupCount, setGroupCount] = useState(0)
  const [isGrouping, setIsGrouping] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const tabs = await chrome.tabs.query({ currentWindow: true })
    const groups = await chrome.tabGroups.query({
      windowId: chrome.windows.WINDOW_ID_CURRENT
    })

    setTabCount(tabs.length)
    setGroupCount(groups.length)
  }

  async function handleGroupTabs() {
    setIsGrouping(true)
    await chrome.runtime.sendMessage({ type: "GROUP_TABS" })
    await loadStats()
    setIsGrouping(false)
  }

  return (
    <div style={{
      width: 300,
      padding: 20,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
           📁 Tab Grouper
        </h2>
        <p style={{ margin: "8px 0 0", fontSize: 13, color: "#666" }}>
          Organize your tabs by domain
        </p>
      </div>

      <div style={{
        display: "flex",
        gap: 12,
        marginBottom: 20,
        padding: 12,
        background: "#f5f5f5",
        borderRadius: 8
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: "#333" }}>
            {tabCount}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            Open Tabs
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: "#0066ff" }}>
            {groupCount}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            Tab Groups
          </div>
        </div>
      </div>

      <button
        onClick={handleGroupTabs}
        disabled={isGrouping}
        style={{
          width: "100%",
          padding: "12px 16px",
          fontSize: 14,
          fontWeight: 500,
          color: "white",
          background: isGrouping ? "#ccc" : "#0066ff",
          border: "none",
          borderRadius: 8,
          cursor: isGrouping ? "not-allowed" : "pointer",
          transition: "background 0.2s"
        }}
      >
        {isGrouping ? "Grouping..." : "🗂️ Group Tabs by Domain"}
      </button>

      <div style={{
        marginTop: 16,
        padding: 12,
        fontSize: 12,
        color: "#666",
        background: "#fff9e6",
        borderRadius: 6,
        border: "1px solid #ffe066"
      }}>
        💡 <strong>Tip:</strong> This will group all tabs in this window by their website domain.
      </div>
    </div>
  )
}

export default IndexPopup
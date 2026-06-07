export {}

console.log("Tab Grouper background script loaded!")

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GROUP_TABS") {
    groupTabsByDomain()
    sendResponse({ success: true })
  }
  return true
})

async function groupTabsByDomain() {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true })
    const domainGroups = new Map<string, chrome.tabs.Tab[]>()

    tabs.forEach(tab => {
      if (!tab.url) return
      const domain = getDomainFromUrl(tab.url)
      if (!domain) return

      if (!domainGroups.has(domain)) {
        domainGroups.set(domain, [])
      }
      domainGroups.get(domain)!.push(tab)
    })

    for (const [domain, domainTabs] of domainGroups) {
      if (domainTabs.length < 2) continue

      const tabIds = domainTabs
        .map(t => t.id!)
        .filter(id => id !== undefined)

      if (tabIds.length === 0) continue

      const groupId = await chrome.tabs.group({ tabIds })

      await chrome.tabGroups.update(groupId, {
        title: domain,
        color: getColorForDomain(domain)
      })
    }

    console.log(`Successfully grouped ${domainGroups.size} domains`)
  } catch (error) {
    console.error("Error grouping tabs:", error)
  }
}

function getDomainFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    if (urlObj.protocol === "chrome:" || urlObj.protocol === "chrome-extension:") {
      return null
    }
    return urlObj.hostname.replace(/^www\./, "")
  } catch {
    return null
  }
}

function getColorForDomain(domain: string): chrome.tabGroups.ColorEnum {
  const colors: chrome.tabGroups.ColorEnum[] = [
    "blue", "red", "yellow", "green", "pink", "purple", "cyan", "orange"
  ]

  let hash = 0
  for (let i = 0; i < domain.length; i++) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

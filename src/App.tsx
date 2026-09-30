import { useEffect, useState } from 'react'
import './App.css'

type MintMark = 'P' | 'D' | 'S' | 'N/A'

type CoinItem = {
  id: string
  date: string
  mintMark: MintMark
  needed: number
  found: number
}

type CoinSet = {
  id: string
  title: string
  description?: string
  items: CoinItem[]
}

type Catalog = {
  sets: CoinSet[]
}

type ViewFilter = 'all' | 'needed' | 'complete'

const STORAGE_KEY = 'coinmgr:found-counts:v1'

function loadFoundCounts(): Record<string, number> {
  if (typeof window === 'undefined') return {}

  try {
    const saved: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')
    if (typeof saved !== 'object' || saved === null || Array.isArray(saved)) return {}

    return Object.fromEntries(
      Object.entries(saved).filter(([, count]) => Number.isInteger(count) && count >= 0),
    ) as Record<string, number>
  } catch {
    return {}
  }
}

function App() {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [foundCounts, setFoundCounts] = useState<Record<string, number>>(loadFoundCounts)
  const [filter, setFilter] = useState<ViewFilter>('all')

  useEffect(() => {
    let active = true

    fetch(`${import.meta.env.BASE_URL}coin-catalog.json`)
      .then((response) => {
        if (!response.ok) throw new Error('Catalog could not be loaded')
        return response.json() as Promise<Catalog>
      })
      .then((data) => {
        if (active) setCatalog(data)
      })
      .catch(() => {
        if (active) setLoadError(true)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(foundCounts))
    } catch (error) {
      console.warn('Collection progress could not be saved in this browser.', error)
    }
  }, [foundCounts])

  const getFound = (item: CoinItem) => foundCounts[item.id] ?? item.found
  const allItems = catalog?.sets.flatMap((set) => set.items) ?? []
  const visibleSets = (catalog?.sets ?? [])
    .map((set) => ({
      ...set,
      items: set.items.filter((item) => {
        const found = getFound(item)
        const matchesFilter =
          filter === 'all' ||
          (filter === 'needed' && found < item.needed) ||
          (filter === 'complete' && found >= item.needed)
        return matchesFilter
      }),
    }))
    .filter((set) => set.items.length > 0)

  const changeFound = (item: CoinItem, amount: number) => {
    setFoundCounts((counts) => ({
      ...counts,
      [item.id]: Math.max(0, (counts[item.id] ?? item.found) + amount),
    }))
  }

  const exportProgress = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      foundCounts: Object.fromEntries(allItems.map((item) => [item.id, getFound(item)])),
    }
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = 'coin-collection-progress.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app-shell">
      <main>
        <section className="intro">
          <div>
            <h1>
              Needed Coin Ledger<span className="title-period">.</span>
            </h1>
          </div>
        </section>

        <section className="collection-tools" aria-label="Collection controls">
          <div className="filter-tabs" role="group" aria-label="Filter entries">
            {(['all', 'needed', 'complete'] as const).map((option) => (
              <button
                type="button"
                key={option}
                className={filter === option ? 'active' : ''}
                aria-pressed={filter === option}
                onClick={() => setFilter(option)}
              >
                {option === 'all'
                  ? 'All entries'
                  : option === 'needed'
                    ? 'Still needed'
                    : 'Complete'}
              </button>
            ))}
          </div>
          <button
            className="export-button"
            type="button"
            onClick={exportProgress}
            disabled={!catalog}
          >
            Export progress
          </button>
        </section>

        {loadError && (
          <p className="notice error" role="alert">
            The public coin catalog could not be loaded. Check that `public/coin-catalog.json` is
            available.
          </p>
        )}
        {!catalog && !loadError && <p className="loading-state">Opening the ledger…</p>}

        <div className="catalog">
          {visibleSets.map((set) => {
            const setCompleted = set.items.filter((item) => getFound(item) >= item.needed).length

            return (
              <section className="set-section" key={set.id}>
                <div className="set-heading">
                  <div>
                    <p className="eyebrow">
                      COLLECTION <span>{set.id.toUpperCase()}</span>
                    </p>
                    <h2>{set.title}</h2>
                    {set.description && <p className="set-description">{set.description}</p>}
                  </div>
                  <span className="set-progress">
                    {setCompleted} / {set.items.length} COMPLETE
                  </span>
                </div>
                <div className="column-head" aria-hidden="true">
                  <span>Date</span>
                  <span>Mint</span>
                  <span>Need</span>
                  <span>Found</span>
                </div>
                <div className="coin-list" role="list">
                  {set.items.map((item) => {
                    const found = getFound(item)
                    const isComplete = found >= item.needed

                    return (
                      <div
                        className={`coin-row${isComplete ? ' is-complete' : ''}`}
                        key={item.id}
                        role="listitem"
                      >
                        <span className="coin-date">{item.date}</span>
                        <span
                          className={`mint-mark mint-${item.mintMark.replace('/', '').toLowerCase()}`}
                        >
                          {item.mintMark}
                        </span>
                        <span className="needed-count">{item.needed}</span>
                        <div className="found-control">
                          <button
                            type="button"
                            aria-label={`Decrease found count for ${item.date} ${item.mintMark}`}
                            onClick={() => changeFound(item, -1)}
                            disabled={found === 0}
                          >
                            −
                          </button>
                          <span className="found-value" aria-live="polite">
                            {found}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase found count for ${item.date} ${item.mintMark}`}
                            onClick={() => changeFound(item, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
          {catalog && visibleSets.length === 0 && (
            <p className="empty-state">No entries match this view.</p>
          )}
        </div>
      </main>

      <footer className="page-footer">
        <span>CATALOG: PUBLIC JSON</span>
        <span>PROGRESS: SAVED IN THIS BROWSER</span>
        <span>KEEPING THE HUNT HONEST.</span>
      </footer>
    </div>
  )
}

export default App

import { useState, useEffect } from 'react'
import type { ChartData, ChartType } from '@/types/database'

interface ChartEditorProps {
  value: ChartData | null
  onChange: (data: ChartData) => void
}

const DEFAULT_CHART: ChartData = {
  type: 'bar',
  labels: ['Item 1', 'Item 2', 'Item 3'],
  values: [10, 20, 30],
}

export default function ChartEditor({ value, onChange }: ChartEditorProps) {
  const [chart, setChart] = useState<ChartData>(value ?? DEFAULT_CHART)

  useEffect(() => {
    if (value) setChart(value)
  }, [value])

  const update = (partial: Partial<ChartData>) => {
    const next = { ...chart, ...partial }
    setChart(next)
    onChange(next)
  }

  const updateLabel = (i: number, label: string) => {
    const labels = [...chart.labels]
    labels[i] = label
    update({ labels })
  }

  const updateValue = (i: number, val: string) => {
    const values = [...chart.values]
    values[i] = parseFloat(val) || 0
    update({ values })
  }

  const addRow = () => {
    update({
      labels: [...chart.labels, `Item ${chart.labels.length + 1}`],
      values: [...chart.values, 0],
    })
  }

  const removeRow = (i: number) => {
    if (chart.labels.length <= 1) return
    update({
      labels: chart.labels.filter((_, idx) => idx !== i),
      values: chart.values.filter((_, idx) => idx !== i),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Chart type</label>
        <select
          value={chart.type}
          onChange={e => update({ type: e.target.value as ChartType })}
          className="w-full px-4 py-3 bg-zinc-950/60 border border-zinc-800/60 rounded-xl text-sm text-zinc-50 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all"
        >
          <option value="bar">Bar</option>
          <option value="pie">Pie</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Data</label>
        <div className="space-y-2">
          {chart.labels.map((label, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={label}
                onChange={e => updateLabel(i, e.target.value)}
                placeholder="Label"
                className="flex-1 px-3 py-2.5 bg-zinc-950/60 border border-zinc-800/60 rounded-lg text-sm text-zinc-50 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all"
              />
              <input
                type="number"
                value={chart.values[i]}
                onChange={e => updateValue(i, e.target.value)}
                placeholder="Value"
                className="w-24 px-3 py-2.5 bg-zinc-950/60 border border-zinc-800/60 rounded-lg text-sm text-zinc-50 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all"
              />
              {chart.labels.length > 1 && (
                <button
                  onClick={() => removeRow(i)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addRow}
          className="mt-3 text-sm text-teal-400 hover:text-teal-300 transition-colors"
        >
          + Add row
        </button>
      </div>
    </div>
  )
}

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
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1.5">Chart type</label>
        <select
          value={chart.type}
          onChange={e => update({ type: e.target.value as ChartType })}
          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-zinc-50 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
        >
          <option value="bar">Bar</option>
          <option value="pie">Pie</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-2">Data</label>
        <div className="space-y-2">
          {chart.labels.map((label, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={label}
                onChange={e => updateLabel(i, e.target.value)}
                placeholder="Label"
                className="flex-1 px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-md text-xs text-zinc-50 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
              />
              <input
                type="number"
                value={chart.values[i]}
                onChange={e => updateValue(i, e.target.value)}
                placeholder="Value"
                className="w-20 px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-md text-xs text-zinc-50 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
              />
              {chart.labels.length > 1 && (
                <button
                  onClick={() => removeRow(i)}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-zinc-600 hover:text-red-400 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addRow}
          className="mt-2 text-xs text-teal-400 hover:text-teal-300 transition-colors"
        >
          + Add row
        </button>
      </div>
    </div>
  )
}

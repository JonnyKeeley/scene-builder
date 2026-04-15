import { Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import type { ChartData } from '@/types/database'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const COLORS = [
  'rgba(59, 130, 246, 0.8)',
  'rgba(16, 185, 129, 0.8)',
  'rgba(245, 158, 11, 0.8)',
  'rgba(239, 68, 68, 0.8)',
  'rgba(139, 92, 246, 0.8)',
  'rgba(236, 72, 153, 0.8)',
  'rgba(20, 184, 166, 0.8)',
  'rgba(251, 146, 60, 0.8)',
]

interface ChartRendererProps {
  data: ChartData
}

export default function ChartRenderer({ data }: ChartRendererProps) {
  const colors = data.labels.map((_, i) => COLORS[i % COLORS.length])

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.8', '1')),
        borderWidth: 1,
      },
    ],
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: data.type === 'pie',
        position: 'bottom' as const,
        labels: {
          color: 'rgba(255,255,255,0.75)',
          font: { size: 10 },
          padding: 8,
        },
      },
    },
  }

  if (data.type === 'pie') {
    return (
      <div className="w-full">
        <Pie data={chartData} options={commonOptions} />
      </div>
    )
  }

  return (
    <div className="w-full">
      <Bar
        data={chartData}
        options={{
          ...commonOptions,
          scales: {
            x: {
              ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 10 } },
              grid: { color: 'rgba(255,255,255,0.1)' },
            },
            y: {
              ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 10 } },
              grid: { color: 'rgba(255,255,255,0.1)' },
            },
          },
        }}
      />
    </div>
  )
}

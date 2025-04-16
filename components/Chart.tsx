import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  data?: Array<{ time: number; value: number }>;
  title?: string;
}

export function Chart({ data = [], title = 'Chart' }: ChartProps) {
  const chartData = {
    labels: data.map(point => new Date(point.time).toLocaleDateString()),
    datasets: [
      {
        label: 'Value',
        data: data.map(point => point.value),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title
      }
    }
  };

  return (
    <div className="w-full h-[300px] p-4">
      <Line options={options} data={chartData} />
    </div>
  );
} 
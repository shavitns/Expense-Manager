import { Pie, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement
} from "chart.js";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement
);

export default function ChartSection() {

    const pieData = {
        labels: ["Food", "Transport", "Shopping", "Bills"],
        datasets: [
            {
                data: [400, 150, 300, 200],
                backgroundColor: ["#60A5FA", "#F87171", "#34D399", "#FBBF24"],
            },
        ],
    };

    const lineData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [
            {
                label: "Monthly Expenses",
                data: [1200, 900, 1500, 1100, 1300],
                borderColor: "#3B82F6",
                borderWidth: 2,
                tension: 0.3,
            },
        ],
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 mt-6">
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-3">Expenses by Category</h3>
                <Pie data={pieData} />
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-3">Expenses Over Time</h3>
                <Line data={lineData} />
            </div>
        </div>
    );
}

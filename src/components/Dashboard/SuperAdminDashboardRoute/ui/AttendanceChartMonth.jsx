import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    Title,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

export default function AttendanceStatsChart({ stats }) {
    const data = {
        labels: ["Present", "Absent", "Leave"],
        datasets: [
            {
                label: "Attendance Overview",
                data: [stats.present, stats.absent, stats.leave],
                backgroundColor: [
                    "rgba(16, 185, 129, 0.5)", // emerald
                    "rgba(239, 68, 68, 0.5)",  // red
                    "rgba(245, 158, 11, 0.5)", // amber
                ],
                borderColor: [
                    "rgba(16, 185, 129, 1)",
                    "rgba(239, 68, 68, 1)",
                    "rgba(245, 158, 11, 1)",
                ],
                borderWidth: 1.5,
                hoverOffset: 6,
            },
        ],
    };

    const options = {
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: "#cbd5e1", // slate-300
                    font: { size: 12 },
                },
            },
            title: {
                display: true,
                text: "Attendance Summary",
                color: "#fff",
                font: { size: 16, weight: "bold" },
            },
        },
        cutout: "70%",
    };

    return (
        <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
            <Doughnut data={data} options={options} />
        </div>
    );
}

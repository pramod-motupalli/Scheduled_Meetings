import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

const highlights = [
  { label: "Client Sync",     time: "14:00 - 15:30", color: "bg-blue-500" },
  { label: "Project Review",  time: "15:45 - 17:00", color: "bg-indigo-500" },
  { label: "Team Standup",    time: "09:00 - 09:15", color: "bg-sky-500" },
  { label: "Design Critique", time: "11:00 - 12:30", color: "bg-violet-500" },
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function MiniCalendar() {
  const today = new Date();
  const [current, setCurrent] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [selected, setSelected] = useState(today.getDate());

  const daysInMonth = getDaysInMonth(current.year, current.month);
  const firstDay = getFirstDayOfMonth(current.year, current.month);
  const monthName = new Date(current.year, current.month).toLocaleString("default", { month: "long" });

  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () =>
    setCurrent((c) =>
      c.month === 0
        ? { year: c.year - 1, month: 11 }
        : { year: c.year, month: c.month - 1 }
    );

  const nextMonth = () =>
    setCurrent((c) =>
      c.month === 11
        ? { year: c.year + 1, month: 0 }
        : { year: c.year, month: c.month + 1 }
    );

  const isToday = (day) =>
    day === today.getDate() &&
    current.month === today.getMonth() &&
    current.year === today.getFullYear();

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">{monthName} {current.year}</h3>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => (
          <button
            key={i}
            onClick={() => day && setSelected(day)}
            disabled={!day}
            className={`h-8 w-8 mx-auto rounded-full text-sm flex items-center justify-center transition-all duration-200 cursor-pointer ${
              !day
                ? "invisible"
                : isToday(day)
                ? "bg-[#1e2b72] text-white font-bold shadow-[0_2px_8px_rgba(30,43,114,0.3)] hover:scale-105"
                : day === selected && !isToday(day)
                ? "bg-blue-100 text-[#1e2b72] font-semibold hover:scale-105"
                : "hover:bg-gray-100 hover:scale-110 active:scale-95 text-gray-700"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
          Today's Highlights
        </p>
        <div className="flex flex-col gap-2.5">
          {highlights.map((h) => (
            <div key={h.label} className="flex items-start gap-3 p-2 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50/50 hover:translate-x-1 hover:shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-300 cursor-pointer group">
              <div className={`w-1 rounded-full ${h.color} mt-0.5 self-stretch min-h-[2rem] transition-all duration-300 group-hover:scale-y-105`} />
              <div>
                <p className="text-sm font-semibold text-gray-800 transition-colors duration-200 group-hover:text-blue-700">{h.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{h.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
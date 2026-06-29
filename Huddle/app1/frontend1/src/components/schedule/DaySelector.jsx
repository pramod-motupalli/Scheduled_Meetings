const days = ["M", "T", "W", "T", "F"];

export default function DaySelector() {
  return (
    <div className="flex gap-2">
      {days.map((d) => (
        <button
          key={d}
          className="w-10 h-10 rounded bg-[#1e2b72] text-white"
        >
          {d}
        </button>
      ))}
    </div>
  );
}
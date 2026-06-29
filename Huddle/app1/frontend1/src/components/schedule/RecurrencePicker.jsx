export default function RecurrencePicker({
  setRecurrence,
}) {
  return (
    <select
      className="w-full border p-3 rounded"
      onChange={(e) =>
        setRecurrence(e.target.value)
      }
    >
      <option value="none">None</option>
      <option value="daily">Daily</option>
      <option value="weekly">Weekly</option>
      <option value="monthly">Monthly</option>
    </select>
  );
}
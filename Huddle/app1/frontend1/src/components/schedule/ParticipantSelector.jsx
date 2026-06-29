export default function ParticipantSelector({
  participants,
  setParticipants,
}) {
  const addEmail = (email) => {
    if (!email) return;

    setParticipants([
      ...participants,
      email,
    ]);
  };

  return (
    <div>
      <h3 className="font-semibold mb-3">
        Add Participants
      </h3>

      <input
        placeholder="Enter email and press Enter"
        className="w-full border p-3 rounded"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            addEmail(e.target.value);
            e.target.value = "";
          }
        }}
      />

      <div className="mt-4 space-y-2">
        {participants.map((p, i) => (
          <div
            key={i}
            className="p-2 border rounded"
          >
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}
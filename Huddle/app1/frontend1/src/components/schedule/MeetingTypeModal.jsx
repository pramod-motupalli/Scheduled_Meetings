import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import AdvanceSchedule from "./AdvanceSchedule";

export default function MeetingTypeModal({
  open,
  setOpen,
}) {
  const [showSchedule, setShowSchedule] =
    useState(false);

  const createInstant = () => {
    alert("Instant Meeting Created");
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">
            Create Meeting
          </h2>

          <div className="space-y-4">
            <button
              onClick={createInstant}
              className="w-full p-4 border rounded-xl hover:bg-gray-50"
            >
              Instant
            </button>

            <button
              onClick={() => {
                setOpen(false);
                setShowSchedule(true);
              }}
              className="w-full p-4 rounded-xl bg-[#1e2b72] text-white"
            >
              Scheduled
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <AdvanceSchedule
        open={showSchedule}
        setOpen={setShowSchedule}
      />
    </>
  );
}
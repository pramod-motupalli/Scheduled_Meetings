import React, { useState, useEffect } from "react";
import { Info, Circle, Settings } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

const Header = ({
    isSidebarOpen = false,
    meetingTitle,
    isRecording,
    setIsRecording,
    recordingStopped,
    setRecordingStopped,
    recordingTime,
    setRecordingTime,
    formatTime,
    showParticipants,
    setShowParticipants,
    showHandRaise,
    setShowHandRaise,
    setShowMenuPage,
    handRaiseCount,
    activeParticipantsCount,
}) => {
    const { meeting_id } = useParams();
    const [timeStr, setTimeStr] = useState("");

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setTimeStr(now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }));
        };
        updateClock();
        const interval = setInterval(updateClock, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleCopy = () => {
        if (meeting_id) {
            navigator.clipboard.writeText(meeting_id);
            toast.success("Meeting ID copied!");
        }
    };

    return (
        <header className="h-[64px] bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 w-full">
            {/* LEFT - TIME & CODE */}
            <div className="pointer-events-auto flex items-center gap-3 text-sm font-medium text-slate-800">
                <span className="tracking-wide">{timeStr}</span>
                <span className="text-slate-300">|</span>
                <span 
                    onClick={handleCopy}
                    className="hover:text-slate-600 cursor-pointer transition-colors font-mono"
                    title="Copy Meeting ID"
                >
                    {meeting_id || "huddle-room"}
                </span>
                <button 
                    onClick={handleCopy}
                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
                >
                    <Info size={15} className="text-slate-500 hover:text-slate-750" />
                </button>

                {/* RECORDING STATE */}
                <button
                    onClick={() => {
                        if (isRecording) {
                            setIsRecording(false);
                            setRecordingStopped(true);
                            setTimeout(() => {
                                setRecordingStopped(false);
                                setRecordingTime(0);
                            }, 2000);
                        } else {
                            setRecordingTime(0);
                            setIsRecording(true);
                        }
                    }}
                    className={`ml-4 flex items-center gap-1.5 px-3 py-1 h-[28px] rounded-full text-[11px] font-bold transition-all duration-200 cursor-pointer border border-slate-200/30 ${
                        isRecording
                            ? "bg-[#ea4335] text-white animate-pulse"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                >
                    <Circle
                        size={5}
                        fill={isRecording ? "white" : "#ea4335"}
                        color={isRecording ? "white" : "#ea4335"}
                    />
                    <span>
                        {isRecording
                            ? `REC ${formatTime(recordingTime)}`
                            : recordingStopped
                              ? "Stopped"
                              : "Record"}
                    </span>
                </button>
            </div>

            {/* RIGHT - SETTINGS / META */}
            <div className="pointer-events-auto flex items-center gap-3">
                {/* HAND RAISE BUTTON */}
                <button
                    onClick={() => {
                        setShowHandRaise(!showHandRaise);
                        setShowParticipants(false);
                        setShowMenuPage(false);
                    }}
                    className={`relative w-8 h-8 rounded-full border border-slate-200/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                        showHandRaise ? "bg-amber-100 text-slate-800 border-amber-300" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                    title="Hand Raises"
                >
                    <span className="text-sm">✋</span>
                    {handRaiseCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-sm">
                            {handRaiseCount}
                        </span>
                    )}
                </button>

                {/* PARTICIPANT COUNT BUTTON */}
                <button
                    onClick={() => {
                        setShowParticipants(!showParticipants);
                        setShowHandRaise(false);
                        setShowMenuPage(false);
                    }}
                    className={`relative w-12 h-8 rounded-full border border-slate-200/40 flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                        showParticipants ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                    title="Participants"
                >
                    <span className="text-xs">👤</span>
                    <span className="text-xs font-bold">{activeParticipantsCount || 1}</span>
                </button>

                <button className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center text-slate-700 border border-slate-200/40 cursor-pointer">
                    <Settings size={15} />
                </button>
            </div>
        </header>
    );
};

export default Header;

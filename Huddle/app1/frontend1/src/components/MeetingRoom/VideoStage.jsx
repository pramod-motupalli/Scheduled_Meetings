import React, { useMemo, useState, useEffect } from "react";
import {
    MicOff,
    VideoOff,
    User,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const VideoStage = ({
    showParticipantsGrid,
    setShowParticipantsGrid,
    showHandRaise,
    showParticipants,
    showMenuPage,
    setShowParticipants,
    setShowHandRaise,
    setShowMenuPage,
    setShowParticipantsList,
    participantMembers,
    participantName,
    localVideoRef,
    isVideoOn,
    isMicOn,
    remoteMicStates = {},
    remoteStreams = [],
    roomPeers = {},
    handRaiseCount = 0,
    liveParticipants = [],
    userId,
}) => {
    // ==========================================
    // 1. LIVE SYNCHRONIZED PARTICIPANTS
    // ==========================================
    const activeParticipants = useMemo(() => {
        const seenUserIds = new Set();
        const seenIds = new Set();
        const list = [];

        // Always add You first
        list.push({
            id: "local-user",
            name: `${participantName} (You)`,
            isLocal: true,
            stream: null,
            micOn: isMicOn,
        });
        seenUserIds.add(userId);
        seenIds.add("local-user");

        // Add Remote Users from the server-authoritative liveParticipants list
        const remoteParticipants = liveParticipants.filter(
            (p) => p.user_id !== userId,
        );

        remoteParticipants.forEach((p) => {
            const cleanId = p.id || `remote-${p.user_id}`;
            const cleanUserId = p.user_id;

            if (seenUserIds.has(cleanUserId) || seenIds.has(cleanId)) {
                return;
            }
            seenUserIds.add(cleanUserId);
            seenIds.add(cleanId);

            const rStream = remoteStreams.find(
                (r) => roomPeers[r.peerId]?.user_id === p.user_id,
            );
            const cleanName = p.name
                ? p.name.replace(/_[a-zA-Z0-9]{5}$/, "")
                : "Remote User";
            list.push({
                id: cleanId,
                name: cleanName,
                isLocal: false,
                stream: rStream ? rStream.stream : null,
                // ✅ Default to "on" until we've actually heard otherwise for this user_id
                micOn:
                    remoteMicStates[p.user_id] !== undefined
                        ? remoteMicStates[p.user_id]
                        : true,
            });
        });

        return list;
    }, [
        participantName,
        userId,
        liveParticipants,
        remoteStreams,
        roomPeers,
        isMicOn,
        remoteMicStates,
    ]);

    // ==========================================
    // 2. PAGINATION & ROW LOGIC
    // ==========================================
    const [currentPage, setCurrentPage] = useState(0);
    const PAGE_SIZE = 9;

    const totalPages = Math.max(
        1,
        Math.ceil(activeParticipants.length / PAGE_SIZE),
    );
    const clampedPage = Math.max(0, Math.min(currentPage, totalPages - 1));
    const startIndex = clampedPage * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const pagedParticipants = activeParticipants.slice(startIndex, endIndex);

    const canGoLeft = clampedPage > 0;
    const canGoRight = clampedPage < totalPages - 1;

    useEffect(() => {
        setCurrentPage((prev) => Math.max(0, Math.min(prev, totalPages - 1)));
    }, [totalPages]);

    const getParticipantInitials = (name) => {
        if (!name) return "U";
        const cleanName = name.replace(" (You)", "");
        const parts = cleanName.trim().split(/\s+/);
        if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
        return cleanName
            .substring(0, Math.min(2, cleanName.length))
            .toUpperCase();
    };

    const getParticipantTheme = (index) => {
        const themes = [
            "bg-emerald-50 text-emerald-700 border-emerald-100 border",
            "bg-pink-50 text-pink-700 border-pink-100 border",
            "bg-blue-50 text-blue-700 border-blue-100 border",
            "bg-purple-50 text-purple-700 border-purple-100 border",
            "bg-amber-50 text-amber-700 border-amber-100 border",
            "bg-teal-50 text-teal-700 border-teal-100 border",
        ];
        return themes[index % themes.length];
    };

    const getRowSizes = (count) => {
        if (count <= 0) return [];
        if (count <= 4) return [count];
        if (count === 5) return [2, 3];
        if (count === 6) return [3, 3];
        if (count === 7) return [3, 4];
        if (count === 8) return [4, 4];
        return [4, 5];
    };

    const getParticipantRows = (items) => {
        const sizes = getRowSizes(items.length);
        const rows = [];
        let start = 0;
        sizes.forEach((size) => {
            rows.push(items.slice(start, start + size));
            start += size;
        });
        return rows;
    };

    const participantRows = getParticipantRows(pagedParticipants);
    const primaryRemoteStream = useMemo(() => {
        return remoteStreams.length > 0 ? remoteStreams[0] : null;
    }, [remoteStreams]);

    return (
        <div
            className={`relative rounded-none overflow-hidden bg-slate-50 h-auto transition-all duration-300 ${
                showHandRaise || showParticipants || showMenuPage
                    ? "w-[80%]"
                    : "w-full"
            }`}
        >
            {/* 🔥 FIX 2: Hidden anchor keeps your local camera hardware permanently active! */}
            <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="hidden"
            />
            {/* ================= MAIN GRID / STAGE ================= */}
            <div className="relative w-full h-full p-2 bg-[#f8fafc]">


                <div className="relative w-full h-full overflow-hidden rounded-none">
                    <div className="w-full h-full px-4 py-2 flex flex-col gap-4">
                        {participantRows.map((row, rowIndex) => (
                            <div
                                key={rowIndex}
                                className={`flex gap-4 flex-1 ${
                                    ((participantRows[0]?.length === 2 &&
                                        participantRows[1]?.length === 3) ||
                                        (participantRows[0]?.length === 3 &&
                                            participantRows[1]?.length ===
                                                4)) &&
                                    rowIndex === 0
                                        ? "justify-center"
                                        : ""
                                }`}
                            >
                                {row.map((member, index) => {
                                    const globalIndex =
                                        rowIndex === 0
                                            ? index
                                            : participantRows[0].length + index;
                                    const hasVideo = member.isLocal
                                        ? isVideoOn
                                        : !!member.stream;

                                    return (
                                        <div
                                            key={`${member.id}-${index}`}
                                            className={`relative rounded-[24px] overflow-hidden border border-slate-200 bg-slate-50 shadow-sm ${
                                                ((participantRows[0]?.length ===
                                                    2 &&
                                                    participantRows[1]
                                                        ?.length === 3) ||
                                                    (participantRows[0]
                                                        ?.length === 3 &&
                                                        participantRows[1]
                                                            ?.length === 4)) &&
                                                rowIndex === 0
                                                    ? ""
                                                    : "flex-1"
                                            }`}
                                            style={
                                                participantRows[0]?.length ===
                                                    2 &&
                                                participantRows[1]?.length ===
                                                    3 &&
                                                rowIndex === 0
                                                    ? { flex: "0 0 30%" }
                                                    : participantRows[0]
                                                            ?.length === 3 &&
                                                        participantRows[1]
                                                            ?.length === 4 &&
                                                        rowIndex === 0
                                                      ? { flex: "0 0 23%" }
                                                      : {}
                                            }
                                        >
                                            {/* INJECT LIVE VIDEO OR GRADIENT INITIALS */}
                                            {hasVideo ? (
                                                <video
                                                    autoPlay
                                                    muted={member.isLocal}
                                                    playsInline
                                                    ref={(el) => {
                                                        const srcObj =
                                                            member.isLocal
                                                                ? localVideoRef
                                                                      ?.current
                                                                      ?.srcObject
                                                                : member.stream;
                                                        if (
                                                            el &&
                                                            srcObj &&
                                                            el.srcObject !==
                                                                srcObj
                                                        ) {
                                                            el.srcObject =
                                                                srcObj;
                                                            // ✅ Explicit play() — autoPlay attribute alone can be
                                                            // silently blocked by the browser, which is the most
                                                            // common reason remote audio never starts.
                                                            el.play().catch(
                                                                () => {},
                                                            );
                                                        }
                                                    }}
                                                    className="absolute inset-0 w-full h-full object-cover z-0"
                                                />
                                            ) : (
                                                <>
                                                    <div className="absolute inset-0 bg-slate-100 z-0" />
                                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                                        <div
                                                            className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-3xl shadow-sm border ${getParticipantTheme(globalIndex)}`}
                                                        >
                                                            <span>
                                                                {getParticipantInitials(
                                                                    member.name,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {!member.micOn && (
                                                <div className="absolute top-3 right-3 bg-red-500/90 text-white rounded-full p-2 z-20 shadow-sm">
                                                    <MicOff size={14} />
                                                </div>
                                            )}

                                            <div className="absolute bottom-3 left-3 z-20">
                                                <div className="bg-slate-900/60 backdrop-blur-sm px-3 py-1 rounded-lg">
                                                    <p className="text-white text-xs font-semibold">
                                                        {member.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* ================= PAGINATION CONTROLS ================= */}
                    {activeParticipants.length > PAGE_SIZE && (
                        <>
                            <button
                                onClick={() =>
                                    canGoLeft &&
                                    setCurrentPage((p) => Math.max(0, p - 1))
                                }
                                className={`absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full flex items-center justify-center shadow-lg border transition-all duration-200 ${canGoLeft ? "bg-black text-white border-black hover:scale-105" : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed"}`}
                                disabled={!canGoLeft}
                            >
                                <ChevronLeft size={22} />
                            </button>
                            <button
                                onClick={() =>
                                    canGoRight &&
                                    setCurrentPage((p) =>
                                        Math.min(totalPages - 1, p + 1),
                                    )
                                }
                                className={`absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full flex items-center justify-center shadow-lg border transition-all duration-200 ${canGoRight ? "bg-black text-white border-black hover:scale-105" : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed"}`}
                                disabled={!canGoRight}
                            >
                                <ChevronRight size={22} />
                            </button>
                        </>
                    )}

                    {activeParticipants.length <= 1 &&
                        liveParticipants.length <= 1 &&
                        remoteStreams.length === 0 && (
                            <div className="absolute top-6 left-1/2 text-black -translate-x-1/2 z-30 bg-white backdrop-blur-md border  shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-2xl px-6 py-3 flex items-center gap-3 animate-fade-in">
                                <span className="text-xl animate-bounce-subtle">
                                    👤
                                </span>
                                <div className="flex flex-col">
                                    <p className="text-sm font-bold leading-tight">
                                        You are the only one here
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                        Waiting for others to join...
                                    </p>
                                </div>
                            </div>
                        )}
                </div>
            </div>
            )
        </div>
    );
};

export default VideoStage;

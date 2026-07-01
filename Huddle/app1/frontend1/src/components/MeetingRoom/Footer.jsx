import React from "react";
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    Share,
    UserPlus,
    MoreVertical,
    Copy,
    LayoutGrid,
    MessageSquare,
    FilePenLine,
    ChevronDown,
    PhoneOff,
    UserMinus,
    Check,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "react-hot-toast";

const Footer = ({
    isSidebarOpen = false,
    meetingId,
    isMicOn,
    toggleMic,
    isVideoOn,
    toggleVideo,
    isHandRaised,
    toggleHandRaise,
    showMenuPage,
    setShowMenuPage,
    setShowParticipants,
    setShowHandRaise,
    isLocalScreenSharing = false,
    isAnotherUserSharing = false,
    sharerLabel = "",
    handleShareClick,
    onAddParticipantsClick,
    userRole = "participant",
    handleKickParticipant,
    handleEndMeeting,
    handleLeave,
    liveParticipants = [],
    userId,
    switchAudioDevice,
    switchVideoDevice,
    activeMenu,
    setActiveMenu,
    unreadChatCount = 0,
}) => {
    const [isKickDialogOpen, setIsKickDialogOpen] = React.useState(false);
    const [isHostControlsOpen, setIsHostControlsOpen] = React.useState(false);

    const [audioDevices, setAudioDevices] = React.useState([]);
    const [videoDevices, setVideoDevices] = React.useState([]);
    const [activeAudioId, setActiveAudioId] = React.useState("");
    const [activeVideoId, setActiveVideoId] = React.useState("");
    const [showAudioMenu, setShowAudioMenu] = React.useState(false);
    const [showVideoMenu, setShowVideoMenu] = React.useState(false);

    const hasAutoSelected = React.useRef(false);

    React.useEffect(() => {
        const getDevices = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const audios = devices.filter(d => d.kind === 'audioinput');
                const videos = devices.filter(d => d.kind === 'videoinput');
                setAudioDevices(audios);
                setVideoDevices(videos);

                if (!hasAutoSelected.current) {
                    if (audios.length > 0) {
                        const keywords = ["bluetooth", "headset", "airpods", "earbuds", "headphones", "hands-free"];
                        const preferred = audios.find(d => 
                            keywords.some(kw => d.label.toLowerCase().includes(kw))
                        );
                        if (preferred) {
                            setActiveAudioId(preferred.deviceId);
                            switchAudioDevice?.(preferred.deviceId);
                        } else {
                            setActiveAudioId(audios[0].deviceId);
                        }
                    }
                    if (videos.length > 0) {
                        setActiveVideoId(videos[0].deviceId);
                    }
                    hasAutoSelected.current = true;
                }
            } catch (err) {
                console.warn("Could not enumerate devices:", err);
            }
        };
        getDevices();
        navigator.mediaDevices.addEventListener('devicechange', getDevices);
        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', getDevices);
        };
    }, []);
    return (
        <footer className="h-[70px] bg-[#f8fafc] border-t border-slate-200 flex items-center justify-center px-6 shrink-0 relative w-full text-slate-800">
            {/* CENTER */}
            <div className="pointer-events-auto flex items-center gap-3 animate-slide-up shrink-0">
                {/* MIC */}
                <div className="relative flex items-center bg-slate-100 hover:bg-slate-200 rounded-full px-1.5 transition-all duration-200 border border-slate-200">
                    <button
                        onClick={toggleMic}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                            isMicOn
                                ? "text-slate-700"
                                : "bg-[#ea4335] text-white hover:bg-[#d93025]"
                        }`}
                    >
                        {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
                    </button>

                    <ChevronDown
                        size={13}
                        onClick={() => {
                            setShowAudioMenu(!showAudioMenu);
                            setShowVideoMenu(false);
                        }}
                        className="text-slate-400 hover:text-slate-750 cursor-pointer transition-all duration-200 mr-1 hover:scale-110"
                    />

                    {/* AUDIO DEVICE MENU */}
                    {showAudioMenu && (
                        <div className="absolute bottom-14 left-0 w-56 bg-white border border-slate-200 shadow-xl rounded-xl py-2 z-50">
                            <div className="px-3 pb-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 mb-1">Select Microphone</div>
                            {audioDevices.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-slate-400">No microphones found</div>
                            ) : (
                                audioDevices.map(device => (
                                    <button
                                        key={device.deviceId}
                                        onClick={() => {
                                            setActiveAudioId(device.deviceId);
                                            switchAudioDevice?.(device.deviceId);
                                            setShowAudioMenu(false);
                                        }}
                                        className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between transition-colors ${activeAudioId === device.deviceId ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-slate-50 text-slate-700"}`}
                                        title={device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                                    >
                                        <span className="truncate pr-2">{device.label || `Microphone ${device.deviceId.slice(0, 5)}`}</span>
                                        {activeAudioId === device.deviceId && <Check size={15} className="shrink-0 text-blue-600" />}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* VIDEO */}
                <div className="relative flex items-center bg-slate-100 hover:bg-slate-200 rounded-full px-1.5 transition-all duration-200 border border-slate-200">
                    <button
                        onClick={toggleVideo}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                            isVideoOn
                                ? "text-slate-700"
                                : "bg-[#ea4335] text-white hover:bg-[#d93025]"
                        }`}
                    >
                        {isVideoOn ? (
                            <Video size={16} />
                        ) : (
                            <VideoOff size={16} />
                        )}
                    </button>

                    <ChevronDown
                        size={13}
                        onClick={() => {
                            setShowVideoMenu(!showVideoMenu);
                            setShowAudioMenu(false);
                        }}
                        className="text-slate-400 hover:text-slate-750 cursor-pointer transition-all duration-200 mr-1 hover:scale-110"
                    />

                    {/* VIDEO DEVICE MENU */}
                    {showVideoMenu && (
                        <div className="absolute bottom-14 left-0 w-56 bg-white border border-slate-200 shadow-xl rounded-xl py-2 z-50">
                            <div className="px-3 pb-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 mb-1">Select Camera</div>
                            {videoDevices.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-slate-400">No cameras found</div>
                            ) : (
                                videoDevices.map(device => (
                                    <button
                                        key={device.deviceId}
                                        onClick={() => {
                                            setActiveVideoId(device.deviceId);
                                            switchVideoDevice?.(device.deviceId);
                                            setShowVideoMenu(false);
                                        }}
                                        className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between transition-colors ${activeVideoId === device.deviceId ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-slate-50 text-slate-700"}`}
                                        title={device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                                    >
                                        <span className="truncate pr-2">{device.label || `Camera ${device.deviceId.slice(0, 5)}`}</span>
                                        {activeVideoId === device.deviceId && <Check size={15} className="shrink-0 text-blue-600" />}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* SHARE */}
                <button
                    onClick={handleShareClick}
                    disabled={isAnotherUserSharing && !isLocalScreenSharing}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-205 cursor-pointer hover:scale-110 active:scale-95 border border-slate-200 ${
                        isAnotherUserSharing && !isLocalScreenSharing
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : isLocalScreenSharing
                              ? "bg-[#ea4335] text-white hover:bg-[#d93025]"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                    title={
                        isAnotherUserSharing
                            ? `${sharerLabel} is already sharing`
                            : "Share screen"
                    }
                >
                    <Share size={16} />
                </button>

                <div className="w-px h-6 bg-slate-200"></div>

                {/* HAND */}
                <button
                    onClick={toggleHandRaise}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer border border-slate-200 ${
                        isHandRaised
                            ? "bg-[#2d5a27] text-white hover:bg-[#20401b]"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                >
                    <span className="text-[18px]">🤚</span>
                </button>

                {/* HOST MODERATION */}
                {userRole === "host" ? (
                    <>
                        {/* USER PLUS */}
                        <button
                            onClick={onAddParticipantsClick}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 hover:scale-110 active:scale-95 transition-all duration-205 cursor-pointer border border-slate-200"
                            title="Add Participants"
                        >
                            <UserPlus size={16} />
                        </button>
                        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-full px-1.5 py-1 transition-all duration-300">
                            {/* THREE DOTS BUTTON */}
                            <button
                                onClick={() =>
                                    setIsHostControlsOpen(!isHostControlsOpen)
                                }
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-250 cursor-pointer ${
                                    isHostControlsOpen
                                        ? "bg-slate-350 text-slate-800"
                                        : "text-slate-700 hover:bg-black/5"
                                }`}
                                title="Host Controls"
                            >
                                <MoreVertical
                                    size={15}
                                    className={`transition-transform duration-300 ${
                                        isHostControlsOpen
                                            ? "rotate-90 text-slate-800 font-bold"
                                            : "text-slate-500"
                                    }`}
                                />
                            </button>

                            {/* HOST CONTROLS INLINE EXPANSION */}
                            <div
                                className={`flex items-center gap-1 transition-all duration-300 ease-out overflow-hidden ${
                                    isHostControlsOpen
                                        ? "max-w-[120px] opacity-100 ml-1"
                                        : "max-w-0 opacity-0 ml-0 pointer-events-none"
                                }`}
                            >
                                {/* KICK PARTICIPANT */}
                                <button
                                    onClick={() => setIsKickDialogOpen(true)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 active:scale-95 transition-all cursor-pointer shrink-0"
                                    title="Kick Participant"
                                >
                                    <UserMinus size={14} />
                                </button>

                                {/* END MEETING */}
                                <button
                                    onClick={() => {
                                        if (
                                            window.confirm(
                                                "Are you sure you want to end the meeting for all participants?",
                                            )
                                        ) {
                                            handleEndMeeting();
                                        }
                                    }}
                                    className="w-8 h-8 rounded-full flex items-center justify-center bg-[#ea4335] text-white hover:bg-[#d93025] active:scale-95 transition-all cursor-pointer shadow-sm shrink-0"
                                    title="End Meeting for All"
                                >
                                    <PhoneOff size={13} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 bg-slate-100 border border-slate-200">
                        <MoreVertical size={16} />
                    </div>
                )}
                {/* LEAVE CALL BUTTON */}
                <button
                    onClick={handleLeave}
                    className="w-12 h-10 rounded-full flex items-center justify-center bg-[#ea4335] text-white hover:bg-[#d93025] hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer shadow-md ml-1"
                    title="Leave Call"
                >
                    <PhoneOff size={16} />
                </button>
            </div>

            {/* RIGHT */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-auto flex items-center gap-4 shrink-0">
                {/* NOTES */}
                <button 
                    onClick={() => {
                        if (showMenuPage && activeMenu === "notes") {
                            setShowMenuPage(false);
                        } else {
                            setActiveMenu?.("notes");
                            setShowMenuPage(true);
                            setShowParticipants(false);
                            setShowHandRaise(false);
                        }
                    }}
                    className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-slate-200"
                    title="Open Notes"
                >
                    <FilePenLine size={16} />
                </button>

                {/* CHAT */}
                <button
                    onClick={() => {
                        if (showMenuPage && activeMenu === "chat") {
                            setShowMenuPage(false);
                        } else {
                            setActiveMenu?.("chat");
                            setShowMenuPage(true);
                            setShowParticipants(false);
                            setShowHandRaise(false);
                        }
                    }}
                    className="relative w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-slate-200"
                    title="Open Chat"
                >
                    <MessageSquare size={16} />
                    {unreadChatCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                            {unreadChatCount > 9 ? '9+' : unreadChatCount}
                        </span>
                    )}
                </button>

                {/* MENU (AI) */}
                <button
                    onClick={() => {
                        if (showMenuPage && activeMenu === "assistance") {
                            setShowMenuPage(false);
                        } else {
                            setActiveMenu?.("assistance");
                            setShowMenuPage(true);
                            setShowParticipants(false);
                            setShowHandRaise(false);
                        }
                    }}
                    className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-slate-200"
                >
                    <LayoutGrid size={16} />
                </button>
            </div>

            {/* KICK PARTICIPANT DIALOG MODAL */}
            <Dialog open={isKickDialogOpen} onOpenChange={setIsKickDialogOpen}>
                <DialogContent className="w-[380px] p-6 bg-white border border-slate-200 rounded-3xl shadow-2xl z-[99999] text-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-900">
                            Kick a Participant
                        </DialogTitle>
                    </DialogHeader>

                    <div className="mt-4 max-h-[220px] overflow-y-auto flex flex-col gap-2">
                        {liveParticipants.filter((p) => p.user_id !== userId)
                            .length === 0 ? (
                            <div className="text-xs text-slate-400 py-4 text-center italic">
                                No other participants in the meeting
                            </div>
                        ) : (
                            liveParticipants
                                .filter((p) => p.user_id !== userId)
                                .map((p) => {
                                    const cleanName = p.name
                                        ? p.name.replace(/_[a-zA-Z0-9]{5}$/, "")
                                        : "Guest";
                                    return (
                                        <div
                                            key={p.id || p.user_id}
                                            className="flex items-center justify-between w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-100 transition-all"
                                        >
                                            <span className="text-xs font-semibold text-slate-700 truncate max-w-[180px]">
                                                {cleanName}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setIsKickDialogOpen(false);
                                                    handleKickParticipant(
                                                        p.user_id,
                                                        cleanName,
                                                    );
                                                }}
                                                className="text-xs text-red-500 font-bold hover:text-red-700 cursor-pointer bg-transparent border-none hover:underline"
                                            >
                                                Kick
                                            </button>
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </footer>
    );
};

export default Footer;

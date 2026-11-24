import React, { useState, useEffect } from "react";
import SessionCard from "./SessionCard";
import CreateHuddle from "./CreateHuddle";
import ScheduledMeetings from "./ScheduledMeetings";
import MiniCalendar from "../calender/MiniCalender";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, Filter, Check, Trash2 } from "lucide-react";
import TranscriptModal from "@/components/chat/TranscriptModal";
import AISummaryCard from "@/components/chat/AISummaryCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { microserviceApi } from "@/services/api";

const TABS = ["Ongoing", "Scheduled", "Completed"];

// const sessions = []; // removed hardcoded sessions list (no longer needed)
import { useNavigate } from "react-router-dom";




export default function HuddlePage() {
  const [activeTab, setActiveTab] = useState("Ongoing");
  const [ongoingFilter, setOngoingFilter] = useState("All"); // "All", "Instant", "Scheduled"
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedMeetings, setSelectedMeetings] = useState(new Set());
  const [showTranscript, setShowTranscript] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const handleToggleSelect = (meetingId) => {
    setSelectedMeetings((prev) => {
      const next = new Set(prev);
      if (next.has(meetingId)) {
        next.delete(meetingId);
      } else {
        next.add(meetingId);
      }
      return next;
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedMeetings(new Set());
  };

  const handleDeleteSelected = async () => {
    if (selectedMeetings.size === 0) return;

    if (!window.confirm(`Are you sure you want to delete the ${selectedMeetings.size} selected instant meeting(s)?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const apiKey = import.meta.env.VITE_X_API_KEY || sessionStorage.getItem("api_key") || localStorage.getItem("api_key") || "";
      const res = await microserviceApi.delete("/api/meetings/", {
        data: {
          meeting_ids: Array.from(selectedMeetings)
        }
      });

      if (res.status === 200) {
        toast.success(res.data?.message || "Meetings deleted successfully");
        setSelectedMeetings(new Set());
        setRefreshTrigger((prev) => prev + 1);
      } else {
        toast.error("Failed to delete meetings");
      }
    } catch (err) {
      console.error("Error deleting meetings", err);
      toast.error("Error deleting meetings");
    }
  };
  const [meetingId, setMeetingId] = useState("");

  const parseMeetingIdentifier = (input) => {
    let path = input.trim();
    if (path.includes("http://") || path.includes("https://")) {
      try {
        const url = new URL(path);
        path = url.pathname;
      } catch (e) {
        // Fallback
      }
    }
    const parts = path.replace(/^\/|\/$/g, "").split("/");
    if (parts.length > 0) {
      return parts[parts.length - 1];
    }
    return null;
  };

  const handleJoinSession = async () => {
    const input = meetingId.trim();

    if (!input) {
      toast.error("Please enter a meeting link or code");
      return;
    }

    const identifier = parseMeetingIdentifier(input);

    if (!identifier) {
      toast.error("Invalid meeting link or code");
      return;
    }

    try {
      // Validate with backend
      const res = await microserviceApi.get(
        `/api/meeting/validate-lobby/${identifier}/`
      );

      if (res.status === 200 && res.data?.id) {
        const company = res.data.company || "huddle";
        const apiKey = res.data.api_key || "kTh35Mm1gA8lX4StIrpfYIvtmStj2XCUVMm3nIdrnU8";
        // Exact format: company/letter/api_key/meeting_id
        navigate(`/${company}/a/${apiKey}/${res.data.id}`);
      } else {
        toast.error("Meeting not found or expired");
      }
    } catch (err) {
      console.error(err);
      toast.error("Meeting not found or invalid link");
    }
  };
  const [dbMeetings, setDbMeetings] = useState([]);

  useEffect(() => {
    const fetchDbMeetings = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiKey = import.meta.env.VITE_X_API_KEY || sessionStorage.getItem("api_key") || localStorage.getItem("api_key") || "";
        const email = localStorage.getItem("email");
        const params = {};
        if (email) {
          params["email"] = email;
        }
        const res = await microserviceApi.get("/api/meetings/", { params });
        if (res.data) {
          setDbMeetings(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch meetings in HuddlePage", err);
      }
    };
    fetchDbMeetings();
  }, [refreshTrigger]);

  const ongoingDbSessions = dbMeetings
    .filter(m => {
      const userEmail = localStorage.getItem("email");
      const cutoff = sessionStorage.getItem("instant_meeting_cutoff");

      const isInstant = m.title === "Instant Huddle";
      const isNewInstant = isInstant && (!cutoff || (m.created_at && new Date(m.created_at) >= new Date(cutoff)));

      const isInstantOngoing = isInstant &&
        isNewInstant &&
        !m.is_completed &&
        m.created_by_email?.toLowerCase() === userEmail?.toLowerCase();
      const isScheduledOngoing = m.title !== "Instant Huddle" && m.is_ongoing && m.db_status !== "completed";
      return isInstantOngoing || isScheduledOngoing;
    })
    .map(m => ({
      id: m.id,
      project: "PROJECT STARLIGHT",
      title: m.title,
      description: m.description || (m.title === "Instant Huddle" ? "Quick instant meeting." : "Active scheduled huddle."),
      time: m.is_ongoing ? "Live Now" : "Ready to Join",
      participants: m.active_participants_count || m.participants?.length || 0,
      status: "Ongoing",
      link: m.link,
      isDatabase: true
    }));

  const completedDbSessions = dbMeetings
    .filter(m => m.is_completed)
    .map(m => ({
      id: m.id,
      project: "PROJECT STARLIGHT",
      title: m.title,
      description: m.description || "Completed huddle session.",
      time: m.datetime ? new Date(m.datetime).toLocaleDateString() : "Ended",
      participants: m.participants?.length || 0,
      status: "Completed",
      link: m.link,
      isDatabase: true
    }));

  // const placeholders = sessionsList.filter((s) => s.status === activeTab); // removed placeholder merging
  const dbItems = activeTab === "Ongoing" ? ongoingDbSessions : (activeTab === "Completed" ? completedDbSessions : []);

  let filteredSessions = dbItems;
  if (activeTab === "Ongoing") {
    if (ongoingFilter === "Instant") {
      filteredSessions = filteredSessions.filter(s => s.title === "Instant Huddle" || s.title === "Instant Meeting");
    } else if (ongoingFilter === "Scheduled") {
      filteredSessions = filteredSessions.filter(s => s.title !== "Instant Huddle" && s.title !== "Instant Meeting");
    }
  }

  const location = useLocation();

  const [showThankYouDialog, setShowThankYouDialog] = useState(false);

  useEffect(() => {
    if (location.state?.showThankYouDialog) {
      setShowThankYouDialog(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (!sessionStorage.getItem("instant_meeting_cutoff")) {
      sessionStorage.setItem("instant_meeting_cutoff", new Date().toISOString());
    }
  }, []);
  const navigate = useNavigate();


  return (
    <div className="flex flex-col xl:flex-row w-full h-full overflow-y-auto xl:overflow-hidden bg-white">
      {/* Middle Section */}
      <main className="flex flex-col flex-grow bg-white p-4 sm:p-6 xl:overflow-y-auto shrink-0 xl:shrink">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Huddle</h1>
        <p className="text-gray-500 text-sm mb-5">
          Manage your workspace and upcoming sessions.
        </p>

        {/* Meeting ID input */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              placeholder="Enter Meeting ID (e.g. 123-456-7)"
              className="pl-9 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 rounded-lg h-10 text-sm outline-none transition-all duration-200"
            />
          </div>
          <Button
            onClick={handleJoinSession}
            className="bg-[#1e2b72] hover:bg-[#152060] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 text-white rounded-lg px-5 font-medium transition-all duration-200 cursor-pointer"
          >
            Join Session
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between mb-4 border-b border-gray-100">
          <div className="flex gap-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`text-sm font-semibold pb-2 relative transition-all duration-300 cursor-pointer ${activeTab === tab
                  ? "text-[#1e2b72] scale-105"
                  : "text-gray-500 hover:text-[#1e2b72]"
                  }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e2b72] rounded-full animate-fade-in" />
                )}
              </button>
            ))}
          </div>

          {activeTab === "Ongoing" && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeleteSelected}
                disabled={selectedMeetings.size === 0}
                className={`flex items-center justify-center h-9 w-9 rounded-xl border transition-all shadow-sm active:scale-95 cursor-pointer ${selectedMeetings.size > 0
                  ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300 hover:scale-105"
                  : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                  }`}
                title="Delete Selected Instant Meetings"
              >
                <Trash2 className="size-4 text-red-500" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="group text-xs text-slate-600 hover:text-[#1e2b72] hover:border-[#1e2b72]/30 flex items-center gap-1.5 cursor-pointer transition-all border border-slate-200 px-3.5 py-2 rounded-xl bg-white shadow-sm font-bold active:scale-95 duration-200">
                    <Filter className="size-3.5 text-indigo-500 group-hover:scale-110 transition-transform duration-200" />
                    <span>Filter ⚙</span>
                    {ongoingFilter !== "All" && (
                      <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md font-black ml-1 animate-scale-in">
                        {ongoingFilter}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-scale-in">
                  <DropdownMenuItem
                    onClick={() => setOngoingFilter("All")}
                    className="flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer hover:bg-indigo-50/50 text-xs font-semibold text-slate-700 hover:text-[#1e2b72] outline-none"
                  >
                    <span>All Ongoing</span>
                    {ongoingFilter === "All" && <Check className="size-3.5 text-[#1e2b72]" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setOngoingFilter("Instant")}
                    className="flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer hover:bg-indigo-50/50 text-xs font-semibold text-slate-700 hover:text-[#1e2b72] outline-none"
                  >
                    <span>Instant Only</span>
                    {ongoingFilter === "Instant" && <Check className="size-3.5 text-[#1e2b72]" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setOngoingFilter("Scheduled")}
                    className="flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer hover:bg-indigo-50/50 text-xs font-semibold text-slate-700 hover:text-[#1e2b72] outline-none"
                  >
                    <span>Scheduled Only</span>
                    {ongoingFilter === "Scheduled" && <Check className="size-3.5 text-[#1e2b72]" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {activeTab !== "Ongoing" && (
            <button className="group text-xs text-slate-400 hover:text-slate-500 flex items-center gap-1.5 transition-all border border-slate-200 px-3.5 py-2 rounded-xl bg-gray-50/50 cursor-not-allowed font-bold opacity-60">
              <Filter className="size-3.5 text-slate-400" />
              <span>Filter ⚙</span>
            </button>
          )}
        </div>

        {/* Session Cards */}
        <div className="animate-fade-in">
          {activeTab === "Scheduled" ? (
            <ScheduledMeetings refreshTrigger={refreshTrigger} />
          ) : filteredSessions.length > 0 ? (
            <div className="flex flex-col gap-4 pr-2 no-scrollbar">
              {filteredSessions.map((s) => {
                const isInstant = s.title === "Instant Huddle" || s.title === "Instant Meeting";
                return (
                  <SessionCard
                    key={s.id}
                    session={s}
                    onOpenTranscript={() => setShowTranscript(true)}
                    onOpenSummary={() => setShowSummary(true)}
                    onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
                    isSelected={selectedMeetings.has(s.id)}
                    onToggleSelect={isInstant && activeTab !== "Completed" ? () => handleToggleSelect(s.id) : undefined}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic">No sessions found.</p>
          )}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-full xl:w-[480px] xl:max-w-[480px] bg-gray-50 xl:border-l border-t xl:border-t-0 border-gray-100 p-4 sm:p-5 flex flex-col gap-5 xl:overflow-y-auto shrink-0 transition-all duration-300">
        <CreateHuddle />
        <MiniCalendar />
      </aside>



      <Dialog open={showThankYouDialog} onOpenChange={setShowThankYouDialog}>
        <DialogContent className="w-[500px] p-0 bg-white border border-gray-200 rounded-xl shadow-md">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Thank you for joining
            </h2>

            <p className="text-sm text-gray-500 mb-6">
              Your huddle has ended successfully. Would you like to join another session?
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                className="border-[#002266] text-[#002266] hover:bg-[#002266] hover:text-white cursor-pointer"
                onClick={() => setShowThankYouDialog(false)}
              >
                Leave
              </Button>

              <Button
                className="bg-[#1E2B72] hover:bg-[#17215A] text-white cursor-pointer"
                onClick={() => {
                  setShowThankYouDialog(false);
                  navigate("/meeting");
                }}
              >
                Join Again
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Transcript Modal */}
      {showTranscript && (
        <TranscriptModal
          closeTranscript={() => setShowTranscript(false)}
        />
      )}
      {showSummary && (
        <AISummaryCard
          closeCard={() => setShowSummary(false)}
        />
      )}
    </div>
  );
}
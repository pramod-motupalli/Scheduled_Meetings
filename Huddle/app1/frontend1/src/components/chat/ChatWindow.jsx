import { Phone, Video, Bold, Italic, Link, List, AtSign, Smile, Plus, Send, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import OutgoingCallModal from "./OutgoingCallModal";
import { useState } from "react";

export default function ChatWindow() {
  const [showVideoModal, setShowVideoModal] = useState(false);
  return (
    <div className="w-full max-w-[981px] h-[817px] bg-white rounded-2xl border border-gray-100 flex flex-col shadow-[0_4px_24px_rgba(0,0,0,0.02)] relative overflow-hidden transition-all duration-300">
      {/* Header */}
      <header className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2].map((i) => (
              <Avatar key={i} className="border-2 border-white w-8 h-8 shadow-sm">
                <AvatarImage src={`https://i.pravatar.cc/150?u=${i}`} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            ))}
            <div className="w-8 h-8 rounded-[12px] bg-blue-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600 shadow-sm">+3</div>
          </div>
          <div>
            <h2 className="font-extrabold text-[20px] text-[#191c1e] leading-tight">Senior Frontend Engineer</h2>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> ID: 1024</span>
              <span>• Active job post</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-blue-600 bg-blue-50 hover:bg-blue-100/80 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"><Phone className="w-4 h-4" /></Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowVideoModal(true)}
            className="text-blue-600 bg-blue-50 hover:bg-blue-100/80 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Video className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <ScrollArea className="flex-1 bg-[url('/bg-pattern.png')] bg-repeat animate-fade-in">
        <div className="p-6 space-y-6">
          <div className="flex justify-center">
            <span className="text-[10px] font-bold text-[#737686] bg-gray-100 border border-gray-200/50 px-3 py-1 rounded-[12px] uppercase tracking-widest shadow-sm">
              Today, Oct 24
            </span>
          </div>
          
          {/* Incoming Message */}
          <div className="flex gap-3 max-w-[80%] hover:-translate-y-[0.5px] transition-transform duration-200">
            <Avatar className="w-[32px] h-[36px] mt-1 shadow-sm">
              <AvatarImage src="https://i.pravatar.cc/150?u=jane" />
            </Avatar>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500">Jane Smith • 10:42 AM</p>
              <div className="bg-[#F1F3F7] p-4 rounded-2xl rounded-tl-none text-sm text-gray-700 leading-relaxed shadow-sm hover:shadow-md transition-all duration-300">
                I've reviewed the portfolio for candidate John Doe. His React architecture patterns are impressive, but we should verify his experience with Micro-frontends.
              </div>
            </div>
          </div>

          {/* Outgoing Message */}
          <div className="flex flex-col items-end gap-1 hover:-translate-y-[0.5px] transition-transform duration-200">
            <p className="text-[10px] text-gray-400 font-medium">You • 10:45 AM <span className="text-blue-500 ml-1">✓✓</span></p>
            <div className="bg-gradient-to-br from-[#002B6B] to-[#0a3ca6] text-white p-4 rounded-2xl rounded-tr-none text-sm max-w-[80%] shadow-md hover:shadow-lg hover:shadow-blue-900/10 transition-all duration-300">
              Agreed. I'll schedule a technical deep dive. Should I include the Lead Architect for that session?
            </div>
          </div>

          {/* File Attachment Message */}
          <div className="flex gap-3 max-w-[80%] hover:-translate-y-[0.5px] transition-transform duration-200">
             <Avatar className="w-8 h-8 mt-1 shadow-sm"><AvatarImage src="https://i.pravatar.cc/150?u=jane" /></Avatar>
             <div className="bg-white border border-gray-200/80 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#002B6B] p-3 rounded-lg"><FileText className="text-white w-6 h-6" /></div>
                  <div>
                    <p className="text-sm font-bold">John_Doe_Resume_2024.pdf</p>
                    <p className="text-[10px] text-gray-400">2.4 MB • Shared just now</p>
                  </div>
                </div>
                <Button size="sm" className="bg-[#002B6B] hover:bg-[#0a318a] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 w-full rounded-xl py-2 font-bold text-xs text-white transition-all duration-200 cursor-pointer">VIEW</Button>
             </div>
          </div>
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 pt-0">
        <div className="border border-gray-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100/50 rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.01)] transition-all duration-300">
          <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-50">
            <Bold className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-600 hover:scale-110 active:scale-95 transition-all duration-200" />
            <Italic className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-600 hover:scale-110 active:scale-95 transition-all duration-200" />
            <Link className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-600 hover:scale-110 active:scale-95 transition-all duration-200" />
            <div className="w-px h-4 bg-gray-200" />
            <List className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-600 hover:scale-110 active:scale-95 transition-all duration-200" />
          </div>
          <div className="p-4 flex items-center gap-2">
            <textarea 
              className="flex-1 text-sm outline-none resize-none placeholder:text-gray-400 focus:outline-none" 
              placeholder="Message #General"
              rows={1}
            />
            <div className="flex items-center gap-2">
              <AtSign className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-600 hover:scale-110 active:scale-95 transition-all duration-200" />
              <Smile className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-600 hover:scale-110 active:scale-95 transition-all duration-200" />
              <Plus className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-600 hover:scale-110 active:scale-95 transition-all duration-200" />
              <Button size="icon" className="bg-[#002B6B] hover:bg-[#0a318a] rounded-xl w-9 h-9 flex items-center justify-center hover:scale-105 active:scale-95 hover:shadow-md transition-all duration-200 cursor-pointer">
                <Send className="w-4 h-4 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {showVideoModal && (
        <OutgoingCallModal
          userName="Jai"
          closeModal={() => setShowVideoModal(false)}
        />
      )}
    </div>
  );
}
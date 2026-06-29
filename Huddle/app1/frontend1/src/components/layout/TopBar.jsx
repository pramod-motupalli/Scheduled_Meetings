
import { Button } from "@/components/ui/button";

export default function TopBar() {
  return (
    <header className="w-full h-[75.59px] bg-white border-b border-gray-100 flex items-center justify-end px-6 gap-3 flex-shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      
      <Button className="bg-gradient-to-r from-[#002266] to-[#0c3aa3] hover:from-[#001744] hover:to-[#0a318a] hover:shadow-[0_4px_12px_rgba(12,58,163,0.3)] hover:-translate-y-0.5 active:translate-y-0 text-white text-[16px] font-semibold rounded-[10px] h-[52px] w-[168px] flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer">
        Upgrade
        <span className="bg-white/15 backdrop-blur-md text-white text-[14px] font-bold px-2 py-0.5 rounded-[6px] flex items-center gap-0.5">
          <span className="text-yellow-300 animate-bounce-subtle text-[14px]">⚡</span>921
        </span>
      </Button>

      <button className="w-[44px] h-[44px] rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-blue-400 hover:scale-105 active:scale-95 transition-all duration-300 relative group cursor-pointer shadow-sm">
        <img
          src="bell.svg"
          alt="Notifications"
          className="w-[22px] h-[22px] transition-transform duration-300 group-hover:rotate-12"
        />
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse-red border border-white" />
      </button>

      <button className="w-[44px] h-[44px] rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-blue-400 hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer shadow-sm">
        <img
          src="message.svg"
          alt="mess"
          className="w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-110"
        />
      </button>
      
    </header>
  );
}
import { Video, X } from "lucide-react";

export default function OutgoingCallModal({
  closeModal,
  userName = "Jai",
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      {/* Modal */}
      <div
        className="
          w-[440px]
          h-[278px]
          bg-white
          rounded-[8px]
          border
          border-gray-200
          px-[24px]
          py-[12px]
          flex
          flex-col
          items-center
        "
      >
        {/* Profile Image */}
        <div className="mt-2">
          <img
            src="/download.png"
            alt="Prof"
            className="
              w-[96px]
              h-[96px]
              rounded-full
              object-cover
              border-4
              border-white
              shadow-lg
            "
          />
        </div>

        {/* Title */}
        <h1
          className="
            mt-5
            text-[24px]
            font-semibold
            text-[#002266]
            text-center
            leading-tight
          "
        >
          Outgoing Video to from {userName}
        </h1>

        {/* Subtitle */}
        <p
          className="
            mt-2
            text-[16px]
            text-[#64748B]
            text-center
            
          "
        >
          Do you want to make a call ?
        </p>

        {/* Buttons */}
        <div className="flex gap-6 mt-auto mb-2">

          {/* Decline */}
          <button
            onClick={closeModal}
            className="
              w-[126px]
              h-[48px]
              border
              border-[#949494]
              rounded-[8px]
              flex
              items-center
              justify-center
              gap-[12px]
              text-[#002266]
              font-semibold
              text-[16px]
              hover:bg-gray-50
              mt-[12px]
              mb-[12px]
              mr-[16px]
              ml-[16px]
            "
          >
            <span>Decline</span>

            <div
              className="
                w-[24px]
                h-[24px]
                border-[1.5px]
                border-[#002266]
                rounded-[5px]
                flex
                items-center
                justify-center
              "
            >
              <X className="w-[20px] h-[20px]" />
            </div>
          </button>

          {/* Call */}
          <button
            className="
              w-[154px]
              h-[48px]
              bg-[#002266]
              rounded-[8px]
              flex
              items-center
              justify-center
              gap-[12px]
              text-white
              font-semibold
              text-[16px]
              hover:bg-[#001a4d]
              mt-[12px]
              
             
            "
          >
            <span>Make a call</span>

            <Video className="w-[24px] h-[24px]" />
          </button>

        </div>
      </div>
    </div>
  );
}
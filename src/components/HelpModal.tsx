import { X } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-emerald-400/20 rounded-2xl p-8 w-[90%] max-w-md relative shadow-2xl">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X />
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-emerald-400">
          How can we help you?
        </h2>

        <p className="text-gray-400 mb-6">
          Our AI-powered system is here to assist you. 
          You can browse items, report lost belongings, 
          or contact admin for support.
        </p>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:scale-105 transition-transform"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
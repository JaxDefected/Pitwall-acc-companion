import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { useSetups } from "../../context/SetupContext";

export default function ToastContainer() {
  const { toast, closeToast } = useSetups();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-3 bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-xl shadow-2xl max-w-sm font-sans"
        >
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${
              toast.type === "success"
                ? "bg-emerald-500"
                : toast.type === "error"
                ? "bg-red-500"
                : "bg-cyan-500"
            }`}
          />
          <span className="text-xs font-semibold leading-relaxed text-zinc-200">
            {toast.message}
          </span>
          <button
            onClick={closeToast}
            aria-label="Close notification"
            className="ml-2 hover:text-white text-zinc-400 text-sm font-bold cursor-pointer transition-colors shrink-0"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

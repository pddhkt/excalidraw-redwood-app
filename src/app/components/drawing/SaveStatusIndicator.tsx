"use client";

import { Loader2, CheckCircle, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type SaveStatus = "idle" | "checking" | "saving" | "saved" | "no-changes" | "error";

export interface SaveStatusIndicatorProps {
  status: SaveStatus;
  className?: string;
}

/**
 * Save Status Indicator Component with Framer Motion Animations
 * Animates content changes (icon/text) and width transitions
 */
export function SaveStatusIndicator({ status, className = "" }: SaveStatusIndicatorProps) {
  const statusConfig = {
    checking: {
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      text: "Checking...",
      bgColor: "#6b7280", // gray-500
    },
    saving: {
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      text: "Saving...",
      bgColor: "#3b82f6", // blue-500
    },
    saved: {
      icon: <CheckCircle className="h-4 w-4" />,
      text: "Saved",
      bgColor: "#22c55e", // green-500
    },
    "no-changes": {
      icon: <Info className="h-4 w-4" />,
      text: "No changes",
      bgColor: "#9ca3af", // gray-400
    },
    error: {
      icon: <AlertCircle className="h-4 w-4" />,
      text: "Error saving",
      bgColor: "#ef4444", // red-500
    },
  };

  const config = status !== "idle" ? statusConfig[status] : null;

  return (
    <div className={className}>
      <AnimatePresence>
        {config && (
          <motion.div
            key="status-badge"
            layout
            initial={{ opacity: 0, scale: 0.5, backgroundColor: config.bgColor }}
            animate={{ opacity: 1, scale: 1, backgroundColor: config.bgColor }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{
              opacity: { duration: 0.3, ease: "easeOut" },
              scale: {
                type: "spring",
                stiffness: 500,
                damping: 30
              },
              backgroundColor: { duration: 0.3 },
              layout: {
                type: "spring",
                stiffness: 500,
                damping: 30
              }
            }}
            className="px-3 py-2 rounded-md shadow-lg flex items-center gap-2 text-sm font-medium text-white"
          >
            <motion.div
              key={status}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              {config.icon}
              <span className="whitespace-nowrap">
                {config.text}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

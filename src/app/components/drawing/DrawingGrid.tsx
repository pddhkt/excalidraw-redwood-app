"use client";

import { DrawingCard } from "./DrawingCard";
import type { Drawing } from "@/types/drawing";

interface DrawingGridProps {
  drawings: Drawing[];
}

export function DrawingGrid({ drawings }: DrawingGridProps) {
  const handleDrawingClick = (drawing: Drawing) => {
    // Navigate to drawing editor
    window.location.href = `/drawing/${drawing.id}`;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {drawings.map((drawing) => (
        <DrawingCard
          key={drawing.id}
          drawing={drawing}
          onClick={handleDrawingClick}
        />
      ))}
    </div>
  );
}

"use client";

import React, { use } from "react";
import { Room } from "@/ui/pages/Room";

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const resolvedParams = use(params);

  return (
    <main>
      <Room roomId={resolvedParams.roomId} />
    </main>
  );
}

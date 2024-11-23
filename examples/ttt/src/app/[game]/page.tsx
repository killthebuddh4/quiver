"use client";
import { useEffect, useState } from "react";
import { GameBoard } from "@/components/GameBoard";
import quiver from "@qrpc/quiver";

export default function Page() {
  const [q, setQ] = useState<ReturnType<typeof quiver.q> | null>(null);
  const [selections, setSelections] = useState<
    { cell: number; player: "X" | "O" }[]
  >([]);

  useEffect(() => {
    setQ((prev) => {
      if (prev === null) {
        return quiver.q();
      } else {
        return prev;
      }
    });

    return () => {
      q && q.kill();
    };
  }, []);

  useEffect(() => {
    if (q === null) {
      return;
    }

    q.serve((props: { cell: number }) => {
      setSelections((prev) => {
        return [...prev, { cell: props.cell, player: "O" }];
      });

      return { ok: true };
    });
  }, [q]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <h1>{q && q.address}</h1>
      <GameBoard game={{ selections, select: () => null }} perspective="X" />
    </div>
  );
}

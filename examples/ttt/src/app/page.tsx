import { GameBoard } from "@/components/GameBoard";

export default function Page() {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <GameBoard game={{ selections: [] }} />
    </div>
  );
}

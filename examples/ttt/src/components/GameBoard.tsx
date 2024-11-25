"use client";
import { Game, Cell } from "@/hooks/useGame";

export const GameBoard = (props: {
  game: Game;
  onClick: (cell: Cell) => void;
}) => {
  const cells = [];
  for (let i = 0; i < 9; i++) {
    cells.push(i);
  }

  return (
    <div>
      <div className="flex flex-wrap relative h-[600px] w-[600px] border-black">
        <div className="absolute w-[4px] bg-black h-[596px] left-[198px]"></div>
        <div className="absolute w-[4px] bg-black h-[596px] left-[398px]"></div>
        <div className="absolute h-[4px] bg-black w-[596px] top-[198px]"></div>
        <div className="absolute h-[4px] bg-black w-[596px] top-[398px]"></div>
        {cells.map((cell) => {
          return (
            <div
              key={cell}
              className="flex min-w-[200px] max-w-[200px] h-[200px] items-center justify-center text-6xl"
              onClick={() =>
                props.onClick({
                  id: cell as Cell["id"],
                })
              }
            >
              {(() => {
                const move = props.game.moves.find(
                  (move) => move.cell.id === cell,
                );

                if (move === undefined) {
                  return "";
                }

                return move.player.symbol;
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

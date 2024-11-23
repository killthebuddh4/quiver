"use client";

type Player = "X" | "O";

type Selection = {
  cell: number;
  player: Player;
};

type Game = {
  selections: Selection[];
  select: (cell: number) => void;
};

export const GameBoard = (props: { game: Game; perspective: Player }) => {
  const cells = [];
  for (let i = 0; i < 9; i++) {
    cells.push(i);
  }

  console.log("Rendering game with board", props.game);

  return (
    <div>
      <div className="flex flex-wrap relative h-[600px] w-[600px] border-black">
        <div className="absolute w-[4px] bg-black h-[596px] left-[198px]"></div>
        <div className="absolute w-[4px] bg-black h-[596px] left-[398px]"></div>
        <div className="absolute h-[4px] bg-black w-[596px] top-[198px]"></div>
        <div className="absolute h-[4px] bg-black w-[596px] top-[398px]"></div>
        {cells.map((cell, i) => {
          return (
            <div
              key={i}
              className="flex min-w-[200px] max-w-[200px] h-[200px] items-center justify-center text-6xl"
            >
              {(() => {
                const selection = props.game.selections.find(
                  (selection) => selection.cell === cell,
                );

                if (selection === undefined) {
                  return "";
                }

                return selection.player;
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

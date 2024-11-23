"use client";

import { useState } from "react";

type Player = "X" | "O";

type Selection = {
  cell: number;
  player: Player;
};

type Game = {
  selections: Selection[];
};

export const GameBoard = (props: { game: Game }) => {
  const cells = [];
  for (let i = 0; i < 9; i++) {
    cells.push(i);
  }

  const [selections, setSelections] = useState(props.game.selections);

  return (
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
            onClick={() => {
              setSelections((prev) => {
                const selection = selections.find(
                  (selection) => selection.cell === cell,
                );

                if (selection !== undefined) {
                  return selections;
                }

                return [...selections, { cell: cell, player: "X" }];
              });
            }}
          >
            {(() => {
              let selection = props.game.selections.find(
                (selection) => selection.cell === cell,
              );

              if (selection === undefined) {
                selection = selections.find(
                  (selection) => selection.cell === cell,
                );
              }

              if (selection === undefined) {
                return "";
              }

              return selection.player;
            })()}
          </div>
        );
      })}
    </div>
  );
};

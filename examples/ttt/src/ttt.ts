export type Player = {
  symbol: "X" | "O";
};

export type Cell = {
  id: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
};

export type Selection = {
  cell: Cell;
  player: Player;
};

export type Game = {
  selections: Selection[];
};

export const create = (): Game => {
  return { selections: [] };
};

export const move = (game: Game, selection: Selection): Game => {
  const isSelected = Boolean(
    game.selections.find((s) => s.cell.id === selection.cell.id),
  );

  if (isSelected) {
    return game;
  }

  return { selections: [...game.selections, selection] };
};

export type Player = {
  address: string;
  symbol: "X" | "O";
};

export type Cell = {
  id: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
};

export type Move = {
  cell: Cell;
  player: Player;
};

export type Game = {
  x: Player | null;
  o: Player | null;
  moves: Move[];
  winner: Player | null;
};

export type Maybe<T> =
  | {
      ok: true;
      value: T;
      err?: undefined;
    }
  | {
      ok: false;
      value?: undefined;
      err: string;
    };

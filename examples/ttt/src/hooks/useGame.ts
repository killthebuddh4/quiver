import { useState, useEffect } from "react";
import quiver from "@qrpc/quiver";

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

export const useGame = () => {
    const [q, setQ] = useState<ReturnType<typeof quiver.q> | null>(null);

    const [game, setGame] = useState<Game>({ selections: [] });

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

    const 

    useEffect(() => {
        if (q === null) {
            return;
        }

        q.serve((props: { cell: number }) => {
            setGame((prev) => {
                return {
                    selections: [...prev.selections, { cell: { id: props.cell }, player: { symbol: "O" } }],
                };
            });

            return { ok: true };
        });
    }, [q]);

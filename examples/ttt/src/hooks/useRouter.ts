import { useState, useEffect } from "react";
import { useQuiver } from "./useQuiver";
import { QuiverRouter } from "@qrpc/quiver/build/types/QuiverRouter";
import { useGame } from "./useGame";

export const useRouter = () => {
  const { q } = useQuiver();
  console.log(`useRouter q address is ${q?.address}`);

  const { move, join } = useGame();
  const [server, setServer] = useState<(() => void) | null>(null);

  useEffect(() => {
    console.log("useRouter :: useEffect in useRouter is running");

    if (q === null) {
      console.log(
        "useRouter :: useEffect in useRouter is returning because q is null",
      );
      return;
    }

    setServer((prev) => {
      if (prev !== null) {
        prev();
      }

      const router = q
        .router()
        .function("move", (props: Parameters<typeof move>[0]) => {
          console.log(
            `useRouter :: move function was called by ${props.move.player.address}`,
          );
          return move(props);
        })
        .function("join", (props: Parameters<typeof join>[0]) => {
          console.log(
            `useRouter :: Join function was called by ${props.player.address}`,
          );
          return join(props);
        });

      console.log(`useRouter :: serving router for address ${q.address}`);

      return q.serve(router);
    });
  }, [q, join, move]);
};

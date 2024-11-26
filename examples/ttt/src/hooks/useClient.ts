import { useState, useEffect } from "react";
import { useQuiver } from "./useQuiver";
import { QuiverClient } from "@qrpc/quiver/build/types/QuiverClient";
import { QuiverRouter } from "@qrpc/quiver/build/types/QuiverRouter";
import { useGame } from "./useGame";

export const useClient = (props: { address?: string }) => {
  type Router = QuiverRouter<
    any,
    any,
    { move: typeof move; join: typeof join }
  >;
  type Client = QuiverClient<Router>;

  const { q } = useQuiver();
  const { move, join } = useGame();
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    console.log("useEffect in useClient is running");

    if (q === null) {
      console.log("useEffect in useClient is returning because q is null");
      return;
    }

    const address = props.address;
    if (address === undefined) {
      console.log(
        "useEffect in useClient is returning because address is undefined",
      );
      return;
    }

    setClient(() => {
      return q.client<Router>(address);
    });
  }, [q, props.address]);

  return { client };
};

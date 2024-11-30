import { q } from "./quiver/q";
import { create } from "./quiver/client";
import { Player } from "./game/types";

const peer = window.location.pathname.slice(1);
const client = create(peer);
const player: Player = { address: q.address, symbol: "O" };

export const Challenger = () => {
  return (
    <div className="challenger">
      <h1>{`Challenger: ${q.address}`}</h1>
      <h2>{`Host: ${peer}`}</h2>
      <button
        onClick={async () => {
          console.log("Joining", { player });
          const response = await client.join({ player });
        }}
      >
        Join
      </button>
    </div>
  );
};

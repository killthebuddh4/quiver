import { useEffect, useState } from "react";
import quiver from "@qrpc/quiver";

export const useQuiver = () => {
  const [q, setQ] = useState<ReturnType<typeof quiver.q> | null>(null);

  useEffect(() => {
    console.log("useEffect in useQuiver is running");

    setQ((prev) => {
      if (prev === null) {
        console.log("useEffect in useQuiver is creating a new quiver");
        const q = quiver.q();

        return q;
      }

      return prev;
    });

    return () => {
      q && q.kill();
    };
  }, []);

  if (q !== null) {
    console.log("useQuiver is not null");
  }
  return { q };
};

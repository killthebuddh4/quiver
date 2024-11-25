import { useEffect } from "react";
import quiver from "@qrpc/quiver";
import { create } from "zustand";

const useQuiverStore = create<{
  q: ReturnType<typeof quiver.q> | null;
  setQ: () => void;
}>((set) => ({
  q: null,
  setQ: () => {
    return set((prev) => {
      if (prev.q !== null) {
        return prev;
      }

      const q = quiver.q();

      console.log(`useQuiverStore :: setting q for address: ${q.address}`);

      return { ...prev, q };
    });
  },
}));

export const useQuiver = () => {
  const { q, setQ } = useQuiverStore();

  useEffect(() => {
    setQ();

    return () => {
      q && q.kill();
    };
  }, []);

  console.log(`useQuiver :: q address is ${q?.address}`);

  return { q };
};

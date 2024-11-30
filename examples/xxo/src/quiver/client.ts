import { q } from "./q";
import type { Router } from "./router";

export const create = (peer: string) => {
  return q.client<Router>(peer, {
    logs: {
      onSendError: (req, err) => {
        console.log("onSendError req", req);
        console.log("onSendError err", err);
      },
    },
  });
};

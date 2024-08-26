import { Fig } from "../types/Fig.js";
import { QuiverCall } from "../types/QuiverCall.js";

export const createCall = (
  clientAddress: string,
  publish: Fig["publish"],
): QuiverCall => {
  return async (address, namespace, request) => {
    const path = `quiver/0.0.1/client/${clientAddress}/${namespace}/${request.function}`;

    let content;
    try {
      content = JSON.stringify(request);
    } catch {
      throw new Error(`Failed to serialize request to ${path}`);
    }

    return publish({
      conversation: {
        peerAddress: address,
        context: {
          conversationId: path,
          metadata: {},
        },
      },
      content,
    });
  };
};

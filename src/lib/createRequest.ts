import { QuiverCall } from "../types/QuiverCall.js";
import { QuiverController } from "../types/QuiverController.js";

export const createRequest = (controller: QuiverController): QuiverCall => {
  return async (address, namespace, request) => {
    const path = `quiver/0.0.1/requests/${controller.address}/${namespace}/${request.function}`;

    let content;
    try {
      content = JSON.stringify(request);
    } catch {
      throw new Error(`Failed to serialize request to ${path}`);
    }

    return controller.send({
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

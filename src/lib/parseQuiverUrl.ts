import { Maybe } from "../types/Maybe.js";
import { QuiverUrl } from "../types/QuiverUrl.js";
import { Message } from "../types/Message.js";

const VERSION = "0.0.1";

export const parseQuiverUrl = (message: Message): Maybe<QuiverUrl> => {
  const url = message.conversation.context?.conversationId;

  if (typeof url !== "string") {
    return {
      ok: false,
      code: "INVALID_PATH",
      reason: "Expected string",
    };
  }

  const segments = url.split("/");

  if (segments.length !== 6) {
    return {
      ok: false,
      code: "INVALID_NUMBER_OF_SEGMENTS",
      reason: `Expected 6 segments, got ${segments.length}`,
    };
  }

  const [quiver, version, channel, address, ...path] = segments;

  if (quiver !== "quiver") {
    return {
      ok: false,
      code: "INVALID_QUIVER_SEGMENT",
      reason: `Expected "quiver", got "${quiver}"`,
    };
  }

  if (version !== VERSION) {
    return {
      ok: false,
      code: "INVALID_VERSION_SEGMENT",
      reason: `Expected "${VERSION}", got "${version}"`,
    };
  }

  if (
    channel !== "router" &&
    channel !== "requests" &&
    channel !== "responses" &&
    channel !== "signals"
  ) {
    return {
      ok: false,
      code: "INVALID_CHANNEL_SEGMENT",
      reason: `Expected "router" or "requests" or "responses" or "signals", got "${channel}"`,
    };
  }

  // TODO more validation
  if (address !== message.senderAddress) {
    return {
      ok: false,
      code: "INVALID_ADDRESS_SEGMENT",
      reason: `Expected "${message.senderAddress}", got "${address}"`,
    };
  }

  return {
    ok: true,
    value: {
      quiver,
      version,
      channel,
      address,
      path,
    },
  };
};

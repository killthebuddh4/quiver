import { Maybe } from "../types/Maybe.js";
import { QuiverPath } from "../types/QuiverPath.js";
import { Message } from "../types/Message.js";

const VERSION = "0.0.1";

export const parseQuiverPath = (message: Message): Maybe<QuiverPath> => {
  const path = message.conversation.context?.conversationId;

  if (typeof path !== "string") {
    return {
      ok: false,
      code: "INVALID_PATH",
      reason: "Expected string",
    };
  }

  const segments = path.split("/");

  if (segments.length !== 6) {
    return {
      ok: false,
      code: "INVALID_NUMBER_OF_SEGMENTS",
      reason: `Expected 6 segments, got ${segments.length}`,
    };
  }

  const [quiver, version, channel, address, namespace, fn] = segments;

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

  if (channel !== "requests" && channel !== "responses") {
    return {
      ok: false,
      code: "INVALID_CHANNEL_SEGMENT",
      reason: `Expected "requests" or "responses", got "${channel}"`,
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

  // TODO more validation
  if (namespace.length === 0) {
    return {
      ok: false,
      code: "INVALID_NAMESPACE_SEGMENT",
      reason: "Expected non-empty string",
    };
  }

  // TODO more validation
  if (fn.length === 0) {
    return {
      ok: false,
      code: "INVALID_FUNCTION_SEGMENT",
      reason: "Expected non-empty string",
    };
  }

  return {
    ok: true,
    value: {
      quiver,
      version,
      channel,
      address,
      namespace,
      function: fn,
    },
  };
};

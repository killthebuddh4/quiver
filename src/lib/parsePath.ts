import { Maybe } from "../types/Maybe.js";
import { QuiverPath } from "../types/QuiverPath.js";

export const parsePath = (path: unknown): Maybe<QuiverPath> => {
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

  const [quiver, version, source, address, namespace, fn] = segments;

  if (quiver !== "quiver") {
    return {
      ok: false,
      code: "INVALID_QUIVER_SEGMENT",
      reason: `Expected "quiver", got "${quiver}"`,
    };
  }

  if (source !== "router" && source !== "client") {
    return {
      ok: false,
      code: "INVALID_SOURCE_SEGMENT",
      reason: `Expected "router" or "client", got "${source}"`,
    };
  }

  // TODO more validation
  if (address.length !== 42) {
    return {
      ok: false,
      code: "INVALID_ADDRESS_SEGMENT",
      reason: `Expected 42 characters, got ${address.length}`,
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
      source,
      address,
      namespace,
      function: fn,
    },
  };
};

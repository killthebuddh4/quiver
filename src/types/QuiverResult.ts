import { Message } from "./Message.js";
import { QuiverErrorResponse } from "./QuiverErrorResponse.js";

/* This type represents the thing a client.foo() call returns. */

export type QuiverResult<D> =
  | {
      ok: true;
      data: D;
      request: Message;
      response: Message;
      error?: undefined;
      metadata?: Record<string, unknown>;
    }
  | {
      ok: false;
      data?: undefined;
      request?: Message;
      response?: Message;
      error: {
        code: QuiverErrorResponse["code"];
        message?: string;
        metadata?: Record<string, unknown>;
      };
    };

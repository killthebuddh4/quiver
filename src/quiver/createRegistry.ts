import { QuiverHandler } from "../types/QuiverHandler.js";
import { QuiverHookName } from "../types/QuiverHookName.js";

export const createRegistry = (): {
  [key in QuiverHookName]: QuiverHandler<any, any>[];
} => {
  return {
    USE: [],
    RECV_MESSAGE: [],
    PARSE_URL: [],
    PARSE_JSON: [],
    PARSE_REQUEST: [],
    PARSE_RESPONSE: [],
    GET_FUNCTION: [],
    VALIDATE_INPUT: [],
    CALL_FUNCTION: [],
    VALIDATE_OUTPUT: [],
    GET_REQUEST: [],
    THROW: [],
    RETURN: [],
    EXIT: [],
    ERROR: [],
    SEND_REQUEST: [],
    SEND_RESPONSE: [],
  };
};

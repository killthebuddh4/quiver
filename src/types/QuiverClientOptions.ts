import { Message } from "./Message.js";
import { QuiverErrorResponse } from "./QuiverErrorResponse.js";
import { QuiverRequest } from "./QuiverRequest.js";
import { QuiverResponse } from "./QuiverResponse.js";
import { QuiverSuccessResponse } from "./QuiverSuccessResponse.js";
import { QuiverUrl } from "./QuiverUrl.js";

export type QuiverClientOptions = {
  timeoutMs?: number;
  logs?: {
    onSendingRequest?: (req: QuiverRequest) => void;
    onSendError?: (req: QuiverRequest, err: unknown) => void;
    onSent?: (message: Message) => void;
    onRecvMessage?: (message: Message) => void;
    onValidatedReturn?: (response: QuiverResponse<unknown>) => void;
    onMatchedRequest?: (message: Message) => void;
    onNamespaceMismatch?: (message: Message, namespace: string) => void;
    onParseUrlError?: (message: Message, errro: unknown) => void;
    onParsedUrl?: (url: QuiverUrl) => void;
    onParseJsonError?: (message: Message, error: unknown) => void;
    onParsedJson?: (json: unknown) => void;
    onParseResponseError?: (message: Message, error: unknown) => void;
    onParsedResponse?: (response: QuiverResponse<unknown>) => void;
    onRequestNotFound?: (response: QuiverResponse<unknown>) => void;
    onErrorResponse?: (response: QuiverErrorResponse) => void;
    onSuccessResponse?: (response: QuiverSuccessResponse<unknown>) => void;
  };
};

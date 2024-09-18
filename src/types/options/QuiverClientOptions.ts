import { Message } from "../Message.js";
import { QuiverRequest } from "../QuiverRequest.js";
import { QuiverResponse } from "../QuiverResponse.js";
import { QuiverUrl } from "../QuiverUrl.js";

export type QuiverClientOptions = {
  logs?: {
    onSendingRequest?: (req: QuiverRequest) => void;
    onSendError?: (req: QuiverRequest, err: unknown) => void;
    onSent?: (message: Message) => void;
    onRecvMessage?: (message: Message) => void;
    onNamespaceMismatch?: (message: Message, namespace: string) => void;
    onParseUrlError?: (message: Message, errro: unknown) => void;
    onParsedUrl?: (url: QuiverUrl) => void;
    onParseJsonError?: (message: Message, error: unknown) => void;
    onParsedJson?: (json: unknown) => void;
    onParseResponseError?: (message: Message, error: unknown) => void;
    onParsedResponse?: (response: QuiverResponse<unknown>) => void;
    onRequestNotFound?: (response: QuiverResponse<unknown>) => void;
    onResolving?: () => void;
  };
};

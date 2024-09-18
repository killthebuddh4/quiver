import { Message } from "../types/Message.js";
import { parseQuiverUrl } from "../url/parseQuiverUrl.js";
import { parseQuiverResponse } from "../parsers/parseQuiverResponse.js";
import { getUniqueId } from "../lib/getUniqueId.js";
import { QuiverClientOptions } from "../types/QuiverClientOptions.js";
import { getRequestUrl } from "../url/getRequestUrl.js";
import { QuiverUrl } from "../types/QuiverUrl.js";
import { urlToString } from "../url/urlToString.js";
import { QuiverProvider } from "./QuiverProvider.js";

// export class QuiverClient<App extends Quiver.App>
//   implements Quiver.Client<App>
// {
//   public type = "QUIVER_CLIENT" as const;

//   private provider: Quiver.Provider;

//   private pending = new Map<string, (response: any) => any>();

//   private server: { address: string; namespace: string };

//   private options?: QuiverClientOptions;

//   private subscription: Promise<{ unsubscribe: () => void }>;

//   public constructor(
//     server: { address: string; namespace: string },
//     options?: QuiverClientOptions,
//   ) {
//     this.provider = new QuiverProvider();
//     this.options = options;
//     this.server = server;
//     this.subscription = this.provider.subscribe(this.handler.bind(this));
//   }

//   public stop() {
//     this.subscription.then((sub) => sub.unsubscribe());
//   }

//   private async call(url: QuiverUrl, args: any[]) {
//     if (this.provider === undefined) {
//       throw new Error("Provider is undefined");
//     }

//     const request = {
//       id: getUniqueId(),
//       // TODO, this kind of doesn't make sense for a few reasons.
//       function: url.path[url.path.length - 1] || "TODO",
//       arguments: args,
//     };

//     let str: string;
//     try {
//       str = JSON.stringify(request);
//     } catch {
//       return {
//         ok: false,
//         code: "INPUT_SERIALIZATION_FAILED",
//         response: null,
//       };
//     }

//     let sent: Awaited<ReturnType<Quiver.Provider["publish"]>>;
//     try {
//       this.options?.logs?.onSendingRequest?.(request);

//       sent = await this.provider.publish({
//         conversation: {
//           peerAddress: this.server.address,
//           context: {
//             conversationId: urlToString(url),
//             metadata: {},
//           },
//         },
//         content: str,
//       });

//       this.options?.logs?.onSent?.(sent);
//     } catch (error) {
//       this.options?.logs?.onSendError?.(request, error);

//       return {
//         ok: false,
//         code: "REQUEST_SEND_FAILED",
//         response: null,
//       };
//     }

//     return new Promise((resolve) => {
//       this.pending.set(sent.id, (response) => {
//         this.pending.delete(sent.id);
//         resolve(response);
//       });
//     });
//   }

//   private proxy(url: QuiverUrl) {
//     const proxy = this.proxy.bind(this);
//     const call = this.call.bind(this);

//     return new Proxy(() => null, {
//       get: (_1, prop) => {
//         if (typeof prop !== "string") {
//           throw new Error(`Expected string, got ${typeof prop}`);
//         }

//         url.path.push(prop);

//         return proxy(url);
//       },

//       apply: (_1, _2, args) => {
//         return call(url, args);
//       },
//     });
//   }

//   public client() {
//     if (this.provider === undefined) {
//       throw new Error("Provider is undefined");
//     }
//     return this.proxy(
//       getRequestUrl(this.provider.signer.address, this.server.namespace, []),
//     ) as ReturnType<Quiver.Client<App>["client"]>;
//   }

//   private async handler(message: Message) {
//     if (this.provider === undefined) {
//       throw new Error("Somehow received a message but provider is undefined");
//     }

//     /* ************************************************************************
//      *
//      * RECV_MESSAGE
//      *
//      * ***********************************************************************/

//     this.options?.logs?.onRecvMessage?.(message);

//     let received: Quiver.Response = {
//       message,
//     };

//     /* ************************************************************************
//      *
//      * PARSE_URL
//      *
//      * ***********************************************************************/

//     const url = parseQuiverUrl(received.message);

//     if (!url.ok) {
//       this.options?.logs?.onParseUrlError?.(received.message, url);

//       throw "TODO";
//     }

//     received.url = url.value;

//     if (received.url.namespace !== this.server.namespace) {
//       this.options?.logs?.onNamespaceMismatch?.(
//         received.message,
//         received.url.namespace,
//       );

//       throw "TODO";
//     }

//     this.options?.logs?.onParsedUrl?.(received.url);

//     /* ************************************************************************
//      *
//      * PARSE_JSON
//      *
//      * ***********************************************************************/

//     try {
//       received.json = JSON.parse(String(received.message.content));
//     } catch (error) {
//       this.options?.logs?.onParseJsonError?.(received.message, error);

//       throw "TODO";
//     }

//     this.options?.logs?.onParsedJson?.(received.json);

//     /* ************************************************************************
//      *
//      * PARSE_RESPONSE
//      *
//      * ************************************************************************/

//     const response = parseQuiverResponse(received.json);

//     if (!response.ok) {
//       this.options?.logs?.onParseResponseError?.(received.message, response);

//       throw "TODO";
//     }

//     received.response = response.value;

//     this.options?.logs?.onParsedResponse?.(received.response);

//     /* ************************************************************************
//      *
//      * GET_REQUEST
//      *
//      * ***********************************************************************/

//     const request = this.pending.get(received.response.id);

//     if (request === undefined) {
//       this.options?.logs?.onRequestNotFound?.(received.response);

//       throw "TODO";
//     }

//     /* ************************************************************************
//      *
//      * MIDDLEWARE
//      *
//      * ***********************************************************************/

//     // TODO

//     /* ************************************************************************
//      *
//      * RESOLVE REQUEST
//      *
//      * ***********************************************************************/

//     this.options?.logs?.onResolving?.();

//     request(received.response);
//   }
// }

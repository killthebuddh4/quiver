import * as Quiver from "../types/quiver/quiver.js";
import { Message } from "../types/Message.js";
import { parseQuiverUrl } from "../parsers/parseQuiverUrl.js";
import { parseQuiverResponse } from "../parsers/parseQuiverResponse.js";
import { getUniqueId } from "../lib/getUniqueId.js";

export class QuiverClient<
  Server extends Quiver.Router<any, any, any> | Quiver.Function<any, any, any>,
> implements Quiver.Client<Server>
{
  public type = "QUIVER_CLIENT" as const;

  private provider?: Quiver.Provider;

  private pending = new Map<string, (response: any) => any>();

  private server: { address: string };

  public constructor(server: { address: string }) {
    this.server = server;
  }

  public async start(provider?: Quiver.Provider) {
    if (provider === undefined) {
      throw new Error("Default provider not yet implemented");
    }

    this.provider = provider;

    const unsub = await provider.subscribe(this.handler);

    return {
      stop: unsub.unsubscribe,
    };
  }

  public client() {
    const callProxy = async (path: string[], args: any[]) => {
      try {
        console.log(`Calling path: ${path.join("/")}, args: ${args}`);

        if (this.provider === undefined) {
          console.log(`Provider is undefined`);
          throw new Error("Provider is undefined");
        }

        if (path.length === 0) {
          console.log(`Path is empty`);
          throw new Error(`Path is empty`);
        }

        const request = {
          id: getUniqueId(),
          function: path[path.length - 1],
          arguments: args,
        };

        let str: string;
        try {
          str = JSON.stringify(request);
        } catch {
          return {
            ok: false,
            code: "INPUT_SERIALIZATION_FAILED",
            response: null,
          };
        }

        const conversationId = `quiver/0.0.1/requests/${this.provider.signer.address}/${path.join("/")}`;

        console.log(
          `CLIENT ${this.provider.signer.address} SENDING MESSAGE to ${this.server.address}\n`,
          `${str}`,
        );

        const sent = await this.provider.publish({
          conversation: {
            peerAddress: this.server.address,
            context: {
              conversationId,
              metadata: {},
            },
          },
          content: str,
        });

        console.log(`CLIENT SENT THE MESSAGE`);

        return new Promise((resolve) => {
          this.pending.set(sent.id, resolve);
        });
      } catch (error) {
        console.error(error);
      }
    };

    const createProxy = (path: string[]): any => {
      return new Proxy(() => null, {
        get: (_1, prop) => {
          console.log(`Getting prop: ${String(prop)}`);

          if (typeof prop !== "string") {
            throw new Error(`Expected string, got ${typeof prop}`);
          }

          console.log("Next path:", [...path, prop]);
          return createProxy([...path, prop]);
        },

        apply: (_1, _2, args) => {
          callProxy(path, args);
        },
      });
    };

    return createProxy([]) as ReturnType<Quiver.Client<Server>["client"]>;
  }

  private async handler(message: Message) {
    if (this.provider === undefined) {
      throw new Error("Provider is undefined");
    }

    console.log(
      `CLIENT @${this.provider.signer.address} RECEIVED MESSAGE from ${message.senderAddress}\n`,
      `${message.content}`,
    );

    /* ************************************************************************
     *
     * RECV_MESSAGE
     *
     * ***********************************************************************/

    let received: Quiver.Response = {
      message,
    };

    /* ************************************************************************
     *
     * PARSE_URL
     *
     * ***********************************************************************/

    const url = parseQuiverUrl(received.message);

    if (!url.ok) {
      throw new Error(JSON.stringify(received, null, 2));
    }

    received.url = url.value;

    if (received.url === undefined) {
      throw new Error(JSON.stringify(received, null, 2));
    }

    /* ************************************************************************
     *
     * PARSE_JSON
     *
     * ***********************************************************************/

    try {
      received.json = JSON.parse(String(received.message.content));
    } catch (error) {
      throw new Error(JSON.stringify(received, null, 2));
    }

    if (received.json === undefined) {
      throw new Error(JSON.stringify(received, null, 2));
    }

    /* ************************************************************************
     *
     * PARSE_RESPONSE
     *
     * ************************************************************************/

    const response = parseQuiverResponse(received.json);

    if (!response.ok) {
      throw new Error(JSON.stringify(received, null, 2));
    }

    received.response = response.value;

    if (received.response === undefined) {
      throw new Error(JSON.stringify(received, null, 2));
    }

    /* ************************************************************************
     *
     * GET_REQUEST
     *
     * ***********************************************************************/

    const request = this.pending.get(received.response.id);

    if (request === undefined) {
      throw new Error(`Request not found`);
    }

    /* ************************************************************************
     *
     * MIDDLEWARE
     *
     * ***********************************************************************/

    // TODO

    /* ************************************************************************
     *
     * RESOLVE REQUEST
     *
     * ***********************************************************************/

    if (received.response === undefined) {
      throw new Error(`Response not found`);
    }

    request(received.response);

    /* ************************************************************************
     *
     * FINALLY
     *
     * ***********************************************************************/
  }
}

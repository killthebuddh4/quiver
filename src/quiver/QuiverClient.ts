import { QuiverApiSpec } from "../types/QuiverApiSpec.js";
import { QuiverRequest } from "../types/QuiverRequest.js";
import { QuiverHandler } from "../types/QuiverHandler.js";
import { QuiverFunction } from "../types/QuiverFunction.js";
import { Fig } from "../types/Fig.js";
import { QuiverClientResolve } from "../types/QuiverClientResolve.js";

type QuiverFunctionInput<F extends QuiverFunction<any, any>> = F extends (
  input: infer I,
) => any
  ? I
  : never;

export class QuiverClient<Api extends QuiverApiSpec> {
  private fig?: Fig;
  private middleware: QuiverHandler<any, any>[] = [];
  private requests: Map<string, QuiverClientResolve> = new Map();
  private router: {
    address: string;
    namespace: string;
  };
  private api?: Api;

  public constructor(address: string, namespace: string) {
    this.router = { address, namespace };
  }

  private conversationId() {
    if (this.fig === undefined) {
      throw new Error("Client hasn't been bound to Quiver yet");
    }

    return `quiver/0.0.1/requests/${this.fig.address}/${this.router.namespace}/${name}`;
  }

  public use(api: Api) {
    this.api = api;

    const client = {} as QuiverClient<typeof this.api>;

    for (const name of Object.keys(this.api)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any)[name] = async (
        input: QuiverFunctionInput<(typeof this.api)[typeof name]>,
      ) => {
        if (this.fig === undefined) {
          throw new Error("Client hasn't been bound to Quiver yet");
        }

        const req: QuiverRequest = {
          function: name,
          arguments: input,
        };

        let content;
        try {
          content = JSON.stringify(req);
        } catch {
          throw new Error(
            `Failed to serialize request to ${this.conversationId()}`,
          );
        }

        const message = await this.fig.publish({
          conversation: {
            peerAddress: this.router.address,
            context: {
              conversationId: this.conversationId(),
              metadata: {},
            },
          },
          content,
        });

        return new Promise((resolve) => {
          this.requests.set(message.id, resolve);
        });
      };
    }

    return client;
  }
}

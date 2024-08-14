import { z } from "zod";

//
//
// TODO Pull these types into their own files in /types
//
//

/* ***********************************************************
 *
 * TRANSPORT
 *
 * ***********************************************************/

export const brpcRequestSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  payload: z.unknown(),
});

export type BrpcRequest = z.infer<typeof brpcRequestSchema>;

export const brpcResponseSchema = z.object({
  id: z.string().uuid(),
  payload: z.unknown(),
});

export type BrpcResponse = z.infer<typeof brpcResponseSchema>;

/* ***********************************************************
 *
 * PROCEDURE, CLIENT, API
 *
 * ***********************************************************/

export type BrpcProcedure<
  I extends z.ZodTypeAny = any,
  O extends z.ZodTypeAny = any,
> = {
  input: I;
  output: O;
  auth: BrpcAuth;
  handler: (i: z.infer<I>, context: BrpcContext) => Promise<z.infer<O>>;
};

export type BrpcApi = {
  [key: string]: BrpcProcedure;
};

export type BrpcClient<A extends BrpcApi> = {
  [K in keyof A]: WrapInBrpcResult<
    RemoveSingleUndefinedArgument<RemoveLastArgument<A[K]["handler"]>>
  >;
};

export type BrpcContext = {
  id: string;
  message: {
    id: string;
    sender: {
      address: string;
    };
  };
};

export type BrpcAuth = ({
  context,
}: {
  context: BrpcContext;
}) => Promise<boolean>;

/* ***********************************************************
 *
 * RETURN VALUES
 *
 * ***********************************************************/

export const brpcErrorSchema = z.object({
  ok: z.literal(false),
  code: z.union([
    z.literal("INPUT_SERIALIZATION_FAILED"),
    z.literal("XMTP_SEND_FAILED"),
    z.literal("XMTP_BROADCAST_FAILED"),
    z.literal("UNKNOWN_PROCEDURE"),
    z.literal("INPUT_TYPE_MISMATCH"),
    z.literal("OUTPUT_TYPE_MISMATCH"),
    z.literal("OUTPUT_SERIALIZATION_FAILED"),
    z.literal("INVALID_RESPONSE"),
    z.literal("INVALID_PAYLOAD"),
    z.literal("UNAUTHORIZED"),
    z.literal("REQUEST_TIMEOUT"),
    z.literal("SERVER_ERROR"),
  ]),
});

export type BrpcError = z.infer<typeof brpcErrorSchema>;

export const brpcSuccessSchema = z.object({
  ok: z.literal(true),
  code: z.literal("SUCCESS"),
  data: z.unknown(),
});

export type BrpcResult<D> = (
  | BrpcError
  | {
      ok: true;
      code: "SUCCESS";
      data: D;
    }
) & {
  request: BrpcRequest;
  response: BrpcResponse | null;
};

/* ***********************************************************
 *
 * HELPERS
 *
 * ***********************************************************/

type PopLast<T extends any[]> = T extends [...infer Rest, any] ? Rest : never;

type RemoveLastArgument<F> = F extends (...args: infer Args) => infer R
  ? (...args: PopLast<Args>) => R
  : never;

type RemoveSingleUndefinedArgument<F> = F extends (
  arg: infer First,
  ...args: infer Rest
) => infer R
  ? First extends undefined
    ? Rest extends []
      ? (...args: Rest) => R
      : F
    : F
  : never;

type WrapInBrpcResult<F> = F extends (...args: infer Args) => infer R
  ? (...args: Args) => Promise<BrpcResult<Awaited<R>>>
  : never;

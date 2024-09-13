export type Actually<T> = T extends { ok: true; value: infer U } ? U : never;

export const parseAny = (x: unknown) => {
  return {
    ok: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: x as any,
  };
};

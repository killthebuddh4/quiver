import q from "./index.js";

const addsUser = q.middleware(() => {
  return {
    user: "test-user",
  };
});

const addsTimestamp = q.middleware(() => {
  return {
    timestamp: Date.now(),
  };
});

const addsIsAdminUser = q.middleware((ctx: { user: string }) => {
  return { isAdminUser: ctx.user === "admin-user" };
});

const addsCanSeeDashboard = q.middleware((ctx: { isAdminUser: boolean }) => {
  return { canSeeDashboard: ctx.isAdminUser };
});

const addsNumerator = q.middleware(() => {
  return { numerator: 1 };
});

const addsDenominator = q.middleware(() => {
  return { denominator: 2 };
});

const addsQuotient = q.middleware(
  (ctx: { numerator: number; denominator: number }) => {
    return {
      ...ctx,
      quotient: ctx.numerator / ctx.denominator,
    };
  },
);

describe.only("middleware.pipe", () => {});

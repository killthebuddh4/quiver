type QuiverFunction<Ctx, I, O> = (i: I, ctx: Ctx) => O;

type QuiverMiddleware<CtxIn, CtxOut> = {
  use: (ctx: CtxIn) => CtxOut;
};

type QuiverRoute<CtxIn, CtxOut> = {
  middleware: QuiverMiddleware<CtxIn, CtxOut>;
  fn: QuiverFunction<any, CtxOut, any>;
};

type QuiverRouter<CtxIn, CtxOut> = {
  middleware: QuiverMiddleware<CtxIn, CtxOut>;
  routes: {
    [key: string]:
      | QuiverRouter<CtxOut, any>
      | QuiverRoute<CtxOut, any>
      | QuiverFunction<CtxOut, any, any>;
  };
};

/*

This is like my spec.

logged

{
  public: {
    describe: //
    join: //
}

admin: {
  destroy: //
}

members: {
  post: //
}

*/

const middleware = <CtxIn extends Record<string, any>, CtxOut extends CtxIn>(
  use: (ctx: CtxIn) => CtxOut,
) => {
  const p = <Next extends CtxOut>(next: QuiverMiddleware<CtxOut, Next>) => {
    return middleware((ctx: CtxIn) => {
      return next.use(use(ctx));
    });
  };

  return {
    use,
    pipe: p,
  };
};

const pipe = <
  CtxIn extends Record<string, any>,
  CtxOut extends CtxIn,
  Next extends CtxOut,
>(
  mw: QuiverMiddleware<CtxIn, CtxOut>,
  next: QuiverMiddleware<CtxOut, Next>,
) => {
  return middleware((ctx: CtxIn) => {
    return next.use(mw.use(ctx));
  });
};

const join = (i: undefined, ctx: { user: string }) => {
  console.log(`${ctx.user} joined`);
};

const describe = (i: { id: string }) => {
  console.log(`describing ${i.id}`);
};

const destroy = (i: { id: string }, ctx: { user: string }) => {
  console.log(`${ctx.user} destroying ${i.id}`);
};

const post = (i: { id: string; message: string }, ctx: { user: string }) => {
  console.log(`${ctx.user} posting ${i.message} to ${i.id}`);
};

const user = middleware((ctx) => {
  return {
    ...ctx,
    user: "test-user-1",
    x: false,
  };
});

const pass = middleware((ctx: { x: number }) => {
  return {
    ...ctx,
    pass: true,
    user: "test-user-2",
  };
});

// const p = user.pipe;
const u = user.use;
const p = pass.use;

pipe(user, pass);

user.pipe(pass);

const app = router(user);

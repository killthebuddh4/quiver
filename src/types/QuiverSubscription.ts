export type QuiverSubscription = {
  unsubscribe: () => Promise<void> | void;
};

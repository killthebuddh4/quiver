export type Topic = {
  peerAddress: string;
  context: {
    conversationId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: Record<string, string>;
  };
};

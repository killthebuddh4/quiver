export type Conversation = {
  peerAddress: string;
  context?: {
    conversationId: string;
    metadata: Record<string, string>;
  };
};

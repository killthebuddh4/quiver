export type Message = {
  id: string;
  conversation: {
    peerAddress: string;
    context?: {
      conversationId: string;
      metadata: {};
    };
  };
  senderAddress: string;
  sent: Date;
  content: unknown;
};

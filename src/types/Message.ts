export type Message = {
  id: string;
  conversation: {
    peerAddress: string;
    context?: {
      conversationId: string;
      metadata: unknown;
    };
  };
  senderAddress: string;
  sent: Date;
  content: unknown;
};

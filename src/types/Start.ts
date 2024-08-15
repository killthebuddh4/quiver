export type Start = (args: {
  options?: {
    onCreatingXmtp?: () => void;
    onCreatedXmtp?: () => void;
    onCreateXmtpError?: (error: unknown) => void;
    onStartingStream?: () => void;
    onStartedStream?: () => void;
    onStartStreamError?: (error: unknown) => void;
  };
}) => Promise<void>;

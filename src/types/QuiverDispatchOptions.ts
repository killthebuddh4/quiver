export type QuiverDispatchOptions = {
  onCall?: () => void;
  onReturn?: () => void;
  onThrow?: () => void;
  onSent?: () => void;
  onError?: () => void;
};

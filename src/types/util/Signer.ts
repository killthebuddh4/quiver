export type Signer = {
  address: string;
  getAddress: () => Promise<string>;
  signMessage: (message: string) => Promise<string>;
};

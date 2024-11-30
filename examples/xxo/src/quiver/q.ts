import quiver from "@qrpc/quiver";

const xmtp = quiver.x({
  logs: {
    pubsub: {
      onPublishing: (args) => {
        console.log("onPublishing", args);
      },
      onPublishError: (content, error) => {
        console.log("onPublishError", content, error);
      },
    },
    handle: {
      onMessage: (args) => {
        console.log("onMessage", args);
      },
    },
  },
});

export const q = quiver.q({ xmtp });

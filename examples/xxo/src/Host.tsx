import { q } from "./quiver/q";

export const Host = () => {
  return (
    <div className="host">
      <h1>{`Host: ${q.address}`}</h1>
    </div>
  );
};

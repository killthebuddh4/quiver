import "./App.css";
import { Host } from "./Host";
import { Challenger } from "./Challenger";

function App() {
  if (window.location.pathname === "/") {
    return <Host />;
  } else {
    return <Challenger />;
  }
}

export default App;

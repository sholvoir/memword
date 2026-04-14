import { render } from "solid-js/web";
import "./components/index.css";
import "./components/icons.css";
import GProvider from "./components/g-provider.tsx";
import Root from "./components/root.tsx";

render(
   () => (
      <GProvider>
         <Root />
      </GProvider>
   ),
   document.getElementById("root")!,
);

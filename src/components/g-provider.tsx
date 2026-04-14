import {
   type Accessor,
   createContext,
   createSignal,
   useContext,
} from "solid-js";
import type { TDial } from "../lib/idial";

interface IGContext {
   tips: Accessor<string | undefined>;
   showTips: (content?: string, autohide?: boolean) => void;
   loca: Accessor<TDial | undefined>;
   go: (d?: TDial) => void;
   loading: Accessor<boolean>;
   showLoading: (loading: boolean) => void;
}

const GContext = createContext<IGContext>();

export default (props: any) => {
   let timeout: number | undefined;
   const [loca, setLoca] = createSignal<TDial>();
   const [tips, setTips] = createSignal<string>();
   const [loading, setLoading] = createSignal(false);
   const showTips = (content?: string, autohide = true) => {
      setTips(content);
      if (autohide) {
         if (timeout) clearTimeout(timeout);
         timeout = setTimeout(setTips, 3000);
      }
   };
   const store: IGContext = {
      tips,
      showTips,
      loca,
      go: setLoca,
      loading,
      showLoading: setLoading,
   };
   return <GContext.Provider value={store}>{props.children}</GContext.Provider>;
};

export const useG = () => useContext(GContext);

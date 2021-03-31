import Editor from "./editor";
import TIMapArray from "../lib/twilightmap";
//import Generator from "../generator/generator";
import "./main.css";
import { MapData } from "../app/models/map";
import { UserData } from "../app/models/user";

interface InitVars {
  map_id: number;
  userData?: UserData;
  mapData?: MapData;
}

type CustomWindow = Window & typeof globalThis & { __INIT__: InitVars };
declare const window: CustomWindow;

const initVars = window.__INIT__ as InitVars;
const urlHashString = document.location.hash.slice(1);

const initial = (() => {
  const md = initVars.mapData;
  if (urlHashString !== undefined && urlHashString != "") {
    const tryURLHashString =
      urlHashString !== undefined
        ? (TIMapArray.fromTTSString(urlHashString) as TIMapArray)
        : undefined;
    if (tryURLHashString && !(tryURLHashString instanceof Error))
      return tryURLHashString;
  }

  const tryInitialMapData =
    md !== undefined && md.versions.length > 0
      ? TIMapArray.fromTTSString(md.versions[md.versions.length - 1])
      : undefined;
  if (tryInitialMapData instanceof Error) {
    console.log(
      "Could not parse initial map data from server into a Twilight Imperium Map"
    );
    return undefined;
  }
  return tryInitialMapData;
})();

const editor = new Editor({
  initial: initial,
  mapData: initVars.mapData,
  userData: initVars.userData,
});

editor.render(document.getElementById("editor-app") as HTMLElement);

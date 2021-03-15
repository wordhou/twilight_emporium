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
let initial = undefined;
const map = initVars.mapData;
if (map) {
  const latest = map.versions[map.versions.length - 1];
  initial = TIMapArray.fromTTSString(latest) as TIMapArray;
}
const editor = new Editor({
  initial: map === undefined ? undefined : initial,
  mapData: initVars.mapData,
  userData: initVars.userData,
});

editor.render(document.getElementById("editor-app") as HTMLElement);

// DEBUG
//

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
const map = initVars.mapData;

const initial =
  map === undefined || map.versions.length === 0
    ? undefined
    : (TIMapArray.fromTTSString(
        map.versions[map.versions.length - 1]
      ) as TIMapArray);

const urlHashString = document.location.hash.slice(1);

const editor = new Editor({
  initial:
    urlHashString !== undefined
      ? (TIMapArray.fromTTSString(urlHashString) as TIMapArray)
      : initial,
  mapData: initVars.mapData,
  userData: initVars.userData,
});

editor.render(document.getElementById("editor-app") as HTMLElement);

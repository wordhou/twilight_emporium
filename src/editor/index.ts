import Editor from "./editor";
import TIMapArray from "../lib/twilightmap";
//import Generator from "../generator/generator";
import "./main.css";

const tts = "28 37 60-2 70-1 61-3 74 75 45 69 0 21 40 65 0 25 77 24 0";

const tm = TIMapArray.fromTTSString(tts) as TIMapArray;

const editor = new Editor({
  initial: tm,
});

editor.render(document.getElementById("editor-app") as HTMLElement);

// DEBUG
//

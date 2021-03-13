import Editor from "./editor";
import $ from "jquery";

export default class Api {
  editor: Editor;
  constructor(editor: Editor) {
    this.editor = editor;
  }

  async save(): Promise<void> {
    const mapData = this.editor.mapData;
    if (mapData.map_id === undefined) {
      return $.ajax(`/api/maps/`, {
        method: "POST",
        data: {
          map_name: mapData.map_name,
          description: mapData.description,
          newVersion: this.editor.current.toTTSString(),
        },
      });
    } else {
      return $.ajax(`/api/maps/${mapData.map_id}/`, {
        method: "PUT",
        data: {
          map_name: mapData.map_name,
          description: mapData.description,
          newVersion: this.editor.current.toTTSString(),
        },
      });
    }
  }
}

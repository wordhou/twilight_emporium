import Editor from "./editor";
import $ from "jquery";

export default class Api {
  editor: Editor;
  constructor(editor: Editor) {
    this.editor = editor;
  }

  canSave(): boolean {
    return (
      this.editor.userData !== undefined &&
      (this.editor.mapData.user_id === this.editor.userData.user_id ||
        this.editor.mapData.user_id === undefined)
    );
  }

  save(): void {
    const mapData = this.editor.mapData;
    if (this.editor.userData === undefined) {
      // TODO send to /auth/ with a redirect to /editor with hash parameters
      return;
    }
    if (mapData.map_id === undefined) {
      console.log(`Saving new map`);
      $.ajax(`/api/maps/`, {
        method: "POST",
        data: {
          dataType: "json",
          user_id: this.editor.userData.user_id,
          map_name: mapData.map_name,
          description: mapData.description,
          newVersion: this.editor.current.toTTSString(),
        },
      })
        .done((data) => {
          this.editor.runState(this.editor.transitions.saveComplete);
          mapData.map_id = data.map_id;
        })
        .fail((data) => {
          this.editor.runState(this.editor.transitions.saveComplete);
          // TODO display save failed
        });
    } else {
      console.log(`Saving map ${mapData.map_id}`);
      $.ajax(`api/maps/${mapData.map_id}/`, {
        method: "PUT",
        data: {
          map_id: mapData.map_id,
          map_name: mapData.map_name,
          description: mapData.description,
          newVersion: this.editor.current.toTTSString(),
        },
      })
        .done((data) => {
          console.log(data.map_id);
          mapData.map_id = data.map_id;
          this.editor.runState(this.editor.transitions.saveComplete);
        })
        .fail((data) => {
          this.editor.runState(this.editor.transitions.saveComplete);
          // TODO display save failed
        });
    }
  }
}

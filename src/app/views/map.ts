//import $ from "jquery";
import attachDeleteMapHandler from "../partials/delete-map";

attachDeleteMapHandler();

document.querySelectorAll(".edit-comment-button").forEach((a) => {
  const i = parseInt((a as HTMLElement).dataset.i as string);
  a.addEventListener("click", () => {
    const comment = document.getElementById(`comment-${i}`);
    comment?.querySelector(".comment-edit")?.classList.toggle("on");
  });
});

const mapNameEditor = document.querySelector(".map-name-editor") as HTMLElement;
document.getElementById("edit-map-name")?.addEventListener("click", () => {
  mapNameEditor.classList.toggle("on");
});

const descriptionEditor = document.querySelector(
  ".description-editor"
) as HTMLElement;
document.getElementById("edit-description")?.addEventListener("click", () => {
  descriptionEditor.classList.toggle("on");
});

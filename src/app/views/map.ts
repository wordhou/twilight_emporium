//import $ from "jquery";

document.querySelectorAll(".edit-comment-button").forEach((a) => {
  const i = parseInt((a as HTMLElement).dataset.i as string);
  a.addEventListener("click", () => {
    const comment = document.getElementById(`comment-${i}`);
    comment?.querySelector(".comment-edit")?.classList.toggle("on");
  });
});

console.log("maps.ts line 11");
document.querySelectorAll("delete-button").forEach((a) => {
  console.log("attaching event handel to delete button");
  const i = parseInt((a as HTMLElement).dataset.i as string);
  const form = document.getElementById(`delete-${i}`) as
    | HTMLFormElement
    | undefined;
  a.addEventListener("click", () => {
    const yes = confirm(`Are you sure you want to delete the map?`);
    if (yes) form?.submit();
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

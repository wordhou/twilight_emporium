function attachDeleteMapHandler(): void {
  document.querySelectorAll(".delete-form").forEach((form) => {
    const a = form.querySelector("button");
    a?.addEventListener("click", () => {
      const yes = confirm(`Are you sure you want to delete the map?`);
      if (yes) (form as HTMLFormElement)?.submit();
    });
  });
}

export default attachDeleteMapHandler;

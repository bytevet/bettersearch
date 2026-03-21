(function() {
  var t = localStorage.getItem("bettersearch-theme");
  if (t === "dark" || (t !== "light" && matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add("dark");
  }
})();

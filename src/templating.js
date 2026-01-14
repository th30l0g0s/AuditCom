export function fillTemplate(template, data) {
  const frag = template.content.cloneNode(true);

  // item text bindings
  frag.querySelectorAll("[data-bind]").forEach(el => {
    const key = el.getAttribute("data-bind");
    el.textContent = data[key] ?? "";
  });

  // item attribute bindings
  frag.querySelectorAll("*").forEach(el => {
    for (const attr of Array.from(el.attributes)) {

      if (!attr.name.startsWith("data-bind-attr-")) continue;
      const realAttr = attr.name.replace("data-bind-attr-", "");
      const key = attr.value;
      const val = data[key];

      if (val == null) el.removeAttribute(realAttr);
      else el.setAttribute(realAttr, val);
    }
  });

  return frag;
}

export function fillGlobals(data) {
  document.querySelectorAll("[data-bind-global]").forEach(el => {
    const key = el.getAttribute("data-bind-global");
    el.textContent = data[key] ?? "";
  });
}

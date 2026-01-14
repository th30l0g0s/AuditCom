export async function loadTemplate(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load template: ${url}`);
  const html = await res.text();

  const doc = new DOMParser().parseFromString(html, "text/html");
  const tpl = doc.querySelector("template");
  if (!tpl) throw new Error(`No <template> in ${url}`);
  return tpl;
}

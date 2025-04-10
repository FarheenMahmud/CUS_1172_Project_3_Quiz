
export async function loadTemplate(name) {
  const res = await fetch(`templates/${name}.handlebars`);
  const src = await res.text();
  return Handlebars.compile(src);
}

// utils.js
export async function loadTemplate(name, context = {}) {
  const res = await fetch(`templates/${name}.handlebars`);
  const src = await res.text();
  const template = Handlebars.compile(src);
  return template(context);
}
export async function loadTemplate(name, data = {}) {
    const src = `/templates/${name}.handlebars`;
    const res = await fetch(src);
    const templateText = await res.text();
    const template = Handlebars.compile(templateText);
    return template(data);
  }
  
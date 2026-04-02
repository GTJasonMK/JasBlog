const ALLOWED_TAGS = new Set([
  "a",
  "abbr",
  "b",
  "blockquote",
  "br",
  "code",
  "del",
  "div",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "span",
  "strong",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
]);

const ALLOWED_ATTRS = new Set([
  "alt",
  "class",
  "href",
  "rel",
  "src",
  "target",
  "title",
]);

const URL_ATTRS = new Set(["href", "src"]);

function isSafeUrl(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;
  if (normalized.startsWith("#") || normalized.startsWith("/")) return true;
  if (normalized.startsWith("http://")) return true;
  if (normalized.startsWith("https://")) return true;
  if (normalized.startsWith("mailto:")) return true;
  if (normalized.startsWith("tel:")) return true;
  return false;
}

export function sanitizeHtml(html: string): string {
  if (!html) return "";

  if (typeof DOMParser === "undefined") {
    let sanitized = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");

    // Remove inline event handlers and inline styles, including unquoted forms.
    sanitized = sanitized.replace(
      /\s(?:on\w+|style)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
      ""
    );

    // Strip unsafe href/src URLs from quoted and unquoted attributes.
    sanitized = sanitized.replace(
      /\s(href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
      (_full, attr: string, doubleQuoted: string, singleQuoted: string, bare: string) => {
        const value = (doubleQuoted ?? singleQuoted ?? bare ?? "").trim();
        if (!isSafeUrl(value)) {
          return "";
        }
        return ` ${attr.toLowerCase()}="${value}"`;
      }
    );

    return sanitized;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild;

  if (!root) return "";

  const toUnwrap: Element[] = [];
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);

  while (walker.nextNode()) {
    const element = walker.currentNode as Element;
    const tag = element.tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      toUnwrap.push(element);
      continue;
    }

    const attrs = Array.from(element.attributes);
    attrs.forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value;

      if (name.startsWith("on") || name === "style") {
        element.removeAttribute(attr.name);
        return;
      }

      if (!ALLOWED_ATTRS.has(name)) {
        element.removeAttribute(attr.name);
        return;
      }

      if (URL_ATTRS.has(name) && !isSafeUrl(value)) {
        element.removeAttribute(attr.name);
      }
    });

    if (tag === "a") {
      const target = element.getAttribute("target");
      if (target === "_blank") {
        const rel = new Set(
          (element.getAttribute("rel") || "")
            .split(/\s+/)
            .map((item) => item.trim())
            .filter(Boolean)
        );
        rel.add("noopener");
        rel.add("noreferrer");
        element.setAttribute("rel", Array.from(rel).join(" "));
      } else {
        element.removeAttribute("target");
      }
    }
  }

  toUnwrap.forEach((node) => {
    node.replaceWith(...Array.from(node.childNodes));
  });

  return root.innerHTML;
}

import { marked } from "marked";

marked.use({
  gfm: true,
  breaks: false,
});

/** Content is authored in-repo (never user input), so no sanitiser is needed. */
export function renderMarkdown(md: string): string {
  const html = marked.parse(md, { async: false });
  return String(html).replace(
    /<a href="/g,
    '<a target="_blank" rel="noopener noreferrer" href="',
  );
}

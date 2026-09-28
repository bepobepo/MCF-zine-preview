# Mooncow Fest 2026 website

A single-file static site for Mooncow Fest 2026 (5–7 June, East Sussex).

# Updates
updates are welcome, please get in touch if you think anything should change.

## MOOWS / CowZine

The first web-edition preview lives at `cowzine.html`. The original submission
portal is preserved at `cowzine-submit.html`.

- `cowzine/issue-01/read/`: all 76 printed pages, rendered to JPEG for on-demand
  loading. Desktop spreads pair even and odd pages; mobile shows one page.
- `cowzine/issue-01/<article>/`: 32 independently shareable pages covering all
  30 contents entries, the adverts, and the closing poem. Original artwork is
  included alongside text, with links back to the printed pages.
- `assets/moows/moows.css` and `reader.js`: shared styling and reader behavior.
- `assets/moows/issue-01/page-01.jpg` through `page-76.jpg`: 1800px page renders.
- `assets/moows/issue-01/images/`: artwork extracted from the high-quality PDF.
- `content/moows/issue-01/articles.json`: the authoritative, editable article
  source. Run `python scripts/build_moows.py` after editing it to rebuild HTML.
  This build uses only Python's standard library.
- `scripts/extract_moows_text.py` and `scripts/extract_moows_images.py`: initial
  PDF extraction helpers (pdfplumber, pypdf and Pillow), run from the repo root.
  Extraction output requires editorial review before updating articles.json;
  it must not overwrite later author revisions.

The text extraction separates columns and English, Portuguese, and Russian
sections. Windows OCR recovered pages 28–29, with the transcription checked
against the scan. OCR was also attempted on the handwritten letter and adverts;
unreliable lettering remains in the original images rather than being guessed.
Photo essays and visual puzzles retain their original artwork. Equations and
Lucy O's illustrated composition include crops from the high-quality page renders.

“Twenty Million Trees” uses the five-page author revision supplied on 2026-09-15,
not the original printed text. Its paragraphs and two scene breaks were checked
against the supplied PDF. Links to printed pages 70, 72 and 74 still open the
original issue; the magazine itself has not been modified.

Run a local static server from the repository root (for example,
`python -m http.server 8080`) and open `/cowzine.html`.

The reader uses images rather than downloading the entire PDF on entry. It offers
side arrows for mouse navigation, keyboard arrows, touch swipes, zoom, fullscreen where supported,
and reduced-motion support. Selectable text remains available in the original PDF
and in the HTML articles. The download and open-PDF links use `assets/cowzine issue 1/Cowzine LQ.pdf`
(38,894,246 bytes, 76 pages). The original high-resolution PDF is retained locally.
This preview does not publish any changes.


### Editing formatting and adding web-only articles

Text in `paragraph`, `heading` and `quote` blocks supports `**bold**`,
`*italic*`, `***bold italic***` and inline code with backticks.
For multiple paragraphs or lists, use a `markdown` block:

```json
{
  "type": "markdown",
  "text": "An opening with **bold** and *italic*.\n\n- First item\n- Second item\n\n1. First step\n2. Second step"
}
```

In JSON strings, `\n` means a line break and `\n\n` separates paragraphs.
This is a small Markdown subset: nested bullet and numbered lists, emphasis,
inline code and links. Tables and raw HTML are not
supported. Continue using `heading` blocks for headings and `image` blocks
for images. Numbered lists start at 1. Titles, descriptions and captions remain
plain text.

For a web-only article, add an object like this to the articles array:

```json
{
  "title": "A new story",
  "slug": "a-new-story",
  "author": "Author name",
  "description": "A short summary for sharing.",
  "pages": [],
  "blocks": [
    {"type": "paragraph", "text": "Welcome to **our new story**."},
    {"type": "markdown", "text": "- First item\n- Second item"}
  ]
}
```

Use a unique slug. Empty or omitted `pages` marks the article as web-only:
no printed-page links or magazine button are generated, and the contents
shows “Web”. Image blocks can omit `page` too; use `src` (a filename in
`assets/moows/issue-01/images/`), `caption`, and optionally `alt`.
The first image is used for sharing; without one, the issue cover is used.
Web-only pieces remain part of the Issue 01 collection.

Run `python scripts/build_moows.py` to apply source changes. Do not edit the
generated article HTML directly, since rebuilding replaces it.

#### Nested lists

Indent child items by four spaces per level inside a `markdown` block.
Bullet and numbered lists can be mixed. For example:

```json
{
  "type": "markdown",
  "text": "- Main item\n    - Child item\n        1. **Nested step**\n        2. Another step\n    - Second child\n- Next main item"
}
```

Keep each item on its own line. Blank lines between items are allowed.
Multiline list-item paragraphs are not supported by this small parser.

#### Links

Use `[link text](https://example.com)` in paragraph, heading, quote or
markdown blocks. Links also work in list items, and link text can use bold
or italic formatting. For example:

```json
{"type": "paragraph", "text": "Visit [**Mooncows**](https://moonco.ws) or [another article](../twenty-million-trees/)."}
```

HTTP, HTTPS, email (`mailto:`), relative paths and `#anchor` links are supported.
Links open in the same tab. Relative paths are resolved from the article's URL.
Inline code stays literal. Link titles and reference-style links are not supported.

### Article design

Article titles use locally hosted Fraunces (open-source Hatton alternative), with
Darker Grotesque body text. Font licenses live alongside the fonts in
`assets/moows/fonts/`. Each article slug seeds a unique, repeatable SVG pattern
with circles, rectangles and rotated semicircles. The builder creates these in
`assets/moows/issue-01/patterns/`. Shared styles are in `article-design.css`;
`article.js` moves the pattern at one quarter scroll speed and respects reduced motion.

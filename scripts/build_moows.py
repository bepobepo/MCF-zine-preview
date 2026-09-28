"""Build the MOOWS article pages from reviewed, editable JSON. No dependencies."""
from pathlib import Path
from html import escape
import json,re,random
ROOT=Path(__file__).resolve().parents[1]
ARTICLES=json.loads((ROOT/'content/moows/issue-01/articles.json').read_text(encoding='utf-8'))
PREFIX='../../../'
def inline_markdown(text, allow_links=True):
 """HTML-escaped links, emphasis and inline code; a small Markdown subset."""
 result=[]; end=0
 pattern=r'`([^`\n]+)`|\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*([^*\n]+)\*'
 if allow_links: pattern+=r'|\[([^]\n]+)\]\(((?:[^\s()]|\([^\s()]*\))+)\)'
 for m in re.finditer(pattern,text):
  result.append(escape(text[end:m.start()]))
  code,both,bold,italic=m.groups()[:4]
  if code is not None: result.append('<code>'+escape(code)+'</code>')
  elif both is not None: result.append('<strong><em>'+escape(both)+'</em></strong>')
  elif bold is not None: result.append('<strong>'+inline_markdown(bold,allow_links)+'</strong>')
  elif italic is not None: result.append('<em>'+inline_markdown(italic,allow_links)+'</em>')
  else:
   label,url=m.groups()[4:]
   scheme=re.match(r'^([a-zA-Z][a-zA-Z0-9+.-]*):',url)
   safe=not any(ord(c)<32 for c in url) and '\\' not in url and (not scheme or scheme[1].lower() in ('http','https','mailto'))
   if safe: result.append('<a href="'+escape(url,quote=True)+'">'+inline_markdown(label,False)+'</a>')
   else: result.append(escape(m[0]))
  end=m.end()
 return ''.join(result)+escape(text[end:])

def markdown_blocks(text):
 """Paragraphs and indentation-based nested lists; raw HTML stays escaped."""
 output=[]; paragraph=[]; stack=[]
 def flush_paragraph():
  if paragraph:
   output.append('<p>'+inline_markdown('\n'.join(paragraph))+'</p>')
   paragraph.clear()
 def close_level():
  _,kind=stack.pop()
  output.append(f'</li></{kind}>')
 def flush_list():
  while stack: close_level()
 for line in text.expandtabs(4).splitlines():
  m=re.match(r'^( *)(?:([-+*])|\d+[.)])\s+(.+)$',line)
  if m:
   flush_paragraph(); indent=len(m[1]); kind='ul' if m[2] else 'ol'
   while stack and indent<stack[-1][0]: close_level()
   if stack and indent==stack[-1][0]:
    if kind==stack[-1][1]: output.append('</li>')
    else: close_level(); output.append(f'<{kind}>'); stack.append((indent,kind))
   else:
    output.append(f'<{kind}>'); stack.append((indent,kind))
   output.append('<li>'+inline_markdown(m[3]))
  elif not line.strip():
   flush_paragraph()
  else:
   flush_list(); paragraph.append(line)
 flush_paragraph(); flush_list()
 return ''.join(output)

def figure(b,first=False):
 src=PREFIX+'assets/moows/issue-01/images/'+b['src'];caption=b['caption']
 print_link=f' · <a href="../read/#page={b["page"]}">View printed page</a>' if b.get('page') else ''
 return f'<figure class="article-figure"><a href="{src}" target="_blank" rel="noopener" aria-label="Enlarge image: {escape(caption)}"><img src="{src}" alt="{escape(b.get("alt",caption))}" loading="{"eager" if first else "lazy"}" decoding="async"></a><figcaption>{escape(caption)}{print_link}</figcaption></figure>'
def render(a,index):
 title=a['title'];desc=a['description'];url='https://moonco.ws/cowzine/issue-01/'+a['slug']+'/'
 pages=a.get('pages',[])
 first_image=next((b for b in a['blocks'] if b['type']=='image'),None)
 social='https://moonco.ws/assets/moows/issue-01/'+('images/'+first_image['src'] if first_image else f'page-{pages[0] if pages else 1:02}.jpg')
 body=[];image_count=0
 for b in a['blocks']:
  if b['type']=='image':body.append(figure(b,image_count==0));image_count+=1;continue
  if b['type']=='break':body.append('<hr class="scene-break" aria-label="Scene break">');continue
  if b['type']=='markdown':body.append(markdown_blocks(b['text']));continue
  tag={'heading':'h2','paragraph':'p','quote':'blockquote'}[b['type']]
  attrs=f' lang="{b["lang"]}"' if b.get('lang') else ''
  if b.get('poetry'):attrs+=' class="verse"'
  t=inline_markdown(b['text'])
  if b.get('poetry') or (b.get('page')==14 and '\n' in b['text']):t=t.replace('\n','<br>')
  body.append(f'<{tag}{attrs}>{t}</{tag}>')
 prev=ARTICLES[index-1] if index>0 else None;following=ARTICLES[index+1] if index+1<len(ARTICLES) else None
 neighbors=''.join(f'<a href="../{x["slug"]}/"><small>{label}</small>{escape(x["title"])}</a>' for x,label in [(prev,'← Previous piece'),(following,'Next piece →')] if x)
 top_neighbors=''.join(f'<a class="button" href="../{x["slug"]}/" title="{escape(x["title"],quote=True)}">{label}</a>' if x else f'<span class="button" aria-disabled="true">{label}</span>' for x,label in [(prev,'← Previous'),(following,'Next →')])
 author=f'<span>{escape(a["author"])}</span> · ' if a['author'] else ''
 labels=', '.join(map(str,pages))
 print_meta=f'<a href="../read/#page={pages[0]}">Printed pages {labels}</a>' if pages else 'Web-only article'
 print_action=f'<a class="button" href="../read/#page={pages[0]}">Read in the magazine ↗</a>' if pages else ''
 return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape(title)} — MOOWS</title>
<meta name="description" content="{escape(desc)}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article"><meta property="og:title" content="{escape(title)}">
<meta property="og:description" content="{escape(desc)}"><meta property="og:url" content="{url}">
<meta property="og:image" content="{social}"><meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="../../../assets/moows/moows.css?v=6">
<link rel="stylesheet" href="../../../assets/moows/article-design.css?v=5">
</head>
<body class="article-page">
<div class="article-background" style="background-image:url('../../../assets/moows/issue-01/patterns/{a["slug"]}.svg?v=4')" aria-hidden="true"></div>
<a class="skip" href="#main">Skip to content</a>
<header><a class="brand" href="../../../cowzine.html">MOOWS</a><nav aria-label="Main navigation"><a href="../../../index.html">The herd</a><a href="../../../cowzine.html#contents">Issue 1</a><a href="../../../cowzine-submit.html">Contribute</a></nav></header>
<main id="main" class="article"><nav class="article-top-nav" aria-label="Article navigation">{top_neighbors}</nav><article>
<p class="eyebrow"><a href="../../../cowzine.html#contents">MOOWS / Issue 01</a> · August 2026</p>
<h1>{escape(title)}</h1>
<p class="article-meta">{author}{print_meta}</p>
<div class="prose">{chr(10).join(body)}</div>
<div class="actions"><a class="button" href="../../../cowzine.html#contents">Back to contents</a>{print_action}<button class="share-article" type="button" hidden>Share this piece ↗</button><span class="share-status" role="status"></span></div>
</article><nav class="article-neighbors" aria-label="Other articles">{neighbors}</nav></main>
<footer>MOOWS / CowZine · By mooncows, for mooncows. <a href="../../../cowzine-submit.html">Make the next issue with us →</a></footer>
<script src="../../../assets/moows/article.js?v=4" defer></script>
</body></html>'''
def article_pattern(slug):
 """Stable random arrangement: each article keeps its own composition."""
 rng=random.Random(slug)
 kinds=['circle','rectangle','semicircle']*6
 rng.shuffle(kinds)
 shapes=[]; y=350
 for i,kind in enumerate(kinds):
  x=rng.randint(220,980)
  if i: y+=rng.randint(680,960)
  radius=rng.randint(65,115)
  if kind=='circle': shape=f'<circle r="{radius}"/>'
  elif kind=='rectangle': shape=f'<rect x="-{radius}" y="-55" width="{radius*2}" height="{rng.randint(90,165)}"/>'
  else: shape=f'<path d="M-{radius} 0a{radius} {radius} 0 0 1 {radius*2} 0Z"/>'
  angle=rng.choice([0,90,180,270])
  shapes.append(f'<g transform="translate({x} {y}) rotate({angle}) scale(2.5)">{shape}</g>')
 height=y+400
 return f'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="{height}" viewBox="0 0 1200 {height}"><g fill="#ECD099">'+''.join(shapes)+'</g></svg>'

def build():
 patterns=ROOT/"assets/moows/issue-01/patterns"
 patterns.mkdir(parents=True,exist_ok=True)
 (patterns/"issue-landing.svg").write_text(article_pattern("issue-01-landing"),encoding="utf-8")
 for a in ARTICLES: (patterns/(a["slug"]+".svg")).write_text(article_pattern(a["slug"]),encoding="utf-8")
 mapping=[{k:a[k] for k in ("title","slug","pages")} for a in ARTICLES if a.get("pages")]
 (ROOT/"assets/moows/issue-01/articles.js").write_text("window.moowsArticles = "+json.dumps(mapping,ensure_ascii=False)+";\n",encoding="utf-8")
 for i,a in enumerate(ARTICLES):
  path=ROOT/'cowzine/issue-01'/a['slug']/'index.html';path.parent.mkdir(parents=True,exist_ok=True);path.write_text(render(a,i),encoding='utf-8')
 landing=ROOT/'cowzine.html';s=landing.read_text(encoding='utf-8')
 entries=[]
 for a in ARTICLES:
  label=a['author'] or ('Photo essay' if a['slug']=='conan' else 'Read online')
  if a['slug']=='love-letter-to-the-woman-that-waits':label='Original handwritten letter'
  number=f'{a["pages"][0]:02}' if a.get('pages') else 'Web'
  entries.append(f'<li><a href="cowzine/issue-01/{a["slug"]}/"><span>{escape(a["title"])}<small>{escape(label)}</small></span><span class="number">{number}</span></a></li>')
 s=re.sub(r'<ol class="contents">.*?</ol>','<ol class="contents">\n'+'\n'.join(entries)+'\n</ol>',s,flags=re.S)
 s=s.replace('Start with the editors’ letters in our web edition, or explore every piece in the original magazine.','Read each piece on its own page, with photographs and illustrations from the printed issue. Or flip through the magazine just as it was made.').replace('30 pieces · One herd','Stories, art & more · One herd').replace('moows.css?v=2','moows.css?v=6')
 landing.write_text(s,encoding='utf-8')
 print(f'Built {len(ARTICLES)} article pages and linked the full contents.')
 

if __name__ == "__main__":
 build()

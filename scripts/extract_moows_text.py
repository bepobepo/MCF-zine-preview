"""Extract MOOWS text using reviewed page regions. Run once per source revision.
The generated JSON is the editable article source; build_moows.py publishes HTML.
"""
from pathlib import Path
from statistics import median
import json,re,pdfplumber
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'content/moows/issue-01'
# PDF points, in reading order. This avoids interleaving newspaper columns.
REGIONS={
10:[(0,0,312,790),(312,0,595,790)],11:[(0,0,295,790),(295,150,595,790)],
15:[(40,124,350,240),(355,205,580,443),(300,443,580,515),(40,670,580,785)],
17:[(35,40,210,790),(210,40,380,790),(380,40,580,790)],
20:[(30,120,297,790),(297,120,570,790)],
22:[(45,310,215,480),(215,310,380,480),(380,310,555,480)],23:[(35,70,225,590)],
30:[(20,275,298,790),(298,275,580,790)],32:[(45,120,300,790),(300,120,570,790)],
33:[(35,125,570,245),(30,295,220,475),(390,610,575,780)],
38:[(0,0,595,292),(45,295,300,505),(310,460,575,505),(0,505,595,795)],
39:[(0,0,595,160),(45,160,330,355),(335,280,575,340),(0,355,595,810)],
43:[(40,25,305,790),(305,25,575,790)],
47:[(65,35,575,158),(65,165,245,760),(245,165,405,760),(405,165,575,790)],
55:[(45,155,430,358),(45,365,236,790),(236,365,430,790)],
58:[(45,580,215,795),(215,580,380,795),(380,580,550,795)],
59:[(45,580,215,795),(215,580,380,795),(380,580,550,795)],
60:[(45,580,215,795),(215,580,380,795),(380,580,550,795)],
62:[(45,100,300,795),(300,150,585,795)],
65:[(45,0,565,115),(45,145,300,300),(310,145,555,300),(45,330,300,455),(310,330,555,455),(45,475,300,620),(310,475,555,620),(45,635,300,780)],
66:[(45,440,565,790)],69:[(0,740,595,842)],
}
SKIP={1,2,3,4,5,12,16,19,21,25,26,27,28,29,35,40,41,42,48,54,61,64,68,71,73,75}
POETRY={8,13,18,30,33,76}
def extract(page,n,box,language=None):
 page=page.crop(box,strict=False).dedupe_chars(tolerance=0.6)
 if language:
  def allowed(c):
   if c['object_type']!='char':return True
   color=c.get('non_stroking_color');gold=isinstance(color,tuple) and len(color)==3 and color[0]>.8 and color[1]>.6
   return ('GlacialIndifference' in c.get('fontname','')) and (gold if language=='pt' else not gold)
  page=page.filter(allowed)
 lines=page.extract_text_lines(x_tolerance=1,y_tolerance=2,return_chars=True)
 blocks=[];current=None;previous=None
 for line in lines:
  text=line['text'].strip()
  if not text or (text==str(n) and line['top']>750):continue
  size=median([c['size'] for c in line['chars']])
  bold=sum('Bold' in c.get('fontname','') for c in line['chars'])>len(line['chars'])*.7
  heading=(size>18 or (bold and len(text)<85)) and n not in POETRY
  kind='heading' if heading else 'paragraph'
  gap=line['top']-previous['bottom'] if previous else 999
  # Layout blank lines and short, completed lines delimit paragraphs.
  break_here=not current or current['type']!=kind or gap>max(3,size*.7)
  if previous and current and kind=='paragraph':
   prevtext=previous['text'].strip()
   if re.match(r'^(?:[IP]:|\d+[.)]\s|[•●])',text):break_here=True
   if previous['x1'] < box[2]-25 and re.search(r'[.!?…:][”\"’\']?$',prevtext):break_here=True
  if break_here:
   current={'type':kind,'text':text,'page':n}
   if language:current['lang']=language
   blocks.append(current)
  else:
   sep='\n' if n in POETRY else ('' if current['text'].endswith('-') else ' ')
   current['text']+=sep+text
  previous=line
 return blocks
pages={}
with pdfplumber.open(ROOT/'assets/cowzine issue 1/Cowzine.pdf') as pdf:
 for n,p in enumerate(pdf.pages,1):
  if n in SKIP:continue
  regions=REGIONS.get(n,[(0,0,595,842)])
  if n in [22,23]:
   pages[str(n)]=[b for lang in ['en','pt'] for box in regions for b in extract(p,n,box,lang)]
  else:
   pages[str(n)]=[]
   for idx,box in enumerate(regions):
    blocks=extract(p,n,box)
    if n in [58,59,60,62]:
     for b in blocks:b['lang']=(['ru','en','pt'] if n!=62 else ['ru','en'])[idx]
    pages[str(n)]+=blocks
(OUT/'extracted-pages.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')
# Human-readable extraction for editorial checking.
(ROOT/'tmp/pdfs/review.txt').write_text('\n\n'.join(f'PAGE {n}\n'+ '\n\n'.join(b['text'] for b in bs) for n,bs in pages.items()),encoding='utf-8')
print('Extracted',len(pages),'pages in reading order')


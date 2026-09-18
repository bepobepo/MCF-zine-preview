"""Extract original PDF artwork, composite transparency on white, and size for web."""
from pypdf import PdfReader
from pathlib import Path
from PIL import Image,ImageDraw
import hashlib,json
Path('tmp/pdfs').mkdir(parents=True,exist_ok=True)
pdf=PdfReader('assets/cowzine issue 1/Cowzine.pdf');out=Path('assets/moows/issue-01/images');out.mkdir(exist_ok=True)
records={};seen={}
for n,page in enumerate(pdf.pages,1):
 records[str(n)]=[]
 for i,img in enumerate(page.images):
  im=img.image
  if min(im.size)<60:continue
  key=hashlib.sha256(img.data).hexdigest()
  if key not in seen:
   name=f'p{n:02}-{i+1:02}.jpg';seen[key]=name
   
   if im.mode == 'RGBA':
    base=Image.new('RGBA',im.size,'white');base.alpha_composite(im);im=base.convert('RGB')
   else:im=im.convert('RGB')
   im.thumbnail((2400,2400));im.save(out/name,quality=90,optimize=True)
  name=seen[key]
  if name not in records[str(n)]:records[str(n)].append(name)
Path('tmp/pdfs/images.json').write_text(json.dumps(records,indent=2))
print('Extracted',len(seen),'distinct images')
for start in range(6,77,12):
 entries=[(n,f) for n in range(start,min(start+12,77)) for f in records[str(n)]]
 sheet=Image.new('RGB',(1000,((len(entries)+4)//5)*160),'#ddd');d=ImageDraw.Draw(sheet)
 for k,(n,f) in enumerate(entries):
  im=Image.open(out/f);im.thumbnail((190,130));x=(k%5)*200;y=(k//5)*160
  sheet.paste(im,(x,y+25));d.text((x,y),f'{n}: {f}',fill='black')
 sheet.save(f'tmp/pdfs/images-{start}.jpg')

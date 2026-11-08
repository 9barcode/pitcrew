"""Import generated uniform atlases without resizing per-frame character art."""
import sys,json
from pathlib import Path
from PIL import Image
name,source=sys.argv[1:3]
im=Image.open(source).convert('RGBA')
# Encoding only; no background removal or retouching.
out=Path(f'assets/characters/{name}/service-v2.webp')
im.save(out,'WEBP',quality=95,method=6)
w,h=im.size;cw,ch=w/4,h/2
meta={'image':str(out),'frames':[{'x':(i%4)*cw,'y':(i//4)*ch,'w':cw,'h':ch} for i in range(8)],'fps':8,'clips':{'idle':[0]*22+[1,0],'ready':[0,1,2],'job_start':[0,1,2],'job_loop':[2,3,4,5],'job_finish':[6,7],'success':[7,0]},'pivot':[.5,1]}
Path(f'assets/characters/{name}/service-v2.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
print(name,im.size,'webp bytes',out.stat().st_size)

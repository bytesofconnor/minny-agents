import re,base64,os
os.chdir('out'); h=open('index.html').read()
css=''.join(open('.'+p).read() for p in re.findall(r'href="(/_next/static/css/[^"]+\.css)"',h))
css=re.sub(r'url\((/_next/static/media/[^)]+\.woff2)\)',lambda m:'url(data:font/woff2;base64,'+base64.b64encode(open('.'+m.group(1),'rb').read()).decode()+')',css)
for pat in [r'<link[^>]*rel="stylesheet"[^>]*>',r'<link[^>]*rel="preload"[^>]*>',r'<link[^>]*(favicon|\.ico)[^>]*>']: h=re.sub(pat,'',h)
h=re.sub(r'<script[^>]*>.*?</script>','',h,flags=re.S).replace('</head>','<style>'+css+'</style></head>',1)
open('/workspace/nb_index.html','w').write(h); print(len(h))

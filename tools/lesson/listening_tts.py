# Audio đề nghe tự viết bằng Kokoro (giọng Mỹ chất lượng cao, không bóp chậm giọng).
# python3 listening_tts.py <tempo> <out.mp3> <lines.txt>
#   tempo 1 = tốc độ thật · 0.75 = bản chậm (atempo chỉ kéo lời thoại)
# lines.txt: `#P|n` = bắt đầu Part n (chọn tốc độ chuẩn) · `N|` người dẫn · mã người nói (bảng VOICES) · `PAUSE|giây`
#   `PAUSE|FINAL` = khoảng kiểm tra cuối, tự kéo để cả file đủ TOTAL giây (env TOTAL, mặc định 0 = 120").
# Tốc độ chuẩn đạt bằng khoảng nghỉ giữa câu / lượt (giọng giữ speed ≥ 0.9); in từ/phút đo được từng Part.
import sherpa_onnx, numpy as np, soundfile as sf, sys, re, subprocess, os, tempfile, hashlib, json
M=os.environ.get('KOKORO','/home/claude/kokoro-multi-lang-v1_0')
tts=sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
 model=f'{M}/model.onnx',voices=f'{M}/voices.bin',tokens=f'{M}/tokens.txt',data_dir=f'{M}/espeak-ng-data',lexicon=f'{M}/lexicon-us-en.txt',lang='en-us'),num_threads=os.cpu_count() or 2)))
# Chỉ giọng Mỹ hạng cao của Kokoro. Nữ: af_heart 3 (A) · af_bella 2 (A-) · af_nicole 6 (B-). Nam: am_michael 16 · am_fenrir 14 · am_puck 18 (C+, tốt nhất của giọng nam).
# CẤM: giọng Anh (bf_/bm_) và giọng Mỹ hạng thấp: am_adam 11, am_liam 15, am_echo 12, am_eric 13, am_onyx 17, am_santa 19, af_jessica 4, af_river 8, af_sky 10.
VOICES={'N':9,'H':3,'K':16,'F':2,'M':14,'G':18,'W':3,'L':16,'I':2,'O':18,'R':14}
SPEED=float(os.environ.get('SPEED','0.92')); assert SPEED>=0.9, 'speed < 0.9 làm méo giọng'
TARGET={0:(130,140),1:(130,140),2:(140,146),3:(145,152),4:(150,158)}
TEMPO=float(sys.argv[1]); OUT=sys.argv[2]; LINES=sys.argv[3] if len(sys.argv)>3 else 'lines.txt'
TOTAL=float(os.environ.get('TOTAL','0'))
U='zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
def num(n):
    n=int(n); return U[n] if n<20 else {2:'twenty',3:'thirty',4:'forty'}[n//10]+('' if n%10==0 else '-'+U[n%10])
os.makedirs('.tts_cache',exist_ok=True); sr=24000
def gen(s,sid,sp):
    h='.tts_cache/'+hashlib.md5(f'{sid}|{sp}|{s}'.encode()).hexdigest()+'.npy'
    if os.path.exists(h): return np.load(h)
    a=tts.generate(s,sid=sid,speed=sp); x=np.array(a.samples,np.float32); np.save(h,x); return x
def stretch(s):
    if TEMPO==1: return s
    d=tempfile.mkdtemp(); a=os.path.join(d,'a.wav'); b=os.path.join(d,'b.wav')
    sf.write(a,s,sr); subprocess.run(['ffmpeg','-loglevel','error','-y','-i',a,'-filter:a',f'atempo={TEMPO}',b],check=True)
    return sf.read(b,dtype='float32')[0]
items=[]; part=0
for l in open(LINES,encoding='utf-8'):
    l=l.rstrip('\n')
    if not l.strip(): continue
    k,txt=l.split('|',1)
    if k=='#P': part=int(txt); continue
    if k=='PAUSE': items.append(('P',part,txt,None)); continue
    if k=='N': items.append((k,part,txt,[gen(re.sub(r'\d+',lambda m:num(m.group()),txt),VOICES['N'],0.92)])); continue
    items.append((k,part,txt,[stretch(gen(s,VOICES[k],SPEED)) for s in re.split(r'(?<=[.?!])\s+',txt)]))
G={}
for p in sorted({it[1] for it in items}):
    sp=[it for it in items if it[1]==p and it[0] not in('N','P')]
    if not sp: continue
    lo,hi=TARGET.get(p,TARGET[0]); words=sum(len(it[2].split()) for it in sp)
    speech=sum(len(s)/sr for it in sp for s in it[3]); ns=sum(len(it[3])-1 for it in sp); nt=len(sp)-1
    need=words/((lo+hi)/2*TEMPO)*60-speech
    G[p]=min(1.3,max(0.35,(need-0.35*nt)/max(ns+nt,1)))
out=[]; t=0; prev=None; first={}; last={}; W={}; marks=[]
def add(x):
    global t; out.append(x); t+=len(x)/sr
for k,p,txt,segs in items:
    if k=='P':
        d=(max(120,TOTAL-t-5) if TOTAL else 120) if txt=='FINAL' else float(txt)
        add(np.zeros(int(sr*d),np.float32)); prev='P'; continue
    if k=='N':
        if prev not in(None,'P'): add(np.zeros(int(sr*0.8),np.float32))
        marks.append((t,k,txt)); add(segs[0]); add(np.zeros(int(sr*0.8),np.float32)); prev='N'; continue
    g=G[p]
    if prev not in('N','P',None): add(np.zeros(int(sr*(g+0.35)),np.float32))
    first.setdefault(p,t); marks.append((t,k,txt))
    for i,s in enumerate(segs):
        if i: add(np.zeros(int(sr*g),np.float32))
        add(s)
    last[p]=t; W[p]=W.get(p,0)+len(txt.split()); prev=k
w=np.concatenate(out); w=w/np.abs(w).max()*0.9
tmp=tempfile.mktemp(suffix='.wav'); sf.write(tmp,w,sr)
subprocess.run(['ffmpeg','-loglevel','error','-y','-i',tmp,'-ac','1','-b:a',os.environ.get('BITRATE','48k'),OUT],check=True)
for p in first: print('Part',p,'wpm',round(W[p]/(last[p]-first[p])*60))
print('total %d:%02d'%(t//60,t%60))
for m in marks: print('%d:%02d'%(m[0]//60,m[0]%60),m[1],m[2][:40])
if os.environ.get('MARKS'): json.dump([[round(a,2),b,c] for a,b,c in marks],open(os.environ['MARKS'],'w'),ensure_ascii=False)

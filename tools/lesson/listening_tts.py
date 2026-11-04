import sherpa_onnx, numpy as np, soundfile as sf, sys, re, subprocess, os, tempfile
M=os.environ.get('KOKORO','/home/claude/kokoro-multi-lang-v1_0')
tts=sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
 model=f'{M}/model.onnx',voices=f'{M}/voices.bin',tokens=f'{M}/tokens.txt',data_dir=f'{M}/espeak-ng-data',lexicon=f'{M}/lexicon-us-en.txt',lang='en-us'),num_threads=4)))
V={'N':9,'H':3,'K':16}; KS=0.72; TEMPO=float(sys.argv[1]); OUT=sys.argv[2]
sr=24000; out=[]; spk=0; words=0; marks=[]; t=0.0
def stretch(s):
    if TEMPO==1: return s
    d=tempfile.mkdtemp(); a=os.path.join(d,'a.wav'); b=os.path.join(d,'b.wav')
    sf.write(a,s,sr); subprocess.run(['ffmpeg','-loglevel','error','-y','-i',a,'-filter:a',f'atempo={TEMPO}',b],check=True)
    x,_=sf.read(b,dtype='float32'); return x
LINES = sys.argv[3] if len(sys.argv) > 3 else 'lines.txt'
for l in open(LINES):
    k,txt=l.rstrip('\n').split('|',1)
    if k=='PAUSE':
        z=np.zeros(int(sr*float(txt)),np.float32); out.append(z); t+=len(z)/sr; continue
    a=tts.generate(txt,sid=V[k],speed=0.9 if k=='N' else KS); sr=a.sample_rate
    s=np.array(a.samples,np.float32)
    if k!='N': s=stretch(s); spk+=len(s)/sr; words+=len(txt.split()); marks.append((round(t),k,txt[:30]))
    out.append(s); t+=len(s)/sr
    g=np.zeros(int(sr*0.5),np.float32); out.append(g); t+=0.5
w=np.concatenate(out); w=w/np.abs(w).max()*0.9
sf.write('tmp.wav',w,sr)
subprocess.run(['ffmpeg','-loglevel','error','-y','-i','tmp.wav','-ac','1','-b:a','48k',OUT],check=True)
print('wpm',round(words/spk*60),'total',round(len(w)/sr,1))
for m in marks: print('%d:%02d'%(m[0]//60,m[0]%60),m[1],m[2])

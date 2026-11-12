import sherpa_onnx, numpy as np, soundfile as sf, json, subprocess, re, sys
M='/home/claude/kokoro-multi-lang-v1_0'
tts=sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
 model=f'{M}/model.onnx',voices=f'{M}/voices.bin',tokens=f'{M}/tokens.txt',data_dir=f'{M}/espeak-ng-data',lexicon=f'{M}/lexicon-us-en.txt',lang='en-us'),num_threads=4)))
V=json.load(open('vocab.json'))
def say(text,out,speed=0.85):
    a=tts.generate(text,sid=2,speed=speed); s=np.array(a.samples,np.float32)
    s=np.concatenate([np.zeros(2400,np.float32),s,np.zeros(4800,np.float32)])
    sf.write('t.wav',s/np.abs(s).max()*0.9,a.sample_rate)
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i','t.wav','-ac','1','-b:a','40k',out],check=True)
for v in V:
    w=re.sub(r'\(.*?\)','',v['w']).replace('sb','someone').strip()
    say(f"{w}. {v['ex']}",f"aud/w{v['n']:02d}.mp3")
print('ok')

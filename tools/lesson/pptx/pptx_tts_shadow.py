import sherpa_onnx, numpy as np, soundfile as sf, subprocess, re
M='/home/claude/kokoro-multi-lang-v1_0'
tts=sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
 model=f'{M}/model.onnx',voices=f'{M}/voices.bin',tokens=f'{M}/tokens.txt',data_dir=f'{M}/espeak-ng-data',lexicon=f'{M}/lexicon-us-en.txt',lang='en-us'),num_threads=4)))
S=["During my internship, I usually skip breakfast and grab a quick bite near the office.",
"But last month, I started to cook for myself.",
"On Sundays, I buy fresh vegetables, some eggs and a bit of chicken, and I pack a lunch for the whole week.",
"It's healthier, and it saves me a lot of money.",
"My favorite dish is my mom's fried rice.",
"The recipe is simple, but it tastes like home.",
"Honestly, I feel really proud when my coworkers ask me for the recipe!"]
def gen(t,sp):
    a=tts.generate(t,sid=2,speed=sp); return np.array(a.samples,np.float32),a.sample_rate
def mp3(s,sr,out):
    sf.write('t.wav',s/np.abs(s).max()*0.9,sr); subprocess.run(['ffmpeg','-loglevel','error','-y','-i','t.wav','-ac','1','-b:a','48k',out],check=True)
full=[];slow=[]
for i,t in enumerate(S,1):
    s,sr=gen(t,0.85); mp3(np.concatenate([np.zeros(2400,np.float32),s,np.zeros(6000,np.float32)]),sr,f'aud/sh{i}.mp3')
    f,sr=gen(t,0.95); full+= [f,np.zeros(int(sr*0.6),np.float32)]
mp3(np.concatenate(full),sr,'aud/shadow_full.mp3')
print('ok')

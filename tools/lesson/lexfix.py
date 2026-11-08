import re, sys
M='/home/claude/kokoro-multi-lang-v1_0/lexicon-us-en.txt'
lex={}
for l in open(M,encoding='utf-8'):
    p=l.rstrip('\n').split(' ',1)
    if len(p)==2: lex.setdefault(p[0].lower(),p[1])
manual={'kevin':'k ˈ ɛ v ə n','hannah':'h ˈ æ n ə','quy':'k w ˈ i','nhon':'n j ˈ ɑ n',
 'activities':'æ k t ˈ ɪ v ə ɾ i z','bottles':'b ˈ ɑ ɾ ə l z','that\'s':'ð ˈ æ t s','webber':'w ˈ ɛ b ə ɹ','what\'s':'w ˌ ʌ t s','wanted':'w ˈ ɑ n t ə d',
 'roommates':'ɹ ˈ u m m ˌ A t s','sundays':'s ˈ ʌ n d ˌ A z','nang':'n ˈ ɑ ŋ','da':'d ˈ ɑ','hoi':'h ˈ ɔ I','tet':'t ˈ ɛ t'}
VL=set('p t k f θ'.split()); SIB=set('s z ʃ ʒ ʧ ʤ'.split())
def derive(w):
    if w in manual: return manual[w]
    cands=[]
    if w.endswith('ies'): cands.append((w[:-3]+'y','z'))
    if w.endswith('es'): cands.append((w[:-2],'es'))
    if w.endswith('s'): cands.append((w[:-1],'s'))
    if w.endswith('ied'): cands.append((w[:-3]+'y','d'))
    if w.endswith('ed'): cands += [(w[:-2],'ed'),(w[:-1],'ed'),(w[:-3],'ed')]
    if w.endswith('ing'): cands += [(w[:-3],'ing'),(w[:-3]+'e','ing'),(w[:-4],'ing')]
    for b,suf in cands:
        if b in lex:
            ph=lex[b]; last=ph.split()[-1]
            if suf in('s','es','z'):
                add='ə z' if last in SIB else ('s' if last in VL else 'z')
            elif suf in('ed','d'):
                add='ə d' if last in ('t','d','ɾ') else ('t' if last in VL|SIB-{'z','ʒ','ʤ'} else 'd')
            else: add='ɪ ŋ'
            return ph+' '+add
    return None
text=open(sys.argv[1],encoding='utf-8').read()
text=re.sub(r"[‿/'ˈ=+!*\[\]]"," ",text.replace("’","'"))
words={w.lower().strip("'") for w in re.findall(r"[A-Za-z][A-Za-z']*",text)}
miss=[w for w in sorted(words) if w not in lex and w not in ("s",)]
added,fail=[],[]
with open(M,'a',encoding='utf-8') as f:
    for w in miss:
        p=derive(w)
        if p: f.write(f'{w} {p}\n'); added.append(w)
        else: fail.append(w)
print('added',added); print('FAIL',fail)

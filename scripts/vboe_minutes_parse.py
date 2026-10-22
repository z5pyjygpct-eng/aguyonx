import re,sys
HON=r'(Mr|Mrs|Ms|Dr|St|No|Va|U\.S)'
def clean_lines(s):
    out=[]
    for l in s.split('\n'):
        l=l.strip()
        if l in ('D','R','AF','T','DRAFT','A','F','RA','DR','AFT','RAF','FT') or re.fullmatch(r'\d+',l) or not l: 
            if not l: out.append('')
            continue
        out.append(l)
    return out
def is_head(l):
    return bool(re.match(r'^([A-Z])\.\s+[A-Z0-9]',l)) and not re.match(r'^(Dr|Mr|Mrs|Ms)\.',l) and len(l)<220
def parse(f):
    lines=clean_lines(open(f).read())
    blocks=[];sec=None;head=None;buf=[];agenda=[]
    def flush():
        nonlocal buf
        t=' '.join(x for x in buf if x)
        if t.strip(): blocks.append((sec,head,re.sub(r'\s+',' ',t)))
        buf=[]
    i=0
    while i<len(lines):
        l=lines[i]
        if not l: i+=1; continue
        if is_head(l):
            flush(); title=l[3:].strip()
            while i+1<len(lines) and lines[i+1] and not is_head(lines[i+1]) and not lines[i+1].isupper() and not re.match(r'^(Dr|Mr|Mrs|Ms|The|This|President|Jim|[A-Z][a-z]+ [A-Z][a-z]+,)',lines[i+1]) and len(title)<260:
                title+=' '+lines[i+1]; i+=1
            head=(l[0],title); agenda.append((sec,l[0],title))
        elif l.isupper() and len(l)>4 and not l.startswith('•') and not re.search(r'COMMONWEALTH|RICHMOND|BOARD OF EDUCATION$',l):
            flush(); sec=l.title().replace("'S","'s"); head=None
        else: buf.append(l)
        i+=1
    flush()
    decs=[]
    for sec,head,txt in blocks:
        t=re.sub(HON+r'\.',r'\1<DOT>',txt)
        t=t.replace('•',' • ')
        sents=[x.replace('<DOT>','.').strip() for x in re.split(r'(?<=[.])\s+(?=[A-Z•])',t)]
        j=0
        while j<len(sents):
            se=sents[j]
            if re.search(r'\b(made a motion|motioned|moved to|moved that|motion to)\b',se,re.I) and not re.search(r'certify by roll',se,re.I):
                parts=[se]; k=j+1
                done=bool(re.search(r'carried|failed',se,re.I))
                while k<len(sents) and not re.search(r'\b(made a motion|motioned|moved to|moved that)\b',sents[k],re.I) and (re.search(r'second|carried|failed|voted|abstain|roll|aye|nay|•|accepted|unanim|nominat',sents[k],re.I) or (not done and k-j<=4)):
                    parts.append(sents[k]); done=done or bool(re.search(r'carried|failed',sents[k],re.I)); k+=1
                decs.append({'sec':sec,'item':head[0] if head else None,'title':head[1] if head else None,'text':' '.join(parts)})
                j=k
            elif re.search(r'\b(was carried|carried unanimously|motion failed)\b',se,re.I) and not re.match(r'(The|This) motion was (properly )?seconded',se):
                decs.append({'sec':sec,'item':head[0] if head else None,'title':head[1] if head else None,'text':se}); j+=1
            else: j+=1
    return agenda,decs,blocks
if __name__=='__main__':
    a,d,_=parse(sys.argv[1])
    for x in a: print('AG',x)
    for x in d: print('MO',x['sec'],x['item'],'|',x['text'][:400])

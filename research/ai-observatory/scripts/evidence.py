"""Signal's dependency-free evidence validator and transactional SQL compiler.

The research agent reads sources through authorized tools, emits a JSON packet,
then runs this compiler. SQL is sent through the authorized database connector.
No credentials, network calls, model calls or public posting are hidden here.
"""
import argparse
import hashlib
import json
import math
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

METHOD = 'signal-evidence-v1'
ORDER = ['runs','sources','source_checks','documents','document_versions','claims','claim_evidence','observations','reports','report_claims','social_drafts']
FIELDS = {
 'runs':'id started_at cutoff finished_at status method_version counts notes',
 'sources':'id name url domain kind access_method priority cadence_days status rights_policy notes',
 'source_checks':'run_id source_id checked_at outcome documents_found detail',
 'documents':'id source_id canonical_url title published_at date_precision first_seen_at last_seen_at topics origin_group',
 'document_versions':'id document_id run_id retrieved_at summary content_sha256 hash_scope access_status',
 'claims':'id statement topic entity epistemic_status availability created_at supersedes_id rationale',
 'claim_evidence':'claim_id version_id relation locator',
 'observations':'id version_id entity metric value unit observed_at effective_at basis comparison_key conditions method_version numerator denominator',
 'reports':'id run_id title body_md method_version cutoff status disclosure limitations',
 'report_claims':'report_id claim_id',
 'social_drafts':'id report_id platform persona format hook body hypothesis status',
}
JSON_FIELDS={'counts','conditions'}
ARRAY_FIELDS={'topics'}
REQUIRED={
 'runs':'id started_at cutoff status method_version',
 'sources':'id name url domain kind access_method priority cadence_days',
 'source_checks':'run_id source_id checked_at outcome',
 'documents':'id source_id canonical_url title date_precision first_seen_at last_seen_at origin_group',
 'document_versions':'id document_id run_id retrieved_at summary content_sha256 access_status',
 'claims':'id statement topic entity epistemic_status availability created_at rationale',
 'claim_evidence':'claim_id version_id relation locator',
 'observations':'id version_id entity metric value unit observed_at basis comparison_key conditions method_version',
 'reports':'id run_id title body_md method_version cutoff status disclosure limitations',
 'report_claims':'report_id claim_id',
 'social_drafts':'id report_id platform persona format hook body hypothesis status',
}

def canonical_url(raw):
 p=urlsplit(raw)
 if p.scheme!='https' or not p.hostname or p.username or p.password:
  raise ValueError('Public HTTPS URLs without credentials required')
 if p.hostname in ('localhost','127.0.0.1','::1'):
  raise ValueError('Local URLs are not source evidence')
 query=[(k,v) for k,v in parse_qsl(p.query,keep_blank_values=True) if not k.lower().startswith('utm_') and k.lower() not in ('fbclid','gclid')]
 return urlunsplit(('https',p.netloc.lower(),p.path or '/',urlencode(sorted(query)),''))

def stable_id(prefix,value):
 return prefix+'_'+hashlib.sha256(value.encode()).hexdigest()[:24]

def timestamp(s):
 d=datetime.fromisoformat(s.replace('Z','+00:00'))
 if d.tzinfo is None: raise ValueError('Timestamps require an explicit timezone')
 return d

def validate(packet):
 if packet.get('method_version')!=METHOD: raise ValueError('Unsupported method version')
 if set(packet)-set(ORDER)-{'method_version'}: raise ValueError('Unknown packet section')
 now=datetime.now(timezone.utc)
 for table in ORDER:
  rows=packet.get(table,[])
  if not isinstance(rows,list): raise ValueError('Rows must be a list')
  for row in rows:
   if not isinstance(row,dict) or set(row)-set(FIELDS[table].split()): raise ValueError('Unknown fields in '+table)
   for field in REQUIRED[table].split():
    if field not in row or row[field] is None or row[field]=='': raise ValueError(table+' requires '+field)
   for key,value in row.items():
    if key.endswith('_at') or key=='cutoff':
     if value is not None:
      d=timestamp(value)
      if key!='effective_at' and d>now: raise ValueError('Future observation/retrieval is not allowed')
    if key in ('url','canonical_url'): canonical_url(value)
    if isinstance(value,float) and not math.isfinite(value): raise ValueError('Nonfinite numbers are invalid')
   if table=='document_versions':
    if len(row['summary'])>6000: raise ValueError('Summary too long')
    if row.get('hash_scope','original_summary')=='original_summary' and hashlib.sha256(row['summary'].encode()).hexdigest()!=row['content_sha256']: raise ValueError('Summary hash mismatch')
   if table=='documents':
    if (row.get('published_at') is None)!=(row['date_precision']=='unknown'): raise ValueError('Publication date precision mismatch')
   if table=='observations':
    if isinstance(row['value'],bool) or not isinstance(row['value'],(int,float)): raise ValueError('Observation must be numeric')
    if not row['conditions']: raise ValueError('Metric conditions cannot be empty')
    if row.get('denominator') is not None and row['denominator']<=0: raise ValueError('Denominator must be positive')
   if table in ('reports','social_drafts') and row['status'] not in ('draft','held'): raise ValueError('Ingest cannot approve or publish')
 claims={r['id'] for r in packet.get('claims',[])}
 supported={r['claim_id'] for r in packet.get('claim_evidence',[]) if r['relation']=='supports'}
 if not claims<=supported: raise ValueError('Every new claim requires supporting evidence')
 return packet

def literal(v,key=''):
 if v is None:return 'NULL'
 if key in JSON_FIELDS:return "'"+json.dumps(v,allow_nan=False).replace("'","''")+"'::jsonb"
 if key in ARRAY_FIELDS:
  if not isinstance(v,list) or any(not isinstance(x,str) for x in v):raise ValueError('String array required')
  return 'ARRAY['+','.join(literal(x) for x in v)+']::text[]'
 if isinstance(v,bool):return 'true' if v else 'false'
 if isinstance(v,(int,float)):
  if not math.isfinite(v):raise ValueError('Finite number required')
  return str(v)
 if not isinstance(v,str):raise ValueError('Unsupported field type')
 if '\x00' in v:raise ValueError('NUL is invalid')
 return "'"+v.replace("'","''")+"'"

def compile_sql(packet):
 validate(packet)
 statements=['BEGIN;','SET LOCAL standard_conforming_strings = on;']
 for table in ORDER:
  for row in packet.get(table,[]):
   columns=list(row)
   statement='INSERT INTO ai_research.'+table+' ('+','.join(columns)+') VALUES ('+','.join(literal(row[k],k) for k in columns)+')'
   if table=='runs': statement+=' ON CONFLICT (id) DO UPDATE SET status=excluded.status,finished_at=excluded.finished_at,counts=excluded.counts,notes=excluded.notes WHERE ai_research.runs.cutoff=excluded.cutoff AND ai_research.runs.method_version=excluded.method_version'
   elif table=='documents': statement+=' ON CONFLICT (id) DO UPDATE SET last_seen_at=greatest(ai_research.documents.last_seen_at,excluded.last_seen_at)'
   else:statement+=' ON CONFLICT DO NOTHING'
   statements.append(statement+';')
 statements.append('COMMIT;')
 return '\n'.join(statements)+'\n'

def brier(probabilities,outcomes):
 if len(probabilities)!=len(outcomes) or not probabilities:raise ValueError('Matched nonempty outcomes required')
 if any(not 0<=p<=1 for p in probabilities) or any(type(y)!=int or y not in (0,1) for y in outcomes):raise ValueError('Invalid probability/outcome')
 return sum((p-y)**2 for p,y in zip(probabilities,outcomes))/len(outcomes)

def matched_change(previous,current,min_documents=5,min_domains=3):
 """Input domain -> (topic documents, all eligible documents); descriptive only."""
 for window in (previous,current):
  for topic,total in window.values():
   if type(topic)!=int or type(total)!=int or total<0 or not 0<=topic<=total:raise ValueError('Invalid document counts')
 matched=sorted(d for d in previous.keys()&current.keys() if previous[d][1]>=min_documents and current[d][1]>=min_documents)
 totals=[sum(v[1] for v in w.values()) for w in (previous,current)]
 n=[sum(w[d][1] for d in matched) for w in (previous,current)]
 retention=[n[i]/totals[i] if totals[i] else 0 for i in (0,1)]
 if len(matched)<min_domains or min(n)<20 or min(retention)<.7:return {'status':'hold','reason':'thin_or_changed_cohort','domains':matched,'retention':retention}
 hits=[sum(w[d][0] for d in matched) for w in (previous,current)]
 if min(hits)<5:return {'status':'hold','reason':'too_few_topic_matches'}
 pooled=100*(hits[1]/n[1]-hits[0]/n[0])
 balanced=100*sum(current[d][0]/current[d][1]-previous[d][0]/previous[d][1] for d in matched)/len(matched)
 return {'status':'hold' if pooled*balanced<0 else 'descriptive_candidate','pooled_change_pp':pooled,'source_balanced_change_pp':balanced,'topic_counts':hits,'denominators':n,'domains':matched,'retention':retention,'unit':'deduplicated documents; not adoption or market share'}

if __name__=='__main__':
 parser=argparse.ArgumentParser()
 parser.add_argument('packet');parser.add_argument('--sql',required=True)
 args=parser.parse_args()
 sql=compile_sql(json.loads(Path(args.packet).read_text()))
 Path(args.sql).write_text(sql)
 print(json.dumps({'validated':True,'sql_path':args.sql,'method':METHOD}))

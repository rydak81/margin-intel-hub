"""Create the initial source registry and a small, explicitly reviewed evidence packet."""
import json,hashlib
from datetime import datetime,timezone
from pathlib import Path
from evidence import stable_id,canonical_url,METHOD
ROOT=Path(__file__).parents[1]
NOW=datetime.now(timezone.utc).isoformat()
RUN='signal-bootstrap-2026-11-07'
registry=[
('openai','OpenAI','https://openai.com/news/','primary',1,1),
('anthropic','Anthropic','https://www.anthropic.com/news','primary',1,1),
('google','Google AI','https://blog.google/innovation-and-ai/','primary',1,1),
('deepmind','Google DeepMind','https://deepmind.google/discover/blog/','primary',1,2),
('meta','Meta AI','https://ai.meta.com/blog/','primary',1,2),
('mistral','Mistral','https://mistral.ai/news','primary',1,2),
('xai','xAI','https://x.ai/news','primary',1,2),
('deepseek','DeepSeek pricing and documentation','https://api-docs.deepseek.com/quick_start/pricing/','primary',1,1),
('qwen','Qwen model releases','https://huggingface.co/Qwen','code',1,2),
('moonshot','Moonshot model releases','https://huggingface.co/moonshotai','code',1,2),
('zai','Z.ai model releases','https://huggingface.co/zai-org','code',1,2),
('amazon','Amazon announcements','https://www.aboutamazon.com/news/','primary',1,1),
('walmart','Walmart corporate news','https://corporate.walmart.com/news','primary',1,2),
('tiktok','TikTok Shop Academy','https://seller-us.tiktok.com/university/home','primary',1,2),
('shopify','Shopify engineering and product news','https://www.shopify.com/news','primary',1,2),
('nvidia','NVIDIA developer news','https://developer.nvidia.com/blog/','primary',2,3),
('arxiv','arXiv AI papers','https://arxiv.org/list/cs.AI/recent','paper',1,1),
('openreview','OpenReview','https://openreview.net/','paper',2,7),
('hf-papers','Hugging Face papers','https://huggingface.co/papers','paper',2,2),
('artificial-analysis','Artificial Analysis','https://artificialanalysis.ai/','benchmark',1,2),
('arena','Arena evaluations','https://arena.ai/','benchmark',2,3),
('metr','METR evaluations','https://metr.org/blog/','benchmark',1,3),
('stanford','Stanford AI Index','https://hai.stanford.edu/ai-index','dataset',2,14),
('epoch','Epoch AI','https://epoch.ai/','dataset',2,7),
('hf-models','Hugging Face models','https://huggingface.co/models','code',2,3),
('github','GitHub AI repositories','https://github.com/topics/artificial-intelligence','code',2,3),
('hn','Hacker News','https://news.ycombinator.com/','forum',2,2),
('reddit-local','Reddit LocalLLaMA','https://www.reddit.com/r/LocalLLaMA/','forum',2,3),
('reddit-ml','Reddit MachineLearning','https://www.reddit.com/r/MachineLearning/','forum',2,3),
('simon','Simon Willison','https://simonwillison.net/','expert',2,2),
('mollick','One Useful Thing','https://www.oneusefulthing.org/','expert',2,3),
('latent','Latent Space','https://www.latent.space/','expert',2,3),
('rundown','The Rundown AI','https://www.therundown.ai/','news',3,3),
('reuters','Reuters technology','https://www.reuters.com/technology/','news',2,2),
('linkedin','LinkedIn product and feed guidance','https://news.linkedin.com/','platform',2,14),
('youtube','YouTube creator guidance','https://support.google.com/youtube/','platform',2,14),
]
sources=[]
for key,name,url,kind,priority,cadence in registry:
 from urllib.parse import urlsplit
 sources.append(dict(id=key,name=name,url=url,domain=urlsplit(url).hostname,kind=kind,access_method='web',priority=priority,cadence_days=cadence,status='candidate',notes='Registered discovery target; access and current terms must be verified before ingestion. Forum material is anecdotal.'))
packet={'method_version':METHOD,'runs':[dict(id=RUN,started_at=NOW,cutoff=NOW,finished_at=NOW,status='complete',method_version=METHOD,counts={'registry_sources':len(sources)},notes='Curated bootstrap using primary pages reviewed in this session; not a complete industry census or historical trend baseline.')],'sources':sources,'documents':[],'document_versions':[],'claims':[],'claim_evidence':[],'observations':[],'source_checks':[],'reports':[],'report_claims':[],'social_drafts':[]}
docs=[
('amazon','https://www.aboutamazon.com/news/retail/alexa-for-shopping-text-to-shop','Alexa for Shopping text rollout','2026-11-06','agentic_commerce','Amazon','Amazon is initially offering shopping by text to an invited subset of US customers and plans wider access in coming weeks.','invitation'),
('amazon','https://www.aboutamazon.com/news/retail/amazon-shop-direct-merchant-workspace','Shop Direct Merchant Workspace','2026-11-04','agentic_commerce','Amazon','Eligible merchants can use a free self-service workspace to connect their own stores to Shop Direct. Existing Amazon sellers may qualify for selection they do not sell on Amazon.','general'),
('google','https://cloud.google.com/blog/products/ai-machine-learning/gemini-omni-1-2-flash-generally-available','Gemini Omni 1.2 Flash GA','2026-11-05','creative_models','Gemini Omni 1.2 Flash','Google documents general availability, clips up to 15 seconds and 720p generation at USD 0.07 per second. Audio references require allowlisting.','general'),
('google','https://blog.google/products-and-platforms/products/workspace/omni-1-2-flash-google-vids/','Google Vids free video allowance','2026-11-05','creative_models','Google Vids','Google says Google-account users can generate up to three 15-second videos per month in Vids without payment.','general'),
('openai','https://openai.com/index/introducing-images-2-6/','Images 2.6','2026-11-04','creative_models','Images 2.6','OpenAI announces Images 2.6, GIF creation and improved editing consistency; the company reports 50 percent faster image generation. This is a vendor claim.','general'),
('tiktok','https://seller-us.tiktok.com/university/essay?knowledge_id=2829401964726023','Getting BFCM-Ready with Seller AI','2026-11-04','business_agents','TikTok Shop Seller AI','TikTok Shop describes shop-specific product recommendations, content assistance and LIVE diagnostics for BFCM preparation. Available agents vary by shop.','unknown'),
('deepseek','https://api-docs.deepseek.com/quick_start/pricing/','DeepSeek API pricing',None,'model_economics','DeepSeek V4.1 Flash 1017','DeepSeek lists Flash input/output pricing that varies by peak and off-peak time. Flash supports image input; the listed V4 Pro API does not.','general'),
('anthropic','https://platform.claude.com/docs/en/models/overview','Claude model overview',None,'model_economics','Claude Sonnet 5.5','Anthropic lists Sonnet 5.5 at USD 2 per million input tokens and USD 10 per million output tokens, and positions it as a balanced speed/intelligence model.','general'),
('linkedin','https://news.linkedin.com/2026/ImprovingTheFeed','LinkedIn feed changes','2026-03-12','publishing','LinkedIn','LinkedIn says it is reducing repetitive low-substance content, engagement bait and inauthentic engagement while improving professional relevance.','not_applicable'),
]
version_by_entity={}
for source,url,title,date,topic,entity,summary,availability in docs:
 url=canonical_url(url);did=stable_id('doc',url);sha=hashlib.sha256(summary.encode()).hexdigest();vid=stable_id('ver',did+sha);cid=stable_id('claim',vid+summary)
 packet['documents'].append(dict(id=did,source_id=source,canonical_url=url,title=title,published_at=date+'T00:00:00+00:00' if date else None,date_precision='day' if date else 'unknown',first_seen_at=NOW,last_seen_at=NOW,topics=[topic],origin_group=did))
 packet['document_versions'].append(dict(id=vid,document_id=did,run_id=RUN,retrieved_at=NOW,summary=summary,content_sha256=sha,access_status='read'))
 packet['claims'].append(dict(id=cid,statement=summary,topic=topic,entity=entity,epistemic_status='vendor_claim',availability=availability,created_at=NOW,rationale='Verified as the provider’s published statement; independent performance or adoption is not established.'))
 packet['claim_evidence'].append(dict(claim_id=cid,version_id=vid,relation='supports',locator=title+' — announcement body / specifications'))
 version_by_entity[entity]=vid
for source in sources:
 n=sum(d['source_id']==source['id'] for d in packet['documents'])
 if n:
  source['status']='active';source['notes']='Primary linked document(s) read during bootstrap. Continue checking source health.'
  packet['source_checks'].append(dict(run_id=RUN,source_id=source['id'],checked_at=NOW,outcome='ok',documents_found=n,detail='Curated primary-document review; not an exhaustive feed scan.'))
measurements=[
('Gemini Omni 1.2 Flash','video_price',.07,'USD/second','720p_standard',{'resolution':'720p','revisions_included':False,'audio_reference_access':'allowlist'},'published_price'),
('Gemini Omni 1.2 Flash','maximum_clip_duration',15,'seconds','native_generation',{'provider_documented':True},'vendor_reported'),
('Google Vids','free_monthly_video_allowance',3,'videos/month','google_account_free',{'maximum_seconds_per_video':15},'vendor_reported'),
('DeepSeek V4.1 Flash 1017','input_token_price',.30,'USD/million_tokens','standard_peak_cache_miss',{'time_tier':'peak','cache':'miss'},'published_price'),
('DeepSeek V4.1 Flash 1017','output_token_price',1.20,'USD/million_tokens','standard_peak',{'time_tier':'peak'},'published_price'),
('Claude Sonnet 5.5','input_token_price',2,'USD/million_tokens','standard',{'batch':False,'cache_discount':False},'published_price'),
('Claude Sonnet 5.5','output_token_price',10,'USD/million_tokens','standard',{'batch':False,'cache_discount':False},'published_price'),
]
for entity,metric,value,unit,key,conditions,basis in measurements:
 packet['observations'].append(dict(id=stable_id('obs',entity+metric+key+NOW),version_id=version_by_entity[entity],entity=entity,metric=metric,value=value,unit=unit,observed_at=NOW,basis=basis,comparison_key=key,conditions=conditions,method_version=METHOD))
rid='signal-brief-2026-11-07'
body='''# The AI commerce shift: distribution and creative economics

The first evidence set points to two practical questions: where will AI-mediated shopping send customers, and how cheaply can a seller test accurate creative?

Amazon’s text-shopping invitation rollout and Shop Direct workspace address discovery and purchase. Google’s Omni release and Vids allowance address creative production. These announcements describe access and capabilities; they do not establish seller revenue lift.

For a merchant, the immediate experiment is a small, profitable assortment with accurate product attributes, followed by a controlled creative test. Track contribution per visitor and cost per approved asset. Keep shipping, returns and commissions in the calculation.

At Google’s stated USD 0.07 per second, one 15-second 720p generation has a USD 1.05 generation charge. That excludes revisions, other services and human review. It is not a complete production-cost estimate.

The database starts with nine documents and seven numeric observations. There is no longitudinal baseline yet. Do not infer growth rates, forecast adoption, or compare benchmarks from this bootstrap. Price changes will become measurable after comparable subsequent observations.

Next research questions: which channels are generally available rather than invitation-only; how API prices change under identical billing conditions; whether independent tests reproduce vendor claims; which seller workflows produce measured operating value.
'''
packet['reports'].append(dict(id=rid,run_id=RUN,title='The AI commerce shift: distribution and creative economics',body_md=body,method_version=METHOD,cutoff=NOW,status='draft',disclosure='AI-assisted research by Signal, created for Ryan Dacus. No individual human-review attestation.',limitations='Purposive nine-document bootstrap; provider statements; no measured adoption, seller outcomes or longitudinal trend.'))
packet['report_claims']=[dict(report_id=rid,claim_id=c['id']) for c in packet['claims']]
packet['social_drafts'].append(dict(id=rid+'-linkedin',report_id=rid,platform='linkedin',persona='Ryan Dacus — The AI Operator',format='evidence_brief',hook='An AI demo can be impressive. The business question is what changes after the demo.',body='Amazon is testing shopping by text and expanding a route for eligible merchants’ own catalogs. Google has introduced 15-second video generation with a limited free allowance in Vids.\n\nMy research desk is tracking three things: what is available, what it costs, and what independent evidence supports it.\n\nFor sellers, the practical test is narrow: one proven product, three creative angles, and contribution per visitor as the outcome.\n\nI’m building a dated evidence library so we can compare these changes over time. This first snapshot establishes a baseline; it does not establish adoption or revenue lift.\n\nAI-assisted research: Signal. Sources accompany the briefing.',hypothesis='A concrete business decision with transparent evidence will attract qualified operator engagement.',status='draft'))
packet['runs'][0]['counts'].update(documents=len(docs),claims=len(packet['claims']),observations=len(measurements),reports=1,social_drafts=1)
(ROOT/'data/sources.json').write_text(json.dumps(sources,indent=2)+'\n')
(ROOT/'data/bootstrap.json').write_text(json.dumps(packet,indent=2)+'\n')
print(json.dumps(packet['runs'][0]['counts']))

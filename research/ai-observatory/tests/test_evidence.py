import importlib.util, unittest, math
from pathlib import Path
spec=importlib.util.spec_from_file_location('evidence',Path(__file__).parents[1]/'scripts/evidence.py')
e=importlib.util.module_from_spec(spec);spec.loader.exec_module(e)
class EvidenceTests(unittest.TestCase):
 def test_tracking_removed_not_semantics(self):
  self.assertEqual(e.canonical_url('https://example.org/x?model=v2&utm_source=a#top'),'https://example.org/x?model=v2')
 def test_credentials_rejected(self):
  with self.assertRaises(ValueError):e.canonical_url('https://u:p@example.org')
 def test_sql_quotes_are_data(self):
  self.assertEqual(e.literal("'); DROP TABLE reports;--"),"'''); DROP TABLE reports;--'")
 def test_unapproved_table_rejected(self):
  with self.assertRaises(ValueError):e.validate({'method_version':e.METHOD,'subscribers':[]})
 def test_nan_rejected(self):
  with self.assertRaises(ValueError):e.literal(math.nan)
 def test_brier_known_result(self):self.assertAlmostEqual(e.brier([.8,.2],[1,0]),.04)
 def test_brier_empty_rejected(self):
  with self.assertRaises(ValueError):e.brier([],[])
 def test_sparse_data_held(self):self.assertEqual(e.matched_change({'a':(1,2)},{'a':(2,3)})['status'],'hold')
 def test_comparable_cohort(self):
  r=e.matched_change({x:(2,10) for x in 'abc'},{x:(4,10) for x in 'abc'})
  self.assertAlmostEqual(r['source_balanced_change_pp'],20);self.assertEqual(r['denominators'],[30,30])
 def test_source_churn_held(self):
  self.assertEqual(e.matched_change({'a':(10,100),'b':(3,10),'c':(3,10)},{'b':(4,10),'c':(4,10),'d':(10,100)})['status'],'hold')
 def test_simpson_reversal_held(self):
  r=e.matched_change({'a':(8,10),'b':(10,100),'c':(10,100)},{'a':(70,100),'b':(0,10),'c':(0,10)})
  self.assertEqual(r['status'],'hold');self.assertGreater(r['pooled_change_pp'],0);self.assertLess(r['source_balanced_change_pp'],0)
 def test_invalid_count_rejected(self):
  with self.assertRaises(ValueError):e.matched_change({'a':(20,10)},{'a':(1,10)})
if __name__=='__main__':unittest.main()

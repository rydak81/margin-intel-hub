-- Standalone SQLite exercise. All amounts are fictional USD cents.
-- One settled campaign cohort. Amounts exclude sales tax. Net receipts are
-- already after discounts and refunds. No unresolved costs in the base case.
WITH lines(line, campaign, net_receipts, variable_cost) AS (
  VALUES ('L1','C1',6400,4200), ('L2','C1',3600,2500)
), campaigns(campaign, spend) AS (VALUES ('C1',2000)),
cases(scenario) AS (VALUES ('complete'),('missing_cost')),
input AS (
  SELECT scenario,line,campaign,net_receipts,
         CASE WHEN scenario='missing_cost' AND line='L2' THEN NULL
              ELSE variable_cost END AS variable_cost
  FROM lines CROSS JOIN cases
), totals AS (
  SELECT scenario,campaign,COUNT(*) AS line_count,
         COUNT(*)-COUNT(variable_cost) AS missing_costs,
         SUM(net_receipts) AS net_receipts,SUM(variable_cost) AS known_costs
  FROM input GROUP BY scenario,campaign
), repeated_spend AS (
  SELECT scenario,campaign,SUM(spend) AS repeated
  FROM input JOIN campaigns USING(campaign) GROUP BY scenario,campaign
)
SELECT scenario,line_count,missing_costs,spend AS campaign_spend_cents,
       CASE WHEN missing_costs=0 THEN net_receipts-known_costs-spend END AS contribution_cents,
       CASE WHEN missing_costs=0 THEN net_receipts-known_costs-repeated END AS erroneous_contribution_cents
FROM totals JOIN campaigns USING(campaign) JOIN repeated_spend USING(scenario,campaign)
ORDER BY scenario;

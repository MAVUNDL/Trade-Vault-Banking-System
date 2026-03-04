-- =================================================================================
-- SEED DATA: VARIED ACCOUNTS (Everyone gets Private Bank Account + Random extras)
-- =================================================================================

-- 1. INSERT ACCOUNTS
INSERT INTO account (account_id, account_number, account_name, reference_name, product_name, kyc_compliant, profile_id, created_at)
VALUES
-- User 1: Alice Smith (3 accounts)
('3353431574710163189580101', '10011425101', 'Ms Smith', 'Ms Smith Main', 'Private Bank Account', true, 'VRD-10163189587401', NOW()),
('3353431574710163189580102', '1100470321101', 'Ms Smith', 'Ms Smith Prime', 'PrimeSaver', true, 'VRD-10163189587401', NOW()),
('3353431574710163189580103', '1100470321102', 'Ms Smith', 'Ms Smith Money Fund', 'MoneyFund Tracker', true, 'VRD-10163189587401', NOW()),

-- User 2: Brandon Lee (2 accounts)
('3353431574710163189580201', '10011425201', 'Mr Lee', 'Mr Lee Main', 'Private Bank Account', true, 'VRD-10163189587402', NOW()),
('3353431574710163189580204', '1100470321203', 'Mr Lee', 'Mr Lee Cash', 'Cash Management Account', true, 'VRD-10163189587402', NOW()),

-- User 3: Chloe Davis (1 account - Just the basics)
('3353431574710163189580301', '10011425301', 'Ms Davis', 'Ms Davis Main', 'Private Bank Account', true, 'VRD-10163189587403', NOW()),

-- User 4: Daniel Craig (2 accounts)
('3353431574710163189580401', '10011425401', 'Mr Craig', 'Mr Craig Main', 'Private Bank Account', true, 'VRD-10163189587404', NOW()),
('3353431574710163189580402', '1100470321401', 'Mr Craig', 'Mr Craig Prime', 'PrimeSaver', true, 'VRD-10163189587404', NOW()),

-- User 5: Evelyn Harper (3 accounts)
('3353431574710163189580501', '10011425501', 'Ms Harper', 'Ms Harper Main', 'Private Bank Account', true, 'VRD-10163189587405', NOW()),
('3353431574710163189580503', '1100470321502', 'Ms Harper', 'Ms Harper Money Fund', 'MoneyFund Tracker', true, 'VRD-10163189587405', NOW()),
('3353431574710163189580504', '1100470321503', 'Ms Harper', 'Ms Harper Cash', 'Cash Management Account', true, 'VRD-10163189587405', NOW()),

-- User 6: Felix Vance (3 accounts)
('3353431574710163189580601', '10011425601', 'Mr Vance', 'Mr Vance Main', 'Private Bank Account', true, 'VRD-10163189587406', NOW()),
('3353431574710163189580602', '1100470321601', 'Mr Vance', 'Mr Vance Prime', 'PrimeSaver', true, 'VRD-10163189587406', NOW()),
('3353431574710163189580604', '1100470321603', 'Mr Vance', 'Mr Vance Cash', 'Cash Management Account', true, 'VRD-10163189587406', NOW()),

-- User 7: Grace Lin (2 accounts)
('3353431574710163189580701', '10011425701', 'Ms Lin', 'Ms Lin Main', 'Private Bank Account', true, 'VRD-10163189587407', NOW()),
('3353431574710163189580703', '1100470321702', 'Ms Lin', 'Ms Lin Money Fund', 'MoneyFund Tracker', true, 'VRD-10163189587407', NOW()),

-- User 8: Henry Cole (1 account - Just the basics)
('3353431574710163189580801', '10011425801', 'Mr Cole', 'Mr Cole Main', 'Private Bank Account', true, 'VRD-10163189587408', NOW()),

-- User 9: Isabella Gomez (4 accounts - Has everything)
('3353431574710163189580901', '10011425901', 'Ms Gomez', 'Ms Gomez Main', 'Private Bank Account', true, 'VRD-10163189587409', NOW()),
('3353431574710163189580902', '1100470321901', 'Ms Gomez', 'Ms Gomez Prime', 'PrimeSaver', true, 'VRD-10163189587409', NOW()),
('3353431574710163189580903', '1100470321902', 'Ms Gomez', 'Ms Gomez Money Fund', 'MoneyFund Tracker', true, 'VRD-10163189587409', NOW()),
('3353431574710163189580904', '1100470321903', 'Ms Gomez', 'Ms Gomez Cash', 'Cash Management Account', true, 'VRD-10163189587409', NOW()),

-- User 10: Jack Fisher (2 accounts)
('3353431574710163189581001', '10011425001', 'Mr Fisher', 'Mr Fisher Main', 'Private Bank Account', true, 'VRD-10163189587410', NOW()),
('3353431574710163189581004', '1100470321003', 'Mr Fisher', 'Mr Fisher Cash', 'Cash Management Account', true, 'VRD-10163189587410', NOW());


-- =================================================================================
-- 2. INSERT ACCOUNT INFORMATION (Balances strictly matching the generated accounts)
-- =================================================================================
INSERT INTO account_information (account_id, current_balance, available_balance, currency, last_updated_at)
VALUES
-- Alice Smith Balances
('3353431574710163189580101', 45890.50, 45890.50, 'ZAR', NOW()),
('3353431574710163189580102', 12500.00, 12500.00, 'ZAR', NOW()),
('3353431574710163189580103', 105000.75, 105000.75, 'ZAR', NOW()),

-- Brandon Lee Balances
('3353431574710163189580201', 28400.00, 28400.00, 'ZAR', NOW()),
('3353431574710163189580204', 1200.50, 1200.50, 'ZAR', NOW()),

-- Chloe Davis Balances
('3353431574710163189580301', 112340.80, 112340.80, 'ZAR', NOW()),

-- Daniel Craig Balances
('3353431574710163189580401', 6750.25, 6750.25, 'ZAR', NOW()),
('3353431574710163189580402', 1500.00, 1500.00, 'ZAR', NOW()),

-- Evelyn Harper Balances
('3353431574710163189580501', 89300.60, 89300.60, 'ZAR', NOW()),
('3353431574710163189580503', 180500.00, 180500.00, 'ZAR', NOW()),
('3353431574710163189580504', 4500.00, 4500.00, 'ZAR', NOW()),

-- Felix Vance Balances
('3353431574710163189580601', 54200.10, 54200.10, 'ZAR', NOW()),
('3353431574710163189580602', 11500.00, 11500.00, 'ZAR', NOW()),
('3353431574710163189580604', 2100.75, 2100.75, 'ZAR', NOW()),

-- Grace Lin Balances
('3353431574710163189580701', 134500.90, 134500.90, 'ZAR', NOW()),
('3353431574710163189580703', 320000.00, 320000.00, 'ZAR', NOW()),

-- Henry Cole Balances
('3353431574710163189580801', 18600.40, 18600.40, 'ZAR', NOW()),

-- Isabella Gomez Balances
('3353431574710163189580901', 76400.25, 76400.25, 'ZAR', NOW()),
('3353431574710163189580902', 18000.00, 18000.00, 'ZAR', NOW()),
('3353431574710163189580903', 95000.00, 95000.00, 'ZAR', NOW()),
('3353431574710163189580904', 3200.50, 3200.50, 'ZAR', NOW()),

-- Jack Fisher Balances
('3353431574710163189581001', 205600.00, 205600.00, 'ZAR', NOW()),
('3353431574710163189581004', 18500.00, 18500.00, 'ZAR', NOW());
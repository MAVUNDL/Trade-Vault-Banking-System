-- =================================================================================
-- SEED DATA: INTERNAL BENEFICIARIES (3 per user, mixed account types)
-- Bank: INVESTEC BANK LIMITED, Code: 580105
-- =================================================================================

INSERT INTO beneficiary (
    beneficiary_id, account_number, code, bank, beneficiary_name,
    last_payment_amount, last_payment_date, cell_no, email_address,
    name, reference_account_number, reference_name, category_id,
    profile_id, faster_payment_allowed, created_at
) VALUES

-- ==========================================
-- User 1: Alice Smith (VRD-10163189587401)
-- ==========================================
('BEN-10163189580101', '1100470321203', '580105', 'INVESTEC BANK LIMITED', '', 1500.0000, '2026-02-15', '', '', 'Brandon Lee Cash Mgt', 'B Lee Savings', 'Alice to Brandon', '10163189587445', 'VRD-10163189587401', true, NOW()),
('BEN-10163189580102', '10011425301', '580105', 'INVESTEC BANK LIMITED', '', 450.0000, '2026-01-20', '', '', 'Chloe Davis Main', 'Dinner Split', 'Alice to Chloe', '10163189587445', 'VRD-10163189587401', true, NOW()),
('BEN-10163189580103', '1100470321401', '580105', 'INVESTEC BANK LIMITED', '', 3000.0000, '2026-02-05', '', '', 'Daniel Craig Prime', 'Project Fund', 'Alice to Dan Prime', '10163189587445', 'VRD-10163189587401', false, NOW()),

-- ==========================================
-- User 2: Brandon Lee (VRD-10163189587402)
-- ==========================================
('BEN-10163189580201', '1100470321102', '580105', 'INVESTEC BANK LIMITED', '', 5000.0000, '2026-02-16', '', '', 'Alice Smith MoneyFund', 'Alice Investment', 'Brandon to Alice Inv', '10163189587445', 'VRD-10163189587402', true, NOW()),
('BEN-10163189580202', '10011425501', '580105', 'INVESTEC BANK LIMITED', '', 800.0000, '2026-01-10', '', '', 'Evelyn Harper Main', 'Concert Tickets', 'Brandon to Evie', '10163189587445', 'VRD-10163189587402', true, NOW()),
('BEN-10163189580203', '1100470321603', '580105', 'INVESTEC BANK LIMITED', '', 1200.0000, '2026-02-10', '', '', 'Felix Vance Cash', 'Felix Deposit', 'Brandon to Felix', '10163189587445', 'VRD-10163189587402', true, NOW()),

-- ==========================================
-- User 3: Chloe Davis (VRD-10163189587403)
-- ==========================================
('BEN-10163189580301', '1100470321702', '580105', 'INVESTEC BANK LIMITED', '', 2500.0000, '2026-02-01', '', '', 'Grace Lin MoneyFund', 'Grace Travel Fund', 'Chloe to Grace', '10163189587445', 'VRD-10163189587403', true, NOW()),
('BEN-10163189580302', '10011425801', '580105', 'INVESTEC BANK LIMITED', '', 500.0000, '2026-02-20', '', '', 'Henry Cole Main', 'Repair Bill', 'Chloe to Henry', '10163189587445', 'VRD-10163189587403', false, NOW()),
('BEN-10163189580303', '1100470321901', '580105', 'INVESTEC BANK LIMITED', '', 1000.0000, '2026-01-15', '', '', 'Isabella PrimeSaver', 'Bella Savings', 'Chloe to Bella', '10163189587445', 'VRD-10163189587403', true, NOW()),

-- ==========================================
-- User 4: Daniel Craig (VRD-10163189587404)
-- ==========================================
('BEN-10163189580401', '1100470321003', '580105', 'INVESTEC BANK LIMITED', '', 950.0000, '2026-01-25', '', '', 'Jack Fisher Cash', 'Jack Cash Acc', 'Dan to Jack', '10163189587445', 'VRD-10163189587404', true, NOW()),
('BEN-10163189580402', '1100470321101', '580105', 'INVESTEC BANK LIMITED', '', 120.0000, '2026-02-18', '', '', 'Alice Smith Prime', 'Alice Prime', 'Dan to Alice Prime', '10163189587445', 'VRD-10163189587404', true, NOW()),
('BEN-10163189580403', '10011425201', '580105', 'INVESTEC BANK LIMITED', '', 450.0000, '2026-02-22', '', '', 'Brandon Lee Main', 'Drinks', 'Dan to Brandon', '10163189587445', 'VRD-10163189587404', true, NOW()),

-- ==========================================
-- User 5: Evelyn Harper (VRD-10163189587405)
-- ==========================================
('BEN-10163189580501', '10011425301', '580105', 'INVESTEC BANK LIMITED', '', 3500.0000, '2026-02-14', '', '', 'Chloe Davis Main', 'Consulting Fee', 'Evelyn to Chloe', '10163189587445', 'VRD-10163189587405', false, NOW()),
('BEN-10163189580502', '1100470321601', '580105', 'INVESTEC BANK LIMITED', '', 6000.0000, '2026-01-30', '', '', 'Felix Vance Prime', 'Felix Prime Acc', 'Evelyn to Felix', '10163189587445', 'VRD-10163189587405', true, NOW()),
('BEN-10163189580503', '10011425701', '580105', 'INVESTEC BANK LIMITED', '', 250.0000, '2026-02-05', '', '', 'Grace Lin Main', 'Gift', 'Evelyn to Grace', '10163189587445', 'VRD-10163189587405', true, NOW()),

-- ==========================================
-- User 6: Felix Vance (VRD-10163189587406)
-- ==========================================
('BEN-10163189580601', '1100470321902', '580105', 'INVESTEC BANK LIMITED', '', 15000.0000, '2026-02-02', '', '', 'Isabella MoneyFund', 'Bella Investment', 'Felix to Bella Inv', '10163189587445', 'VRD-10163189587406', false, NOW()),
('BEN-10163189580602', '10011425001', '580105', 'INVESTEC BANK LIMITED', '', 350.0000, '2026-02-15', '', '', 'Jack Fisher Main', 'Golf Fees', 'Felix to Jack', '10163189587445', 'VRD-10163189587406', true, NOW()),
('BEN-10163189580603', '10011425101', '580105', 'INVESTEC BANK LIMITED', '', 750.0000, '2026-01-28', '', '', 'Alice Smith Main', 'Alice Inv', 'Felix to Alice', '10163189587445', 'VRD-10163189587406', true, NOW()),

-- ==========================================
-- User 7: Grace Lin (VRD-10163189587407)
-- ==========================================
('BEN-10163189580701', '1100470321203', '580105', 'INVESTEC BANK LIMITED', '', 5000.0000, '2026-02-21', '', '', 'Brandon Lee Cash', 'Brandon Tfr', 'Grace to Brandon', '10163189587445', 'VRD-10163189587407', true, NOW()),
('BEN-10163189580702', '1100470321401', '580105', 'INVESTEC BANK LIMITED', '', 1200.0000, '2026-01-18', '', '', 'Daniel Craig Prime', 'Dan Prime', 'Grace to Dan', '10163189587445', 'VRD-10163189587407', true, NOW()),
('BEN-10163189580703', '1100470321503', '580105', 'INVESTEC BANK LIMITED', '', 800.0000, '2026-02-12', '', '', 'Evelyn Harper Cash', 'Evie Cash Acc', 'Grace to Evelyn', '10163189587445', 'VRD-10163189587407', true, NOW()),

-- ==========================================
-- User 8: Henry Cole (VRD-10163189587408)
-- ==========================================
('BEN-10163189580801', '10011425601', '580105', 'INVESTEC BANK LIMITED', '', 4500.0000, '2026-02-10', '', '', 'Felix Vance Main', 'Felix Payment', 'Henry to Felix', '10163189587445', 'VRD-10163189587408', false, NOW()),
('BEN-10163189580802', '1100470321903', '580105', 'INVESTEC BANK LIMITED', '', 1500.0000, '2026-01-25', '', '', 'Isabella Cash Mgt', 'Bella Cash', 'Henry to Bella', '10163189587445', 'VRD-10163189587408', true, NOW()),
('BEN-10163189580803', '1100470321003', '580105', 'INVESTEC BANK LIMITED', '', 2000.0000, '2026-02-18', '', '', 'Jack Fisher Cash', 'Jack Cash', 'Henry to Jack', '10163189587445', 'VRD-10163189587408', true, NOW()),

-- ==========================================
-- User 9: Isabella Gomez (VRD-10163189587409)
-- ==========================================
('BEN-10163189580901', '1100470321102', '580105', 'INVESTEC BANK LIMITED', '', 8500.0000, '2026-02-05', '', '', 'Alice Smith MoneyFund', 'Alice Fund', 'Bella to Alice', '10163189587445', 'VRD-10163189587409', true, NOW()),
('BEN-10163189580902', '10011425301', '580105', 'INVESTEC BANK LIMITED', '', 2200.0000, '2026-01-22', '', '', 'Chloe Davis Main', 'Photoshoot', 'Bella to Chloe', '10163189587445', 'VRD-10163189587409', true, NOW()),
('BEN-10163189580903', '10011425801', '580105', 'INVESTEC BANK LIMITED', '', 500.0000, '2026-02-11', '', '', 'Henry Cole Main', 'Henry Inv', 'Bella to Henry', '10163189587445', 'VRD-10163189587409', true, NOW()),

-- ==========================================
-- User 10: Jack Fisher (VRD-10163189587410)
-- ==========================================
('BEN-10163189581001', '10011425401', '580105', 'INVESTEC BANK LIMITED', '', 12000.0000, '2026-02-08', '', '', 'Daniel Craig Main', 'Monthly Retainer', 'Jack to Dan', '10163189587445', 'VRD-10163189587410', false, NOW()),
('BEN-10163189581002', '1100470321502', '580105', 'INVESTEC BANK LIMITED', '', 5000.0000, '2026-01-28', '', '', 'Evelyn Harper MoneyFund', 'Evie Fund', 'Jack to Evelyn', '10163189587445', 'VRD-10163189587410', true, NOW()),
('BEN-10163189581003', '1100470321702', '580105', 'INVESTEC BANK LIMITED', '', 7500.0000, '2026-02-22', '', '', 'Grace Lin MoneyFund', 'Grace Fund', 'Jack to Grace', '10163189587445', 'VRD-10163189587410', true, NOW());
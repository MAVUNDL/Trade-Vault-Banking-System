

-- Insert funding records dynamically based on the shipments table
INSERT INTO shipment_funding (shipment_number, company_profile_id, funding_required, funding_raised, funding_status)
SELECT
    s.shipment_number,
    c.company_profile_id,

    -- Calculation: Estimated Landed Cost minus Paid Amount
    -- If it's already DELIVERED, no funding is required.
    CASE
        WHEN s.status = 'DELIVERED' THEN 0.0000
        ELSE (s.estimated_landed_cost - s.paid_amount)
        END AS funding_required,

    -- Mock some raised funds so your frontend progress bars aren't empty
    CASE
        WHEN s.status = 'DELIVERED' THEN 0.0000
        WHEN s.status = 'IN_TRANSIT' THEN (s.estimated_landed_cost - s.paid_amount) * 0.45 -- 45% funded
        WHEN s.status = 'SCHEDULED' THEN (s.estimated_landed_cost - s.paid_amount) * 0.10  -- 10% funded
        ELSE 0.0000
        END AS funding_raised,

    -- Status logic
    CASE
        WHEN s.status = 'DELIVERED' THEN 'CLOSED'
        ELSE 'OPEN'
        END AS funding_status

FROM shipments s
         JOIN companies c ON s.customer_name = c.company_name;

select * from shipment_funding;
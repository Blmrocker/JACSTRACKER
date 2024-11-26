-- Add some test inspections with various statuses and dates
INSERT INTO inspections (
    client_id,
    inspection_date,
    location,
    inspector,
    status,
    notes,
    cover_page
)
SELECT 
    c.id,
    -- Generate a mix of past, current, and future dates
    CASE 
        WHEN random() < 0.3 THEN current_date - (random() * 30)::integer
        WHEN random() < 0.6 THEN current_date + (random() * 30)::integer
        ELSE current_date
    END as inspection_date,
    CASE 
        WHEN c.name LIKE '%Hotel%' THEN 'Floor ' || (random() * 15 + 1)::integer
        ELSE 'Main Building'
    END as location,
    CASE 
        WHEN random() < 0.5 THEN 'John Smith'
        WHEN random() < 0.8 THEN 'Maria Rodriguez'
        ELSE 'David Johnson'
    END as inspector,
    CASE 
        WHEN random() < 0.6 THEN 'completed'
        WHEN random() < 0.8 THEN 'scheduled'
        ELSE 'failed'
    END as status,
    CASE 
        WHEN random() < 0.3 THEN 'Regular maintenance inspection'
        WHEN random() < 0.6 THEN 'Annual certification inspection'
        ELSE 'Follow-up inspection'
    END as notes,
    random() < 0.8 as cover_page
FROM 
    clients c
WHERE 
    NOT EXISTS (
        SELECT 1 
        FROM inspections i 
        WHERE i.client_id = c.id 
        AND i.inspection_date > current_date - interval '30 days'
    )
LIMIT 15;

-- Add inspection items for each new inspection
INSERT INTO inspection_items (
    inspection_id,
    item_type,
    floor,
    room,
    equipment_type,
    status,
    notes
)
SELECT 
    i.id,
    'Fire Extinguisher',
    'Floor ' || (random() * 5 + 1)::integer,
    'Room ' || (random() * 100 + 1)::integer,
    CASE 
        WHEN random() < 0.3 THEN '2.5ABC'
        WHEN random() < 0.6 THEN '5ABC'
        WHEN random() < 0.8 THEN '10ABC'
        ELSE '20ABC'
    END,
    CASE 
        WHEN i.status = 'completed' THEN 
            CASE 
                WHEN random() < 0.8 THEN 'pass'
                ELSE 'fail'
            END
        WHEN i.status = 'failed' THEN 'fail'
        ELSE 'pass'
    END,
    CASE 
        WHEN random() < 0.3 THEN 'Needs recharge'
        WHEN random() < 0.6 THEN 'Tag updated'
        ELSE 'Regular maintenance'
    END
FROM 
    inspections i
    CROSS JOIN generate_series(1, (random() * 5 + 3)::integer)
WHERE 
    i.inspection_date >= current_date - interval '30 days'
    AND NOT EXISTS (
        SELECT 1 
        FROM inspection_items ii 
        WHERE ii.inspection_id = i.id
    );
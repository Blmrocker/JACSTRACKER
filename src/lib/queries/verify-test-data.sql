-- First, clear existing data
DELETE FROM inspection_items;
DELETE FROM inspections;

-- Insert a single test inspection first to verify
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
    id as client_id,
    CURRENT_DATE as inspection_date,
    'Test Location' as location,
    'Test Inspector' as inspector,
    'scheduled' as status,
    'Test inspection notes' as notes,
    true as cover_page
FROM clients
LIMIT 1
RETURNING id;

-- Verify inspection was inserted
SELECT 
    i.id,
    i.inspection_date,
    i.location,
    i.inspector,
    i.status,
    i.notes,
    c.name as client_name
FROM 
    inspections i
    JOIN clients c ON i.client_id = c.id;

-- If the above works, then insert more test data
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
    c.id as client_id,
    date_value as inspection_date,
    location,
    'Test Inspector' as inspector,
    status,
    notes,
    true as cover_page
FROM 
    clients c
CROSS JOIN (
    VALUES 
        (CURRENT_DATE - interval '5 days', 'Main Building', 'completed', 'Regular inspection'),
        (CURRENT_DATE + interval '7 days', 'North Wing', 'scheduled', 'Upcoming inspection'),
        (CURRENT_DATE - interval '2 days', 'South Wing', 'failed', 'Failed inspection'),
        (CURRENT_DATE + interval '14 days', 'East Wing', 'scheduled', 'Annual inspection')
    ) as v(date_value, location, status, notes)
WHERE c.id IN (
    SELECT id FROM clients LIMIT 5
)
AND c.id NOT IN (SELECT client_id FROM inspections);

-- Insert test items for all inspections
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
    i.id as inspection_id,
    'Fire Extinguisher' as item_type,
    'Floor ' || floor_num as floor,
    'Room ' || LPAD(ROW_NUMBER() OVER (PARTITION BY i.id ORDER BY floor_num)::text, 3, '0') as room,
    equipment_type,
    CASE 
        WHEN i.status = 'completed' THEN 'pass'
        WHEN i.status = 'failed' THEN 'fail'
        ELSE 'pass'
    END as status,
    'Test item notes' as notes
FROM 
    inspections i
    CROSS JOIN generate_series(1, 3) as floor_num
    CROSS JOIN (VALUES ('2.5ABC'), ('5ABC'), ('10ABC')) as e(equipment_type);

-- Final verification query
SELECT 
    i.inspection_date,
    c.name as client_name,
    i.inspector,
    i.location,
    i.status,
    COUNT(ii.id) as item_count,
    string_agg(ii.room, ', ' ORDER BY ii.room) as rooms
FROM 
    inspections i
    JOIN clients c ON i.client_id = c.id
    LEFT JOIN inspection_items ii ON i.id = ii.inspection_id
GROUP BY 
    i.inspection_date,
    c.name,
    i.inspector,
    i.location,
    i.status
ORDER BY 
    i.inspection_date;
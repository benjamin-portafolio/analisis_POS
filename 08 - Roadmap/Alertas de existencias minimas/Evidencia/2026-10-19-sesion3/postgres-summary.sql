SELECT json_build_object(
'postgres', version(),
'event_statuses', (SELECT json_object_agg(sync_status, n) FROM (SELECT sync_status,count(*) n FROM "seg_phase3_http_85371_1792416322267".events GROUP BY sync_status) e),
'conflicts', (SELECT count(*) FROM "seg_phase3_http_85371_1792416322267".sync_conflicts),
'minima', (SELECT json_object_agg(coalesce(minimum_stock_atomic::text,'null'), n) FROM (SELECT minimum_stock_atomic,count(*) n FROM "seg_phase3_http_85371_1792416322267".product_variants GROUP BY minimum_stock_atomic) v),
'confirmed_sales', (SELECT count(*) FROM "seg_phase3_http_85371_1792416322267".sales),
'movements', (SELECT count(*) FROM "seg_phase3_http_85371_1792416322267".inventory_movements),
'canonical_stock_events', (SELECT count(*) FROM "seg_phase3_http_85371_1792416322267".events WHERE sync_status='synced' AND aggregate_type='product' AND (payload::text LIKE '%minimum_stock_atomic%'))
);

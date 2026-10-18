SET search_path TO "seg_phase3_http_48094_1791145770824";
SELECT json_build_object('resource',inventory_item_id,'origin',origin_variant_id,'active',active) FROM inventory_items WHERE inventory_item_id='3474af26-08ee-4904-9aa4-27777b21d9a5';
SELECT json_build_object('on_hand',quantity_on_hand_atomic,'available',quantity_available_atomic) FROM inventory_balances WHERE inventory_item_id='3474af26-08ee-4904-9aa4-27777b21d9a5';
SELECT json_build_object('movements',count(*),'consumptions',count(*) FILTER(WHERE movement_type='sale_consumption')) FROM inventory_movements WHERE inventory_item_id='3474af26-08ee-4904-9aa4-27777b21d9a5';
SELECT json_build_object('sales',count(*)) FROM sales WHERE sale_id='e068ffe7-b5ca-4d7b-83fc-d9c603d5fb37';
SELECT json_build_object('payments',count(*)) FROM sale_payments WHERE sale_id='e068ffe7-b5ca-4d7b-83fc-d9c603d5fb37';
SELECT json_build_object('variant',variant_id,'resource',inventory_item_id,'source_event',source_event_id,'sequence',source_server_sequence) FROM variant_inventory_memory WHERE variant_id='a573fd60-3a35-41af-b05f-0c1346047417';
SELECT json_build_object('discards',count(*)) FROM events WHERE event_type='recurso_inventario_descartado';
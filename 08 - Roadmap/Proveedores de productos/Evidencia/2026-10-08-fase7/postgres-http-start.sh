#!/bin/zsh
set -eu
phase7_runtime=$(mktemp -d /tmp/pos-phase7.XXXXXX)
printf '%s' "$phase7_runtime" > /tmp/pos-phase7-runtime-path
phase7_pg=/Applications/Postgres.app/Contents/Versions/latest/bin
"$phase7_pg/initdb" -D "$phase7_runtime/pg" -U phase7 -A trust > "$phase7_runtime/initdb.log"
"$phase7_pg/pg_ctl" -D "$phase7_runtime/pg" -l "$phase7_runtime/postgres.log" -o "-h 127.0.0.1 -p 60937 -k $phase7_runtime" start > "$phase7_runtime/start.log"
"$phase7_pg/createdb" -h 127.0.0.1 -p 60937 -U phase7 pos_nest_test_suppliers_phase7
"$phase7_pg/createdb" -h 127.0.0.1 -p 60937 -U phase7 pos_cash_test_phase7
DATABASE_HOST=127.0.0.1 DATABASE_PORT=60937 DATABASE_USER=phase7 DATABASE_PASSWORD=isolated-test DATABASE_NAME=pos_nest_test_suppliers_phase7 POS_PHASE3_URL_FILE="$phase7_runtime/http.json" npx ts-node --transpile-only test/support/variant-tracking-server.ts > "$phase7_runtime/http.log" 2>&1

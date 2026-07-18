#!/bin/bash
# Load test script - runs basic stress tests against the API
# Usage: ./scripts/load-test.sh [BASE_URL] [REQUESTS] [CONCURRENCY]

BASE_URL="${1:-http://localhost:3000}"
REQUESTS="${2:-50}"
CONCURRENCY="${3:-5}"

echo "=== BaristaMetrics Load Test ==="
echo "Target: $BASE_URL"
echo "Requests: $REQUESTS"
echo "Concurrency: $CONCURRENCY"
echo ""

# Test 1: Health endpoint with controlled concurrency
echo "--- Test 1: Health Check ($REQUESTS requests, concurrency $CONCURRENCY) ---"
start=$(date +%s%N)
for i in $(seq 1 $REQUESTS); do
  curl -s -o /dev/null -w "%{http_code}\n" "$BASE_URL/api/health" &
  if (( i % CONCURRENCY == 0 )); then
    wait
  fi
done
wait
end=$(date +%s%N)
echo "Completed in $(( (end - start) / 1000000 ))ms"
echo ""

# Test 2: Burst test - all requests at once
echo "--- Test 2: Burst Test (all $REQUESTS at once) ---"
start=$(date +%s%N)
for i in $(seq 1 $REQUESTS); do
  curl -s -o /dev/null -w "%{http_code}\n" "$BASE_URL/api/health" &
done
wait
end=$(date +%s%N)
echo "Completed in $(( (end - start) / 1000000 ))ms"
echo ""

echo "=== Load Test Complete ==="

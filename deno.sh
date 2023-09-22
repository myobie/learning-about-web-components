#!/usr/bin/env bash

set -eo pipefail

deno run --allow-read --allow-write --allow-net ssr.deno.ts demo.html

cat demo.serialized.html

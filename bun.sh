#!/usr/bin/env bash

set -eo pipefail

bun install linkedom

bun run ssr.bun.ts ./demo.html

cat demo.serialized.html

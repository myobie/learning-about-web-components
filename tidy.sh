#!/usr/bin/env bash

set -eo pipefail

cat "$1" | tidy --indent yes --custom-tags blocklevel --fix-style-tags no --drop-empty-elements no

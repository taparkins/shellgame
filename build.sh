#!/bin/bash
set -e

pegjs -o ./src/lang/parser/grammar.js ./src/lang/parser/grammar.pegjs
webpack --config webpack.config.js

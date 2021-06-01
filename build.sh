#!/bin/bash
set -e

pegjs -o ./src/shell/parser/shellgrammar.js ./src/shell/parser/shellgrammar.pegjs
webpack --config webpack.config.js

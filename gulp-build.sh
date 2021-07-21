#!/bin/sh

cd /usr/src/app || return

npm install && gulp

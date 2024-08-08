#!/bin/bash

SOURCE_DIR="/home/dushusir/code/test/rainloop-webmail/rainloop/v/0.0.0"
TARGET_DIR="/var/www/html/rainloop/rainloop/v/1.17.0"

inotifywait -m -r -e modify,create,delete,move "$SOURCE_DIR" --format '%w%f' |
while read file
do
  rsync -av --delete "$SOURCE_DIR/" "$TARGET_DIR/"
done

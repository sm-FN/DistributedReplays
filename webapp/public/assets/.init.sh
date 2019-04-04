#!/bin/bash

DIR="$(dirname $(readlink -f "$0"))"
FOLDER="/shared"

echo "Checking $DIR$FOLDER"
count="$(find $DIR$FOLDER -iname '*.obj' -print -quit | wc -l)"

if [ $count != 0 ]; then
	echo "Found files in shared folder. Pulling from remote..."
	git submodule update --remote
else
	echo "Could not find any content in the shared folder. Initializing submodule..."
	git submodule update --init --remote
fi
#!/bin/bash
cd ~/swc3
#while [ true ]; do
GIT=`git pull`
if [[ $GIT =~ "актуально" ]]; then
  echo $GIT
else
  npm i
  npm run build
  pm2 restart all
  echo date > ~/swc3.updated.txt
fi

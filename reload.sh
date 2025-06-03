#!/bin/bash
PATH="/usr/bin:/bin:/home/abrikos/.nvm/versions/node/v22.16.0/bin/"

cd ~/swc3
GIT=`git pull`
if [[ $GIT =~ "Already" ]]; then
  echo $GIT
else
  npm i
  npm run build
  #~/.nvm/versions/node/v22.16.0/bin/pm2 restart all
  pm2 restart all
  echo date > ~/swc3.updated.txt
fi

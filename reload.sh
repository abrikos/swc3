#!/bin/bash
#PATH="/usr/bin:/bin:/home/abrikos/.nvm/versions/node/v22.16.0/bin"

cd ~/swc3
GIT=`git pull`
if [[ $GIT =~ "Already" ]]; then
  echo $GIT
else
# Load nvm
  export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm use 22.16.0
  npm i
  npm run build
  #~/.nvm/versions/node/v22.16.0/bin/pm2 restart all
  pm2 restart all
  echo date > ~/swc3.updated.txt
fi

#!/bin/bash

DIR="$( cd "$( dirname "$0" )" && pwd )"
DEPLOY_ENV=${1-beta}

if [ "$DEPLOY_ENV" == "beta" ]; then
  APP_ID="E782171C"
else
  APP_ID="5CDCF86D"
fi

sed -i -e "s/APPLICATION_ID = '.*'/APPLICATION_ID = '$APP_ID'/g" $DIR/../js/AppInfo.js

rsync --delete --recursive * /srv/casturo/$DEPLOY_ENV/

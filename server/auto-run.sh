#!/bin/bash
git pull origin server
CONFLICTS=$(git ls-files -u | wc -l)
if [ "$CONFLICTS" -gt 0 ] ; then
   echo "There is a merge conflict. Aborting"
   git merge --abort
   exit 1
fi
sudo docker-compose down
sudo docker rmi node-server
sudo docker-compose up --build

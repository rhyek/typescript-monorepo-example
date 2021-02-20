set -e
CODE=0
echo lol || CODE=$?
if [ $CODE != 0 ]; then
  echo error
else
  echo ok
fi

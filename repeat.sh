#!/usr/bin/env bash

_count=0
_success=0
while [ ${_count} -lt 10 ] ; do
  $* && _success=$[${_success}+1]
  _count=$[_count+1]
  echo "---"
  echo "Success: ${_success}/${_count}"
  echo "---"
done

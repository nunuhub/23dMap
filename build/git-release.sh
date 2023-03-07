#!/usr/bin/env sh
branceName=`git symbolic-ref --short -q HEAD`
branceNamePre=${branceName:0:7}

if [[ $branceNamePre != "release" ]]
then
  git checkout dev
fi

if test -n "$(git status --porcelain)"; then
  echo 'Unclean working tree. Commit or stash changes first.' >&2;
  exit 128;
fi

if ! git fetch --quiet 2>/dev/null; then
  echo 'There was a problem fetching your branch. Run `git fetch` to see more...' >&2;
  exit 128;
fi

if test "0" != "$(git rev-list --count --left-only @'{u}'...HEAD)"; then
  echo 'Remote history differ. Please pull changes.' >&2;
  exit 128;
fi

echo 'No conflicts.' >&2;

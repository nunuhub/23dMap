#!/usr/bin/env sh
set -e

source_user=`npm whoami --registry=http://192.168.11.146:8073/repository/shinegis-source/`
internal_user=`npm whoami --registry=http://192.168.11.146:8073/repository/npm-internal/`
branceName=`git symbolic-ref --short -q HEAD`

if [[ $source_user != "shinegis" ]]
then
  echo "当前NPM(shinegis-source)登录用户($source_user)无权限发布!"
  exit 1
fi

if [[ $internal_user != "shinegis" ]]
then
  echo "当前NPM(npm-internal)登录用户($internal_user)无权限发布!"
  exit 1
fi

if [[ $branceName == "dev" ]]
then
  git checkout master
  git merge dev

  VERSION=`npx select-version-cli`

  read -p "Releasing $VERSION - are you sure? (y/n)" -n 1 -r
  echo    # (optional) move to a new line
  if [[ $REPLY =~ ^[Yy]$ ]]
  then
    echo "Releasing $VERSION ..."

    # build
    VERSION=$VERSION npm run dist

    # commit
    git add -A
    git commit -m "chore(project): [tag] $VERSION"
    npm version $VERSION --message "chore(project): [release] $VERSION"

    # publish
    git push origin master
    if [[ !($VERSION =~ "-") ]]
    then
      git push origin refs/tags/v$VERSION
    fi
    git checkout dev
    git rebase master
    git push origin dev

    # 发内部包
    if [[ $VERSION =~ "-" ]]
    then
      npm publish --tag beta --registry=http://192.168.11.146:8073/repository/shinegis-source/
    else
      npm publish --registry=http://192.168.11.146:8073/repository/shinegis-source/
    fi

    # 将混淆后的代码放入lib下
    npm run obf:src

    # 发外部大版本包
    if [[ $VERSION =~ "-" ]]
    then
      npm publish --tag beta --registry=http://192.168.11.146:8073/repository/npm-internal/
    else
      npm publish --registry=http://192.168.11.146:8073/repository/npm-internal/

      # 发布文档索引
      npm run indices
    fi
  fi
else
  VERSION=`npx select-version-cli`

  read -p "Releasing $VERSION - are you sure? (y/n)" -n 1 -r
  echo    # (optional) move to a new line
  if [[ $REPLY =~ ^[Yy]$ ]]
  then
    echo "Releasing $VERSION ..."

    # build
    VERSION=$VERSION npm run dist

    # commit
    git add -A
    git commit -m "chore(project): [tag] $VERSION"
    npm version $VERSION --message "chore(project): [release] $VERSION"

    # publish
    git push origin $branceName
    if [[ !($VERSION =~ "-") ]]
    then
      git push origin refs/tags/v$VERSION
    fi

    TAG=`node build/bin/npm-tag $VERSION`

    # 发内部包
    npm publish --tag $TAG --registry=http://192.168.11.146:8073/repository/shinegis-source/

    # 将混淆后的代码放入lib下
    npm run obf:src

    # 发外部大版本包
    npm publish --tag $TAG --registry=http://192.168.11.146:8073/repository/npm-internal/

    if [[ $TAG == "latest" ]]
    then
      # 发布文档索引
      npm run indices
    fi
  fi
fi
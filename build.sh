#!/bin/bash

export LANG=en_US.UTF-8
export LANGUAGE=en_US.UTF-8
export LC_ALL=en_US.UTF-8

function get_version {
  local version=$(git for-each-ref refs/tags/version --merged HEAD --sort="-v:refname" --format='%(refname:lstrip=3)' --count 1)
  is_version_string $version && echo $version && return
  false
}

function get_last_build {
  local build=$(git for-each-ref refs/tags/$1 --merged HEAD --sort="-v:refname" --format='%(refname:lstrip=3)' --count 1)
  is_version_string $build && echo $build && return
  echo "0.0.0" # if no previous builds
}

function get_tag_for_branch_type {
  [ "$1" == "master" ] && echo 'release' && return
  echo 'staging'
}

function is_version_string {
  [[ $1 =~ ^[0-9]+\.+[0-9\.]*[0-9]$ ]] && return
  false
}

function replace_json_value {  
  local key=$1
  local value=$2
  local file=$3
  echo "Updating \"$key\": \"$value\" in $file"
  sed -i.bak "s|\(.*\"$key\"\: \"*\)[^\",]*\(\"*,\)|\1$value\2|g" $file && return
  false
}

function set_version {
  local v=(${2//./ })
  local b=(${4//./ })
  
  local android=$((${v[0]}*10000000 + ${v[1]}*100000 + $3))

  replace_json_value version $2 $1 && \
  replace_json_value buildNumber $2.$3 $1 && \
  replace_json_value versionCode $android $1
  
  [ $? -gt 0 ] && echo 'Setting version code failed, aborting' && return 11 || true

  local req_dep="false"
  if [[ ${v[0]} -gt ${b[0]} || ${v[1]} -gt ${b[1]} ]]; then
    req_dep="true"
    echo "##teamcity[buildStatus text='{build.status.text} - New version']"
  fi
  
  echo "App Version $2.$3, requires deploy: $req_dep"
  echo "##teamcity[buildNumber '$2.$3']"
  echo "##teamcity[setParameter name='ANDROID_VERSIONCODE' value='$android']"
  echo "##teamcity[setParameter name='REQUIRES_DEPLOY' value='$req_dep']"
}

function get_branch_type {
  local branch=$(git rev-parse --abbrev-ref HEAD)
  echo "${branch%/*}"
}

function get_channel {
  [ $(get_branch_type) == "master" ] && echo $(get_version) || echo "development"
}

function install_or_update_global_deps {
  echo 'Installing global npm dependencies'
  npm i -g jest-cli expo-cli && \
  bundle install
}

function install_deps {
  echo 'Installing package dependencies'
  npm ci && return
  false
}

function run_tests {
  echo 'Running Jest (tests)'
  npm test
  [ $? -gt 0 ] && echo 'Tests failed, aborting' && return 12 || true
}

function login_expo {
  echo 'Logging in to Expo'
  expo login -u YOUR_EXPO_USERNAME -p YOUR_EXPO_PASSWORD --non-interactive
  [ $? -gt 0 ] && echo 'Expo login failed, aborting' && return 13 || true
}

function unlock_keychain {
  echo 'Unlocking keychain'
  security unlock-keychain -p YOUR_MAC_USER_PASSWORD ~/Library/Keychains/login.keychain
  [ $? -gt 0 ] && echo 'Keychain unlock failed, aborting' && return 14 || true
}

function mkdir_builds {
  echo 'Create build dir'
  mkdir -p builds/
} 

function build_android {
  echo 'Building Android Production'
  expo build:android --release-channel $1 --non-interactive --no-publish && \
  echo 'Downloading apk' && \
  curl -o builds/YOUR_APP_NAME.apk "$(expo url:apk --non-interactive)"
  [ $? -gt 0 ] && echo 'Build Android failed, aborting' && return 15 || true
}

function build_ios {
  #echo 'Restore iOS appstore signing certificate'
  #bundle exec fastlane match appstore --readonly
  echo 'Building iOS'
  expo build:ios --release-channel $1 --non-interactive --no-publish && \
  echo 'Downloading ipa' && \
  curl -o builds/YOUR_APP_NAME.ipa "$(expo url:ipa --non-interactive)"
  [ $? -gt 0 ] && echo 'Build iOS failed, aborting' && return 16 || true
}

function expo_publish {
  echo 'Publishing OTA update'
  expo publish -c --release-channel $1 --non-interactive
}

function tag_published_version {
  local branchtype=$(get_branch_type)
  local buildTag=$(get_tag_for_branch_type $branchtype)

  is_version_string $1 && \
  git tag $buildTag/$1 && \
  git push --tags && \
  return
  false
}
export -f tag_published_version

function integrate {
  local version=$(get_version)
  local branchtype=$(get_branch_type)
  local buildTag=$(get_tag_for_branch_type $branchtype)
  local last_build=$(get_last_build $buildTag)

  set_version app.json $version $1 $last_build && \
  echo "Installing npm deps" && \
  install_or_update_global_deps && \
  install_deps && \
  echo "Running tests" && \
  run_tests
}
export -f integrate

function publish {
  local channel=$(get_channel)
  login_expo && \
  expo_publish $channel
}
export -f publish

function build {
  local channel=$(get_channel)
  unlock_keychain && \
  login_expo && \
  expo_publish $channel && \
  mkdir_builds && \
  build_android $channel && \
  build_ios $channel
}
export -f build

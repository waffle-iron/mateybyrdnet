#!/usr/bin/env bash

# This file updates a certain directory from a git repository, currently it is not very flexible

# Variables

# Echo a message
cecho() {
  # Set the color to white
  tput setaf 7;
  echo $1;
  tput sgr0;
}

# Make a temporary folder that will contain the downloaded files from the repository
cecho "Downloading from github"

# Remove the temp folder for if it already exists
cd /srv/www
rm -rf temp
mkdir temp
cd temp
git clone -b master https://github.com/MateyByrd/MateybyrdNet.git
git lfs install
git lfs pull

cd /srv/www

# Remove the current folder for the server
cecho "Removing old files and copying new files to the right place"

rm -rf dev.mateybyrd.net/
# Copy and paste the files from the temp folder back in to the server folder.
cp -a temp/MateybyrdNet/. dev.mateybyrd.net/

# Remove the temp folder and all of its content
cecho "Removing temporary files"

rm -rf temp/

cecho "Update complete"
#!/usr/bin/env bash

# Update the website using the 'git pull' command

# Reset all changes made to the site, watch out with this command when developing.
git reset --hard
# Pull the changes from the master repository.
git pull origin master
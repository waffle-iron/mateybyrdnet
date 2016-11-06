#!/usr/bin/env bash

# This file updates a certain directory from a git repository, currently it is
# not very flexible.

# First we reset the repository so that we can pull with no conflicts.
git reset --hard

# Then we pull the updates from the repository.
git pull
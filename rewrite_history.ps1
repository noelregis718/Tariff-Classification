#!/usr/bin/env pwsh

# Define new credentials
$NEW_NAME = "Noel Regis"
$NEW_EMAIL = "noelregis718@gmail.com"

# The filter-branch command
git filter-branch --env-filter @"
    \$GIT_AUTHOR_NAME = '$NEW_NAME'
    \$GIT_AUTHOR_EMAIL = '$NEW_EMAIL'
    \$GIT_COMMITTER_NAME = '$NEW_NAME'
    \$GIT_COMMITTER_EMAIL = '$NEW_EMAIL'
"@ --force -- --all

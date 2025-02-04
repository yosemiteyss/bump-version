const core = require('@actions/core')
const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')

try {
  const tag = core.getInput('tag')
  const packagePath = core.getInput('path')
  const commit = core.getBooleanInput('commit')
  const commitLockFile = core.getBooleanInput('commit_lock_file')
  const branchToPush = core.getInput('branch_to_push')

  const parsedTag = tag.replace('v', '')

  core.info(`Parsed tag ${tag} to ${parsedTag}!`)

  const packageString = fs.readFileSync(packagePath, {
    encoding: 'utf-8',
  })

  const packageJson = JSON.parse(packageString)

  packageJson['version'] = parsedTag

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, undefined, 2))

  if (commit === true) {
    core.debug(
      execSync(
        `git config --global user.email "github-actions[bot]@users.noreply.github.com"`
      )
    )
    core.debug(execSync(`git config --global user.name "github-actions[bot]"`))

    if (commitLockFile === true) {
      core.debug(execSync('npm install'))
      core.debug(execSync('git diff --cached --name-only'))
    }

    core.debug(execSync(`git add .`))
    core.debug(
      execSync(`git commit -m "bump-version: bump version to '${parsedTag}'"`)
    )
    core.debug(
      execSync(
        `git push origin ${branchToPush} -f || git checkout -b ${branchToPush} && git push origin ${branchToPush}`
      )
    )

    core.info('commited the version with success!')
  } else {
    core.info('will not commit!')
  }

  core.setOutput('parsed-tag', parsedTag)
} catch (error) {
  core.setFailed(error.message)
}

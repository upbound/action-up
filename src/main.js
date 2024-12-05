const core = require('@actions/core')
const exec = require('@actions/exec')
const tc = require('@actions/tool-cache')
const fs = require('fs')

function formatVersion(version) {
  return /^\d/.test(version) ? `v${version}` : version
}

async function downloadUp(version, channel, url, platform, architecture) {
  let os = 'linux'
  let arch = 'amd64'
  const bin = 'up'

  switch (platform) {
    case 'darwin':
      os = 'darwin'
      break
    case 'linux':
      os = 'linux'
      break
    default:
      core.warning(`Unknown platform: ${platform}; defaulting to ${os}`)
      break
  }

  switch (architecture) {
    case 'arm64':
      arch = 'arm64'
      break
    case 'x64':
      arch = 'amd64'
      break
    default:
      core.warning(
        `Unknown architecture: ${architecture}; defaulting to ${arch}`
      )
      break
  }

  const downloadURL = `${url}/${channel}/${version}/bin/${os}_${arch}/${bin}`
  const binaryPath = await tc.downloadTool(downloadURL)

  await exec.exec('chmod +x', [binaryPath])

  return tc.cacheFile(binaryPath, bin, 'up', version)
}

async function run() {
  try {
    const version = formatVersion(core.getInput('version'))
    const channel = core.getInput('channel')
    const url = core.getInput('url')

    let installPath = tc.find('up', version)
    if (!installPath) {
      installPath = await downloadUp(
        version,
        channel,
        url,
        process.platform,
        process.arch
      )
    }

    core.addPath(installPath)
    core.debug(`up CLI version ${version} installed to ${installPath}`)

    core.info('Verifying installation...')
    await exec.exec('up version')

    // Skip login if requested
    const skip_login = core.getInput('skip_login')
    if (skip_login.toLowerCase() === 'true') {
      core.info('Skipping up login')
      return
    }

    const token = core.getInput('token', { required: true })
    core.setSecret(token)
    await exec.exec('up login --token', [token])
    core.info('Successfully logged into Upbound')
  } catch (error) {
    core.setFailed(error.message)
  }
}

module.exports = {
  run,
  formatVersion
}

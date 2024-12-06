const core = require('@actions/core')
const exec = require('@actions/exec')
const tc = require('@actions/tool-cache')
const fs = require('fs')

const upToolname = 'up'
const currentVersionUrl = 'https://cli.upbound.io/stable/current/version'

function formatVersion(version) {
  return /^\d/.test(version) ? `v${version}` : version
}

async function downloadUp(endpoint, channel, version, platform, architecture) {
  let os = 'linux'
  let arch = 'amd64'

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

  const downloadURL = `${endpoint}/${channel}/${version}/bin/${os}_${arch}/${upToolname}`
  const binaryPath = await tc.downloadTool(downloadURL)

  fs.chmodSync(binaryPath, '775')

  return tc.cacheFile(binaryPath, upToolname, upToolname, version)
}

async function run() {
  try {
    let version = formatVersion(core.getInput('version', { required: true }))
    const channel = core.getInput('channel', { required: true })
    const endpoint = core.getInput('endpoint', { required: true })

    if (version.toLowerCase() == 'current') {
      version = await getCurrentUpVersion()
    }

    let installPath = tc.find(upToolname, version)
    if (!installPath) {
      installPath = await downloadUp(
        version,
        channel,
        endpoint,
        process.platform,
        process.arch
      )
    }

    core.addPath(installPath)
    core.debug(`up CLI version ${version} installed to ${installPath}`)

    core.info('Verifying installation...')
    await exec.exec('up version')

    // Skip login if requested
    const skipLogin = core.getInput('skip-login')
    core.info(`skip-login ${skipLogin}`)
    if (skipLogin.toLowerCase() === 'true') {
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

async function getCurrentUpVersion() {
  return tc.downloadTool(currentVersionUrl).then(
    downloadPath => {
      let version = fs.readFileSync(downloadPath, 'utf8').toString().trim()
      if (!version) {
        version = currentVersionUrl
      }
      return version
    },
    error => {
      core.debug(error)
      core.warning('GetCurrentVersionFailed')
      return currentVersionUrl
    }
  )
}

module.exports = {
  run,
  formatVersion
}

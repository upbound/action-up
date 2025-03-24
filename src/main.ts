import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as tc from '@actions/tool-cache'
import * as fs from 'fs'

const upToolname = 'up'

function formatVersion(version: string): string {
  return /^\d/.test(version) ? `v${version}` : version
}

async function downloadUp(
  endpoint: string,
  channel: string,
  version: string,
  platform: string,
  architecture: string
): Promise<string> {
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

async function run(): Promise<void> {
  try {
    let version = formatVersion(core.getInput('version', { required: true }))
    const channel = core.getInput('channel', { required: true })
    const endpoint = core.getInput('endpoint', { required: true })

    if (version.toLowerCase() == 'current') {
      version = await getCurrentUpVersion(channel)
    }

    let installPath = tc.find(upToolname, version)
    if (!installPath) {
      installPath = await downloadUp(
        endpoint,
        channel,
        version,
        process.platform,
        process.arch
      )
    }

    core.addPath(installPath)
    core.debug(`up CLI version ${version} installed to ${installPath}`)

    core.info('Verifying installation...')
    await exec.exec('up', ['version'])

    const skipLogin = core.getInput('skip-login')
    if (skipLogin.toLowerCase() === 'true') {
      core.info('Skipping up login')
      return
    }

    const apiToken = core.getInput('api-token')
    const robotToken = core.getInput('robot-token')
    const organization = core.getInput('organization', { required: true })

    // Ensure only one of apiToken or robotToken is provided
    if ((apiToken && robotToken) || (!apiToken && !robotToken)) {
      throw new Error(
        'You must provide exactly one of "api-token" or "robot-token".'
      )
    }

    const token = apiToken || robotToken
    core.setSecret(token)
    await exec.exec('up', [
      'login',
      '--token',
      token,
      '--account',
      organization
    ])
    core.info('Successfully logged into Upbound')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function getCurrentUpVersion(channel: string): Promise<string> {
  const currentVersionUrl = `https://cli.upbound.io/${channel}/current/version`

  return tc.downloadTool(currentVersionUrl).then(
    downloadPath => {
      let version = fs.readFileSync(downloadPath, 'utf8').toString().trim()
      if (!version) {
        version = currentVersionUrl
      }
      return version
    },
    (error: unknown) => {
      if (error instanceof Error) core.debug(error.message)
      core.warning('GetCurrentVersionFailed')
      return currentVersionUrl
    }
  )
}

export { run, formatVersion, getCurrentUpVersion, downloadUp }

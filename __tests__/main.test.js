const core = require('@actions/core')
const exec = require('@actions/exec')
const tc = require('@actions/tool-cache')
const main = require('../src/main')
const { expect, describe } = require('@jest/globals')
const { formatVersion } = require('../src/main')

// Mock the GitHub Actions core library
const infoMock = jest.spyOn(core, 'info').mockImplementation()
const getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
const execMock = jest.spyOn(exec, 'exec').mockImplementation()
const downloadToolMock = jest.spyOn(tc, 'downloadTool').mockImplementation()
const cacheFileMock = jest.spyOn(tc, 'cacheFile').mockImplementation()
const findMock = jest.spyOn(tc, 'find').mockImplementation()

describe('formatVersion', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('leaves the version unchanged if it already has a "v" prefix', () => {
    const version = 'v0.12.1'
    const formattedVersion = formatVersion(version)
    expect(formattedVersion).toBe('v0.12.1')
  })

  it('adds a "v" prefix if not present', () => {
    const version = '0.12.1'
    const formattedVersion = formatVersion(version)
    expect(formattedVersion).toBe('v0.12.1')
  })

  it('returns the version unchanged if it does not start with a number', () => {
    expect(formatVersion('current')).toBe('current')
    expect(formatVersion('latest')).toBe('latest')
  })
})

describe('up', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock platform and architecture
    Object.defineProperty(process, 'platform', {
      value: 'linux'
    })
    Object.defineProperty(process, 'arch', {
      value: 'x64'
    })
  })

  it('installs the Up CLI and logs in when token is provided', async () => {
    // Mock inputs
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'version':
          return 'v0.12.1'
        case 'channel':
          return 'stable'
        case 'url':
          return 'https://cli.upbound.io'
        case 'token':
          return 'test-token'
        default:
          return ''
      }
    })

    findMock.mockReturnValue(null)
    execMock.mockResolvedValue(0)
    downloadToolMock.mockResolvedValue('/tmp/up')

    await main.run()

    expect(findMock).toHaveBeenCalledWith('up', 'v0.12.1')
    expect(downloadToolMock).toHaveBeenCalledWith(
      'https://cli.upbound.io/stable/v0.12.1/bin/linux_amd64/up'
    )
    expect(cacheFileMock).toHaveBeenCalledWith('/tmp/up', 'up', 'up', 'v0.12.1')
    expect(execMock).toHaveBeenCalledWith('chmod +x', ['/tmp/up'])
    expect(execMock).toHaveBeenNthCalledWith(1, 'chmod +x', ['/tmp/up'])
    expect(execMock).toHaveBeenNthCalledWith(2, 'up version')
    expect(execMock).toHaveBeenNthCalledWith(3, 'up login --token', [
      'test-token'
    ])
  })

  it('installs the up CLI but skips login when token is not provided', async () => {
    // Mock inputs
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'version':
          return 'v0.12.1'
        case 'channel':
          return 'stable'
        case 'url':
          return 'https://cli.upbound.io'
        case 'skip_login':
          return true
        default:
          return ''
      }
    })

    findMock.mockReturnValue(null)
    execMock.mockResolvedValue(0)
    downloadToolMock.mockResolvedValue('/tmp/up')

    await main.run()

    expect(findMock).toHaveBeenCalledWith('up', 'v0.12.1')
    expect(downloadToolMock).toHaveBeenCalledWith(
      'https://cli.upbound.io/stable/v0.12.1/bin/linux_amd64/up'
    )
    expect(cacheFileMock).toHaveBeenCalledWith('/tmp/up', 'up', 'up', 'v0.12.1')
    expect(execMock).toHaveBeenCalledWith('chmod +x', ['/tmp/up'])
    expect(execMock).toHaveBeenNthCalledWith(1, 'chmod +x', ['/tmp/up'])
    expect(execMock).toHaveBeenNthCalledWith(2, 'up version')
    expect(execMock).not.toHaveBeenNthCalledWith(3, 'up login --token', [
      'test-token'
    ])
  })
})

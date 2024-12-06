import * as run from '../src/main'
import * as tc from '@actions/tool-cache'
import fs from 'fs'
import * as path from 'path'
import * as core from '@actions/core'

describe('Testing all functions in run file.', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('leaves the version unchanged if it already has a "v" prefix', () => {
    const version = 'v0.12.1'
    const formattedVersion = run.formatVersion(version)
    expect(formattedVersion).toBe('v0.12.1')
  })

  it('adds a "v" prefix if not present', () => {
    const version = '0.12.1'
    const formattedVersion = run.formatVersion(version)
    expect(formattedVersion).toBe('v0.12.1')
  })

  it('returns the version unchanged if it does not start with a number', () => {
    expect(run.formatVersion('current')).toBe('current')
    expect(run.formatVersion('latest')).toBe('latest')
  })

  it('download current version file, read version and return it', async () => {
    jest
      .spyOn(tc, 'downloadTool')
      .mockReturnValue(Promise.resolve('pathToTool'))
    jest.spyOn(fs, 'readFileSync').mockReturnValue('v0.12.1')
    expect(await run.getCurrentUpVersion('stable')).toBe('v0.12.1')
    expect(tc.downloadTool).toHaveBeenCalled()
    expect(fs.readFileSync).toHaveBeenCalledWith('pathToTool', 'utf8')
  })

  it('download current version file on main channel, read version and return it', async () => {
    jest.spyOn(core, 'getInput').mockReturnValue('main')
    jest
      .spyOn(tc, 'downloadTool')
      .mockReturnValue(Promise.resolve('pathToTool'))
    jest.spyOn(fs, 'readFileSync').mockReturnValue('v0.12.1')
    expect(await run.getCurrentUpVersion('main')).toBe('v0.12.1')
    expect(tc.downloadTool).toHaveBeenCalled()
    expect(fs.readFileSync).toHaveBeenCalledWith('pathToTool', 'utf8')
  })

  it('download up, add it to tc', async () => {
    jest
      .spyOn(tc, 'downloadTool')
      .mockReturnValue(Promise.resolve('pathToTool'))
    jest
      .spyOn(tc, 'cacheFile')
      .mockReturnValue(Promise.resolve('pathToCachedTool/up'))
    Object.defineProperty(process, 'platform', {
      value: 'linux',
      writable: true
    })
    jest.spyOn(fs, 'chmodSync').mockImplementation(() => {})
    expect(
      await run.downloadUp(
        'https://cli.upbound.io',
        'stable',
        'v0.12.1',
        'linux',
        'amd64'
      )
    ).toBe(path.join('pathToCachedTool', 'up'))
    expect(tc.downloadTool).toHaveBeenCalled()
    expect(tc.cacheFile).toHaveBeenCalled()
    expect(fs.chmodSync).toHaveBeenCalledWith('pathToTool', '775')
  })
})

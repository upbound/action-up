# GitHub Actions for Upbound - up

This action enabbles you to interact with Upbound by installing the up CLI.

## Usage

To install the latest version of `up` and use it in GitHub Actions workflows,
[create an Upbound API token](https://docs.upbound.io/all-spaces/spaces/console/#create-a-personal-access-token),
[add it as a secret to your repository](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions#creating-encrypted-secrets-for-a-repository),
and add the following step to your workflow:

```yaml
- name: Install and login with up
  uses: upbound/action-up@v1
  with:
    token: ${{ secrets.UP_API_TOKEN }}
    organization: my-org
```

`up` will now be available in the environement and can be used in follow steps.
As an example, you can set your Upbound context:

```yaml
- name: Install and login with up
  uses: upbound/action-up@v1
  with:
    token: ${{ secrets.UP_API_TOKEN }}
    organization: my-org

- name: Set Upbound context
  run: up ctx my-org/upbound-gcp-us-west-1/default/my-ctp
```

## Contributing

> [!NOTE]
>
> You'll need to have a reasonably modern version of
> [Node.js](https://nodejs.org) handy. If you are using a version manager like
> [`nodenv`](https://github.com/nodenv/nodenv) or
> [`nvm`](https://github.com/nvm-sh/nvm), you can run `nodenv install` in the
> root of your repository to install the version specified in
> [`package.json`](./package.json). Otherwise, 20.x or later should work!

1. :hammer_and_wrench: Install the dependencies

   ```bash
   npm install
   ```

1. :building_construction: Package the JavaScript for distribution

   ```bash
   npm run bundle
   ```

1. :white_check_mark: Run the tests

   ```bash
   $ npm test
   PASS  __tests__/main.test.js
    action
      ✓ installs the up cli successfully (2 ms)
      ✓ installs the up cli successfully without a v in front of the version (1 ms)

   PASS  __tests__/index.test.js
    index
      ✓ calls run when imported (1 ms)
   ...
   ```

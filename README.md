# GitHub Actions for Upbound - up

This action enabbles you to interact with Upbound by installing the up CLI.

## Usage

TODO

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

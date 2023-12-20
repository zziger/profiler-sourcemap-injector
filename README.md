# Profiler sourcemap injector

This package injects source map files into .cpuprofile files generated by Chrome DevTools.

## Installation

```bash
npm install profiler-sourcemap-injector
```

or

```bash
yarn add profiler-sourcemap-injector
```

## Usage

```js
import { injectSourceMaps } from 'profiler-sourcemap-injector';

const outputObject = await injectSourceMaps('path/to/profile.cpuprofile', 'path/to/output/profile.cpuprofile', {
    sourceMapDir: 'path/to/source/maps', // Directory where source maps are located
    sourceDir: 'path/to/source/files', // Optional path to source file directory
    profileSourceRoot: 'root/of/profile/source/paths', // Optional root path of source paths in .cpuprofile file
    
    log: (msg) => console.log(msg), // Optional logging function
    transformSource: (path) => path, // Optional function to transform source paths
    sourceMapProvider: (path) => null, // Optional function to provide source maps
});
```

### .cpuprofile reading

You can specify JSON-parsed .cpuprofile object instead of file path.

### Path resolution

If `profileSourceRoot` is specified, the speicfied value will be removed from the start of each .cpuprofile path.\
If `sourceDir` is specified, the specified value will be appended to the start of each .cpuprofile path.\
This is helpful if you want to forcefully resolve paths to use in e.g. VSCode

You can override that behavior by specifying `transformSource` function. The function gets .cpuprofile path as an input, and outputs new path.

### Source map reading

By default this package reads source maps from the `sourceMapDir`, looking for files with the same name as .js, but with .map extension.\
You can override that behavior by specifying `sourceMapProvider` function. The function gets .cpuprofile path as an input, and outputs source map contents string.

## Usage outside of NodeJS environment

To use this module outside of NodeJS you can override `sourceMapProvider` function, provide profile object instead of .cpuprofile path, and specify `null` to the output argument.
You can get resulting profile object from the return value of the function.


## License

[MIT](LICENSE)

## Contributions

PRs are very welcome!
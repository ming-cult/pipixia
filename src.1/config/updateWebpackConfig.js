import path from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import context from '../context';
import getStyleLoadersConfig from './getStyleLoadersConfig';

const bishengLib = path.join(__dirname, '..');
const bishengLibLoaders = path.join(bishengLib, 'loaders');

export default function updateWebpackConfig(webpackConfig, mode) {
  const { bishengConfig } = context;
  const styleLoadersConfig = getStyleLoadersConfig(bishengConfig);

  /* eslint-disable no-param-reassign */
  webpackConfig.entry = {
    main: [path.join(process.cwd(), 'docs/app.tsx')]
  };
  if (context.isBuild) {
    webpackConfig.output.path = path.join(process.cwd(), bishengConfig.output);
  }
  webpackConfig.output.publicPath = context.isBuild ? bishengConfig.root : '/';
  if (mode === 'start') {
    styleLoadersConfig.forEach((config) => {
      webpackConfig.module.rules.push({
        test: config.test,
        use: ['style-loader', ...config.use],
      });
    });
  }
  webpackConfig.resolve.alias = {
    components: path.join(process.cwd(), path.resolve(__dirname, '..') + '/components');
    types: path.join(process.cwd(), path.resolve(__dirname, '..') + '/types');,
    layout: path.join(process.cwd(), path.resolve(__dirname, '..') + '/docs/layout');,
    routes: path.join(process.cwd(), path.resolve(__dirname, '..') + '/docs/routes');,
    static: path.join(process.cwd(), path.resolve(__dirname, '..') + '/docs/static');,
  }
  if (mode === 'build') {
    webpackConfig.output.filename = bishengConfig.hash
      ? '[name]-[contenthash:8].js'
      : '[name].js',

      styleLoadersConfig.forEach((config) => {
        webpackConfig.module.rules.push({
          test: config.test,
          use: [MiniCssExtractPlugin.loader, ...config.use],
        });
      });
  }
  webpackConfig.module.rules.push({
    test(filename) {
      return (
        filename === path.join(bishengLib, 'utils', 'data.js')
        || filename === path.join(bishengLib, 'utils', 'ssr-data.js')
      );
    },
    loader: path.join(bishengLibLoaders, 'bisheng-data-loader'),
  });
  /* eslint-enable no-param-reassign */

  const customizedWebpackConfig = bishengConfig.webpackConfig(
    webpackConfig,
    webpack,
  );

  const entryPath = path.join(
    bishengLib,
    '..',
    'tmp',
    `entry.${bishengConfig.entryName}.js`,
  );
  if (customizedWebpackConfig.entry[bishengConfig.entryName]) {
    throw new Error(
      `Should not set \`webpackConfig.entry.${bishengConfig.entryName}\`!`,
    );
  }
  customizedWebpackConfig.entry[bishengConfig.entryName] = entryPath;
  return customizedWebpackConfig;
}

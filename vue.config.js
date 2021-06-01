const webpack = require('webpack')
const { execSync } = require('child_process')
const pkgVersion = require('./package.json').version
const commitHash = execSync('git rev-parse HEAD').toString().trim().slice(0, 7)
const version = `v${pkgVersion}-${commitHash}`
// const version = execSync('git describe --always').toString().trim()

module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          'FRONTEND_VERSION': JSON.stringify(version),
        },
      }),
    ],
  },
  pluginOptions: {
    i18n: {
      locale: 'ru',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false,
    },
  },
}

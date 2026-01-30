/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const path = require('path')
const webpack = require('webpack')
const webpackConfig = require('@nextcloud/webpack-vue-config')
const CopyPlugin = require('copy-webpack-plugin')

webpackConfig.plugins.push(new CopyPlugin({
	patterns: [
		{ from: 'node_modules/twemoji/2/svg/', to: '../img/twemoji' },
	],
}))

webpackConfig.entry = {
	social: path.join(__dirname, 'src', 'main.js'),
	ostatus: path.join(__dirname, 'src', 'ostatus.js'),
	profilePage: path.join(__dirname, 'src', 'profile.js'),
	dashboard: path.join(__dirname, 'src', 'dashboard.js'),
	oauth: path.join(__dirname, 'src', 'oauth.js'),
}

// Suppress optional dependencies that don't affect the app
webpackConfig.resolve.fallback = webpackConfig.resolve.fallback || {}
webpackConfig.resolve.fallback['ical.js'] = false

// Suppress known third-party library warnings that don't affect functionality
// floating-vue from @nextcloud/vue has Vue 2 compatibility code that triggers warnings
// but the library works fine with Vue 3
webpackConfig.ignoreWarnings = (webpackConfig.ignoreWarnings || []).concat([
	{
		module: /floating-vue/,
		message: /export 'default'.*was not found in 'vue'/,
	},
])

module.exports = webpackConfig

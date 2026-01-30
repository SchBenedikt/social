/**
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router.js'
import vuetwemoji from 'vue-twemoji'
import VueMasonry from 'vue-masonry-css'

// CSP config for webpack dynamic chunk loading
// eslint-disable-next-line
__webpack_nonce__ = btoa(OC.requestToken)

// Correct the root of the app for chunk loading
// OC.linkTo matches the apps folders
// eslint-disable-next-line
__webpack_public_path__ = OC.linkTo('social', 'js/')

const pinia = createPinia()
const app = createApp(App)

// Add global properties for backwards compatibility
app.config.globalProperties.t = t
app.config.globalProperties.n = n
app.config.globalProperties.OC = OC
app.config.globalProperties.OCA = OCA

// Use plugins
app.use(pinia)
app.use(router)
app.use(vuetwemoji, {
	baseUrl: OC.linkTo('social', 'img/'),
	extension: '.svg',
	className: 'emoji',
	size: 'twemoji',
})
app.use(VueMasonry)

// Mount the app
app.mount('#content')

/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// eslint-disable-next-line
import ProfilePageIntegration from './views/ProfilePageIntegration.vue' 
import { createApp } from 'vue'
import { generateFilePath } from '@nextcloud/router'
import { translate, translatePlural } from '@nextcloud/l10n'

// eslint-disable-next-line
__webpack_nonce__ = btoa(OC.requestToken)
// eslint-disable-next-line
__webpack_public_path__ = generateFilePath('social', '', 'js/')

if (OCA?.Core?.ProfileSections) {
	OCA.Core.ProfileSections.registerSection((el, userId) => {
		const app = createApp(ProfilePageIntegration)
		app.config.globalProperties.t = translate
		app.config.globalProperties.n = translatePlural
		app.config.globalProperties.OC = OC
		app.config.globalProperties.OCA = OCA
		app.mount(el)
		return app._instance
	})
}

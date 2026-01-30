/**
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { createStore } from 'vuex'
import timeline from './timeline.js'
import account from './account.js'
import settings from './settings.js'

const debug = process.env.NODE_ENV !== 'production'

export default createStore({
	modules: {
		timeline,
		account,
		settings,
	},
	strict: debug,
})

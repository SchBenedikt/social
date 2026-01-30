<!--
  - SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div class="social__timeline">
		<EmptyContent v-if="timeline.length === 0 && emptyContentData.title !== ''" :item="emptyContentData" />
		<transition-group v-else name="list" tag="ul">
			<TimelineEntry v-for="entry in timeline"
				:key="entry.id"
				:item="entry"
				:type="type" />
		</transition-group>
		<div v-if="loading" class="timeline-spinner">
			<NcLoadingIcon :size="40" />
		</div>
		<button v-if="timeline.length > 0 && !loading" class="load-more-btn" @click="loadMore">
			{{ t('social', 'Load more') }}
		</button>
	</div>
</template>

<script>
import { showError } from '@nextcloud/dialogs'
import NcLoadingIcon from '@nextcloud/vue/dist/Components/NcLoadingIcon.js'
import { translate } from '@nextcloud/l10n'

import TimelineEntry from './TimelineEntry.vue'
import CurrentUserMixin from './../mixins/currentUserMixin.js'
import EmptyContent from './EmptyContent.vue'
import logger from '../services/logger.js'

export default {
	name: 'TimelineList',
	components: {
		TimelineEntry,
		EmptyContent,
		NcLoadingIcon,
	},
	mixins: [CurrentUserMixin],
	props: {
		type: {
			type: String,
			default: () => 'home',
		},
		showParents: {
			type: Boolean,
			default: false,
		},
		reverseOrder: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			infoHidden: false,
			state: [],
			intervalId: -1,
			loading: false,
			emptyContent: {
				default: {
					image: 'img/undraw/posts.svg',
					title: translate('social', 'No posts found'),
					description: translate('social', 'Posts from people you follow will show up here'),
				},
				direct: {
					image: 'img/undraw/direct.svg',
					title: translate('social', 'No direct messages found'),
					description: translate('social', 'Posts directed to you will show up here'),
				},
				timeline: {
					image: 'img/undraw/local.svg',
					title: translate('social', 'No local posts found'),
					description: translate('social', 'Posts from other people on this instance will show up here'),
				},
				notifications: {
					image: 'img/undraw/notifications.svg',
					title: translate('social', 'No notifications found'),
					description: translate('social', 'You have not received any notifications yet'),
				},
				federated: {
					image: 'img/undraw/global.svg',
					title: translate('social', 'No global posts found'),
					description: translate('social', 'Posts from federated instances will show up here'),
				},
				favourites: {
					image: 'img/undraw/likes.svg',
					title: translate('social', 'No liked posts found'),
				},
				profile: {
					image: 'img/undraw/profile.svg',
					title: translate('social', 'You have not tooted yet'),
				},
				tags: {
					image: 'img/undraw/profile.svg',
					title: translate('social', 'No posts found for this tag'),
				},
				'single-post': {
					title: this.showParents ? '' : translate('social', 'No replies found'),
				},
			},
		}
	},
	computed: {
		emptyContentData() {
			if (typeof this.emptyContent[this.$route.params.type] !== 'undefined') {
				return this.emptyContent[this.$route.params.type]
			}

			if (typeof this.emptyContent[this.$route.name] !== 'undefined') {
				const content = this.emptyContent[this.$route.name]
				// Change text on profile page when accessed by another user or a public (non-authenticated) user
				if (this.$route.name === 'profile' && (this.serverData.public || this.$route.params.account !== this.currentUser.uid)) {
					content.title = this.$route.params.account + ' ' + t('social', 'hasn\'t tooted yet')
				}
				return this.$route.name === 'timeline' ? this.emptyContent.default : content
			}

			// Fallback
			logger.log('Did not find any empty content for this route', { routeType: this.$route.params.type, routeName: this.$route.name })
			return this.emptyContent.default
		},

		/**
		 * @return {import('../types/Mastodon').Status[]}
		 */
		timeline() {
			/** @type {import('../types/Mastodon').Status[]} */
			let timeline = []

			if (this.showParents) {
				timeline = this.$store.getters.getParentsTimeline
			} else {
				timeline = this.$store.getters.getTimeline
			}

			if (this.reverseOrder) {
				return timeline.reverse()
			} else {
				return timeline
			}
		},
	},
	mounted() {
		this.intervalId = setInterval(() => this.fetchNewStatuses(), 30 * 1000)
	},
	destroyed() {
		clearInterval(this.intervalId)
	},
	methods: {
		t: translate,
		async loadMore() {
			const params = {
				account: this.currentUser.uid,
			}

			if (this.timeline.length !== 0) {
				if (this.reverseOrder) {
					params.min_id = Number.parseInt(this.timeline[0].id)
				} else {
					params.max_id = Number.parseInt(this.timeline[this.timeline.length - 1].id)
				}
			}

			try {
				this.loading = true
				await this.$store.dispatch('fetchTimeline', params)
			} catch (error) {
				showError('Failed to load more timeline entries')
				logger.error('Failed to load more timeline entries', { error })
			} finally {
				this.loading = false
			}
		},
		async fetchNewStatuses() {
			// No need to load new parents as they will not change.
			if (this.showParents) {
				return
			}

			try {
				const response = await this.$store.dispatch('fetchTimeline', {
					account: this.currentUser.uid,
					min_id: this.timeline[0]?.id,
				})

				if (response.length > 0) {
					this.fetchNewStatuses()
				}
			} catch (error) {
				showError('Failed to load newer timeline entries')
				logger.error('Failed to load newer timeline entries', { error })
			}
		},
	},
}
</script>

<style scoped>
.list-enter-active, .list-leave-active {
	transition: all .5s;
}

.list-enter {
	opacity: 0;
	transform: translateY(-30px);
}

.list-leave-to {
	opacity: 0;
	transform: translateX(-100px);
}

.timeline-spinner {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 2rem;
}

.load-more-btn {
	display: block;
	margin: 1rem auto;
	padding: 0.75rem 1.5rem;
	background-color: var(--color-primary);
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-size: 1rem;

	&:hover {
		background-color: var(--color-primary-hover);
	}
}
</style>

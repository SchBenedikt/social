/**
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { createRouter, createWebHistory } from 'vue-router'
import { generateUrl } from '@nextcloud/router'

// Dynamic loading
const Timeline = () => import('./views/Timeline.vue')
const TimelineSinglePost = () => import('./views/TimelineSinglePost.vue')
const Profile = () => import(/* webpackChunkName: "profile" */'./views/Profile.vue')
const ProfileTimeline = () => import(/* webpackChunkName: "profile" */'./views/ProfileTimeline.vue')
const ProfileFollowers = () => import(/* webpackChunkName: "profile" */'./views/ProfileFollowers.vue')

const routes = [
	{
		path: '/:index(index.php/)?apps/social/',
		redirect: { name: 'timeline' },
	},
	{
		path: '/:index(index.php/)?apps/social/timeline/:type?',
		components: {
			default: Timeline,
		},
		props: true,
		name: 'timeline',
		children: [
			{
				path: 'tags/:tag',
				name: 'tags',
			},
		],
	},
	{
		path: '/:index(index.php/)?apps/social/@:account',
		components: {
			default: Profile,
			details: ProfileTimeline,
		},
		props: true,
		children: [
			{
				path: '',
				name: 'profile',
				components: {
					details: ProfileTimeline,
				},
			},
			{
				path: 'followers',
				name: 'profile.followers',
				components: {
					details: ProfileFollowers,
				},
			},
			{
				path: 'following',
				name: 'profile.following',

				components: {
					details: ProfileFollowers,
				},
			},
		],
	},
	{
		path: '/:index(index.php/)?apps/social/@:account/:id',
		components: {
			default: TimelineSinglePost,
		},
		props: true,
		name: 'single-post',
	},
	{
		path: '/:index(index.php/)?apps/social/ostatus/follow',
		components: {
			default: Profile,
			details: ProfileTimeline,
		},
		props: true,
	},
]

export default createRouter({
	history: createWebHistory(generateUrl('')),
	routes,
	linkActiveClass: 'active',
})

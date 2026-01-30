<!--
  - SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div class="file-attachment-preview">
		<div class="file-attachment-preview__icon">
			<FileDocument :size="48" />
		</div>
		<div class="file-attachment-preview__info">
			<div class="file-attachment-preview__name">
				{{ fileName }}
			</div>
			<div class="file-attachment-preview__meta">
				{{ fileSize }}
			</div>
		</div>
		<div class="file-attachment-preview__actions">
			<NcButton type="tertiary"
				:aria-label="t('social', 'Delete attachment')"
				@click="$emit('delete')">
				<template #icon>
					<Close :size="20" />
				</template>
			</NcButton>
		</div>
	</div>
</template>

<script>
import Close from 'vue-material-design-icons/Close.vue'
import FileDocument from 'vue-material-design-icons/FileDocument.vue'
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import { translate } from '@nextcloud/l10n'

export default {
	name: 'FileAttachmentPreview',
	components: {
		Close,
		FileDocument,
		NcButton,
	},
	props: {
		fileName: {
			type: String,
			required: true,
		},
		fileSize: {
			type: String,
			default: '',
		},
		fileType: {
			type: String,
			default: 'unknown',
		},
	},
	emits: ['delete'],
	methods: {
		t: translate,
	},
}
</script>

<style scoped lang="scss">
.file-attachment-preview {
	display: flex;
	align-items: center;
	padding: 12px;
	height: 100%;
	background: var(--color-background-darker);
	border-radius: var(--border-radius-large);
	gap: 12px;

	&__icon {
		flex-shrink: 0;
		color: var(--color-text-maxcontrast);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	&__info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	&__name {
		font-weight: bold;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--color-main-text);
	}

	&__meta {
		font-size: 0.9em;
		color: var(--color-text-maxcontrast);
	}

	&__actions {
		flex-shrink: 0;
	}
}
</style>

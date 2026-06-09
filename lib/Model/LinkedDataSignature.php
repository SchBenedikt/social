<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Social\Model;

use JsonSerializable;
use OCA\Social\Exceptions\LinkedDataSignatureMissingException;
use OCA\Social\Model\ActivityPub\ACore;
use OCA\Social\Service\SignatureService;
use OCA\Social\Tools\Traits\TArrayTools;

/**
 * Class LinkedDataSignature
 *
 * @package OCA\Social\Model
 */
class LinkedDataSignature implements JsonSerializable {
	use TArrayTools;

	private string $type = '';
	private string $creator = '';
	private string $created = '';
	private string $nonce = '';
	private string $signatureValue = '';
	private string $privateKey = '';
	private string $publicKey = '';
	private array $object = [];

	public function getType(): string {
		return $this->type;
	}

	public function setType(string $type): LinkedDataSignature {
		$this->type = $type;

		return $this;
	}

	public function getCreator(): string {
		return $this->creator;
	}

	public function setCreator(string $creator): LinkedDataSignature {
		$this->creator = $creator;

		return $this;
	}

	public function getNonce(): string {
		return $this->nonce;
	}

	public function setNonce(string $nonce): LinkedDataSignature {
		$this->nonce = $nonce;

		return $this;
	}

	public function getCreated(): string {
		return $this->created;
	}

	public function setCreated(string $created): LinkedDataSignature {
		$this->created = $created;

		return $this;
	}

	public function getSignatureValue(): string {
		return $this->signatureValue;
	}

	public function setSignatureValue(string $signatureValue): LinkedDataSignature {
		$this->signatureValue = $signatureValue;

		return $this;
	}

	public function getPrivateKey(): string {
		return $this->privateKey;
	}

	public function setPrivateKey(string $privateKey): self {
		$this->privateKey = $privateKey;

		return $this;
	}

	public function setPublicKey(string $publicKey): self {
		$this->publicKey = $publicKey;

		return $this;
	}

	public function getObject(): array {
		return $this->object;
	}

	public function setObject(array $object): self {
		$this->object = $object;

		return $this;
	}

	/**
	 * @throws LinkedDataSignatureMissingException
	 */
	public function sign() {
		$header = [
			'@context' => 'https://w3id.org/identity/v1',
			'creator' => $this->getCreator(),
			'created' => $this->getCreated()
		];

		$hash = $this->hashedCanonicalize($header) . $this->hashedCanonicalize($this->getObject());

		$algo = OPENSSL_ALGO_SHA256;
		if ($this->getType() === 'RsaSignature2017') {
			$algo = OPENSSL_ALGO_SHA256;
		}

		if (!openssl_sign($hash, $signed, $this->getPrivateKey(), $algo)) {
			throw new LinkedDataSignatureMissingException();
		}

		$this->setSignatureValue(base64_encode($signed));
	}

	public function verify(): bool {
		$header = [
			'@context' => 'https://w3id.org/identity/v1',
			'nonce' => $this->getNonce(),
			'creator' => $this->getCreator(),
			'created' => $this->getCreated()
		];

		$hashHeader = $this->hashedCanonicalize($header, true);
		$hashObject = $this->hashedCanonicalize($this->getObject());

		$algo = OPENSSL_ALGO_SHA256;
		if ($this->getType() === 'RsaSignature2017') {
			$algo = OPENSSL_ALGO_SHA256;
		}

		$signed = base64_decode($this->getSignatureValue());
		if ($signed !== false
			&& openssl_verify($hashHeader . $hashObject, $signed, $this->publicKey, $algo) === 1) {
			return true;
		}

		return false;
	}

	private function hashedCanonicalize(array $data, bool $removeEmptyValue = false): string {
		if ($removeEmptyValue) {
			$this->cleanArray($data);
		}

		$object = json_decode(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
		$res = jsonld_normalize(
			$object,
			[
				'algorithm' => 'URDNA2015',
				'format' => 'application/nquads',
				'documentLoader' => [SignatureService::class, 'documentLoader']
			]
		);

		return hash('sha256', $res);
	}


	/**
	 * @throws LinkedDataSignatureMissingException
	 */
	public function import(array $data): void {
		// Strip dangerous JSON-LD keywords that can restructure the graph
		// to prevent graph manipulation attacks (@graph, @reverse, @included)
		unset($data['@graph'], $data['@reverse'], $data['@included']);

		if (!$this->hasValidContext($data)) {
			throw new LinkedDataSignatureMissingException(
				'no valid @context in signed object'
			);
		}

		$signature = $this->getArray('signature', $data, []);
		if ($signature === []) {
			throw new LinkedDataSignatureMissingException('missing signature');
		}

		$this->setType($this->get('type', $signature, ''));
		$this->setCreator($this->get('creator', $signature, ''));
		$this->setNonce($this->get('nonce', $signature, ''));
		$this->setCreated($this->get('created', $signature, ''));
		$this->setSignatureValue($this->get('signatureValue', $signature, ''));

		unset($data['signature']);

		$this->setObject($data);
	}


	/**
	 * @param array $data
	 *
	 * @return bool
	 */
	private function hasValidContext(array $data): bool {
		if (!array_key_exists('@context', $data)) {
			return false;
		}

		$contexts = $data['@context'];
		if (is_string($contexts)) {
			$contexts = [$contexts];
		}

		if (!is_array($contexts)) {
			return false;
		}

		return in_array(ACore::CONTEXT_ACTIVITYSTREAMS, $contexts, true)
			|| in_array(ACore::CONTEXT_SECURITY, $contexts, true);
	}


	/**
	 * @return array
	 */
	public function jsonSerialize(): array {
		return [
			'type' => $this->getType(),
			'creator' => $this->getCreator(),
			'created' => $this->getCreated(),
			'signatureValue' => $this->getSignatureValue()
		];
	}
}

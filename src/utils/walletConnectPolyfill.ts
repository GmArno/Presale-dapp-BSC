// Add these lines at the VERY TOP of your existing file
import { Buffer } from 'buffer';
window.Buffer = Buffer;
window.process = require('process/browser');


// src/utils/walletConnectPolyfill.ts
export {}; // Make this file a module

// Minimal type declarations we need
type AlgorithmIdentifier = string | { name: string };
type BufferSource = ArrayBufferView | ArrayBuffer;
type KeyUsage = 'encrypt' | 'decrypt' | 'sign' | 'verify' | 'deriveKey' | 'deriveBits' | 'wrapKey' | 'unwrapKey';
type KeyType = 'secret' | 'private' | 'public';

interface MinimalKeyAlgorithm {
  name: string;
}

interface MinimalCryptoKey {
  readonly algorithm: MinimalKeyAlgorithm;
  readonly extractable: boolean;
  readonly type: KeyType;
  readonly usages: KeyUsage[];
}

interface MinimalSubtleCrypto {
  digest(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer>;
  importKey(
    format: string,
    keyData: BufferSource | JsonWebKey,
    algorithm: AlgorithmIdentifier,
    extractable: boolean,
    keyUsages: KeyUsage[]
  ): Promise<MinimalCryptoKey>;
  encrypt(
    algorithm: AlgorithmIdentifier,
    key: MinimalCryptoKey,
    data: BufferSource
  ): Promise<ArrayBuffer>;
  sign(
    algorithm: AlgorithmIdentifier,
    key: MinimalCryptoKey,
    data: BufferSource
  ): Promise<ArrayBuffer>;
}

interface MinimalCrypto {
  subtle: MinimalSubtleCrypto;
  getRandomValues<T extends ArrayBufferView | null>(array: T): T;
  randomUUID?(): string;
}

// Implementation class
class SimpleSubtle implements MinimalSubtleCrypto {
  private crypto = require('crypto');

  async digest(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer> {
    const hash = this.crypto.createHash('sha256');
    hash.update(Buffer.from(data as ArrayBuffer));
    return new Uint8Array(hash.digest()).buffer;
  }

  async importKey(
    format: string,
    keyData: BufferSource | JsonWebKey,
    algorithm: AlgorithmIdentifier,
    extractable: boolean,
    keyUsages: KeyUsage[]
  ): Promise<MinimalCryptoKey> {
    return {
      algorithm: { name: typeof algorithm === 'string' ? algorithm : algorithm.name },
      extractable,
      type: 'secret',
      usages: keyUsages
    };
  }

  async encrypt(
    algorithm: AlgorithmIdentifier,
    key: MinimalCryptoKey,
    data: BufferSource
  ): Promise<ArrayBuffer> {
    return new ArrayBuffer(0);
  }

  async sign(
    algorithm: AlgorithmIdentifier,
    key: MinimalCryptoKey,
    data: BufferSource
  ): Promise<ArrayBuffer> {
    const hmac = this.crypto.createHmac('sha256', 'default-key');
    hmac.update(Buffer.from(data as ArrayBuffer));
    return new Uint8Array(hmac.digest()).buffer;
  }
}

// Polyfill implementation
if (typeof window !== 'undefined' && !window.crypto?.subtle) {
  const crypto = require('crypto');
  
  const customCrypto: MinimalCrypto = {
    subtle: new SimpleSubtle(),
    getRandomValues: <T extends ArrayBufferView | null>(array: T): T => {
      if (array) {
        const bytes = crypto.randomBytes(array.byteLength);
        new Uint8Array(array.buffer).set(bytes);
      }
      return array;
    }
  };

  // Add randomUUID if available
  if (crypto.randomUUID) {
    customCrypto.randomUUID = () => crypto.randomUUID();
  }

  // Type assertion to avoid full Crypto implementation
  Object.defineProperty(window, 'crypto', {
    value: customCrypto as Crypto,
    writable: true,
    configurable: true
  });
}
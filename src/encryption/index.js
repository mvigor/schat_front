import { box, randomBytes } from 'tweetnacl';
import {
  decodeUTF8,
  encodeUTF8,
  encodeBase64,
  decodeBase64
} from 'tweetnacl-util';

export const sharedA = (privateKey,roomPublic) => box.before(roomPublic,privateKey);
export const sharedB = (publicKey,roomPrivate)  => box.before(publicKey,roomPrivate);

export const decodeKey = (key) => decodeBase64(key);

const newNonce = () => randomBytes(box.nonceLength);
export const generateKeyPair = () => box.keyPair();
export const generateKeyPairJson = () => {
  const pair = box.keyPair();
  return {
    publicKey: encodeBase64( pair.publicKey ),
    secretKey: encodeBase64( pair.secretKey )
  }
}


export const encrypt = (secretOrSharedKey, text) => {
  const nonce = newNonce();
  const messageUint8 = decodeUTF8(text);
  const encrypted = box.after(messageUint8, nonce, secretOrSharedKey);

  const fullMessage = new Uint8Array(nonce.length + encrypted.length);
  fullMessage.set(nonce);
  fullMessage.set(encrypted, nonce.length);

  const base64FullMessage = encodeBase64(fullMessage);
  return base64FullMessage;
};

export const decrypt = ( secretOrSharedKey, messageWithNonce ) => {

  const messageWithNonceAsUint8Array = decodeBase64(messageWithNonce);
  const nonce = messageWithNonceAsUint8Array.slice(0, box.nonceLength);
  const message = messageWithNonceAsUint8Array.slice(
    box.nonceLength,
    messageWithNonce.length
  );

  const decrypted = box.open.after(message, nonce, secretOrSharedKey);

  if (!decrypted) {
    console.log('Could not decrypt message');

  }

  const base64DecryptedMessage = encodeUTF8(decrypted);
  return base64DecryptedMessage;
};

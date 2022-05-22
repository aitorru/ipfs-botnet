import fs from 'fs';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

/**
 * Function that encrypts a message and returns base 64 encrypted message.
 * @param msg Input to be encrypted.
 * @returns Encrypted msg.
 */
export function encrypt (msg: string) {
  const privateKey = fs.readFileSync('pvkey.key').toString();
  const signedMessage = nacl.sign(
    naclUtil.decodeUTF8(msg),
    naclUtil.decodeBase64(privateKey)
  );
  return naclUtil.encodeBase64(signedMessage);
}
/**
 * Function that decrypts an input.
 * @param payload Input to be decrypted.
 * @returns Result or null if it fails.
 */
export function decrypt (payload: string): string | null {
  const signedMessage = naclUtil.decodeBase64(payload);
  const publicKey = fs.readFileSync('pbkey.key').toString();
  const messageVerified = nacl.sign.open(
    signedMessage, 
    naclUtil.decodeBase64(publicKey)
  );
  if (messageVerified === null) return null;
  return naclUtil.encodeUTF8(messageVerified);
}
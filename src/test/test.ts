import {expect} from 'chai';
import { existsSync } from 'fs';
import {decrypt, encrypt} from '../utils/crypt';

describe('Crypto tests', () => {
  it('Keys should exists', () => {
    expect(existsSync('pbkey.key'));
    expect(existsSync('pvkey.key'));
  });
  it('Signign and recovering should work', () => {
    const encryptedResult = encrypt('ipfs');
    const decryptedresult = decrypt(encryptedResult);
    expect(decryptedresult === 'ipfs');
  });
});
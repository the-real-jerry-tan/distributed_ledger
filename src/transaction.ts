/**
 * © 2024 Jerry Tan. All Rights Reserved.
 *
 * This software is the confidential and proprietary information of Jerry Tan
 * ("Confidential Information"). You shall not disclose such Confidential Information
 * and shall use it only in accordance with the terms under which this software
 * was distributed or otherwise published, and solely for the prior express purposes
 * explicitly communicated and agreed upon, and only for those specific permissible purposes.
 *
 * This software is provided "AS IS," without a warranty of any kind. All express or implied
 * conditions, representations, and warranties, including any implied warranty of merchantability,
 * fitness for a particular purpose, or non-infringement, are disclaimed, except to the extent
 * that such disclaimers are held to be legally invalid.
 */

import * as crypto from 'crypto';

export class Transaction {
    public fromAddress: string | null;
    public toAddress: string;
    public amount: number;
    public timestamp: Date;
    public signature: string;

    constructor(fromAddress: string | null, toAddress: string, amount: number) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timestamp = new Date();
        this.signature = '';
    }

    // Sign the transaction
    signTransaction(signingKey: crypto.KeyObject) {
        if (signingKey.export({ type: 'pkcs1', format: 'pem' }).includes(this.fromAddress || '')) {
            const hashTx = this.calculateHash();
            const sign = crypto.createSign('SHA256');
            sign.update(hashTx).end();

            this.signature = sign.sign(signingKey, 'hex');
        } else {
            throw new Error('You cannot sign transactions for other wallets!');
        }
    }

    // Calculate the hash of the transaction
    calculateHash(): string {
        return crypto
            .createHash('sha256')
            .update(this.fromAddress + this.toAddress + this.amount + this.timestamp)
            .digest('hex');
    }

    // Check if the transaction is valid
    isValid(): boolean {
        if (this.fromAddress === null) return true; // Mining rewards

        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }

        const verify = crypto.createVerify('SHA256');
        verify.update(this.calculateHash());

        return verify.verify(this.fromAddress, this.signature, 'hex');
    }
}

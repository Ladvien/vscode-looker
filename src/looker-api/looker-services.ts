import * as vscode from 'vscode';
import { Keytar } from '../utils/keytar';

// TODO: Move constants to package.json.


export interface LookerApiCredentials {
    lookerId: String;
    lookerSecret: String;
    lookerServerUrl: String;
    lookerServerPort: String;
}

export enum LookerCredentialKeys {
    serviceKey = 'Looker',
    accountKey = 'Id',
    secretKey = 'Secret',
    lookerUrlKey = 'Looker Server URL',
    lookerServerPortKey = 'Looker Server Port'
}

export class LookerServices {

    private apiCredentials: LookerApiCredentials;

    public constructor() {
        this.apiCredentials = {
            'lookerId': '',
            'lookerSecret': '',
            'lookerServerUrl': '',
            'lookerServerPort': ''
        };
    }

    private storeCredentials(credentialType: string, credential: String) {
        return new Promise(async function(resolve, reject) {
            let keytar = Keytar.tryCreate();
            if (keytar) {
                await keytar.setPassword(LookerCredentialKeys.serviceKey, credentialType, credential.toString());
                if (credential) {
                    resolve({'success': `Looker ${credentialType} stored succesfully.`});
                } else {
                    reject({'error': `Could not store ${credentialType}`});
                }
            } else {
                reject({'error': 'Keytar not found.  Unable to securely manage API credentials.'});
            }
        });		
    }

    public saveApiCredentials(apiCredentials: LookerApiCredentials) {
        return new Promise(async (resolve, reject) => {
            await this.storeCredentials(LookerCredentialKeys.accountKey, apiCredentials.lookerId)
            .then((value: any) => {
                if (!value['success']) {
                    reject(value['success']);
                }
            }).catch((reason) => {
                reject(reason['error']);
            });
            await this.storeCredentials(LookerCredentialKeys.secretKey, apiCredentials.lookerSecret)
            .then((value: any) => {
                if (!value['success']) {
                    reject(value['success']);
                }
            }).catch((reason) => {
                reject(reason['error']);
            });
            await this.storeCredentials(LookerCredentialKeys.lookerUrlKey, apiCredentials.lookerServerUrl)
            .then((value: any) => {
                if (!value['success']) {
                    reject(value['success']);
                }
            }).catch((reason) => {
                reject(reason['error']);
            });
            await this.storeCredentials(LookerCredentialKeys.lookerServerPortKey, apiCredentials.lookerServerPort)
            .then((value: any) => {
                if (!value['success']) {
                    reject(value['success']);
                }
            }).catch((reason) => {
                reject(reason['error']);
            });


            this.getLookerAPICredentials().then((apiCredentials) => {
                if (apiCredentials) {
                    this.apiCredentials = apiCredentials;
                    resolve({'success': 'Credentials saved and retrieved'});
                } else {
                    reject({'error': 'Unable to retrieve API credentials'});
                }
            }).catch((reason) => {
                reject(reason['error']);
            });
        });
    }
    
    public getLookerAPICredentials() {
        return new Promise<LookerApiCredentials>(async function(resolve, reject) {
            let keytar = Keytar.tryCreate();

            const apiCredentials: LookerApiCredentials = {
                'lookerId': '',
                'lookerSecret': '',
                'lookerServerUrl': '',
                'lookerServerPort': ''
            };

            if (keytar){
                await keytar.getPassword(LookerCredentialKeys.serviceKey, LookerCredentialKeys.accountKey).then((result) => {
                    apiCredentials.lookerId = result || '';
                    if (apiCredentials.lookerId === '') {
                        reject({'error': `Unable to retrieve `});
                    }
                });
                await keytar.getPassword(LookerCredentialKeys.serviceKey, LookerCredentialKeys.secretKey).then((result) => {
                    apiCredentials.lookerSecret = result || '';
                    if (apiCredentials.lookerSecret === '') {
                        reject({'error': 'Unable to retrieve Looker API Secret.'});
                    }
                });
                await keytar.getPassword(LookerCredentialKeys.serviceKey, LookerCredentialKeys.lookerUrlKey).then((result) => {
                    apiCredentials.lookerServerUrl = result || '';
                    if (apiCredentials.lookerServerUrl === '') {
                        reject({'error': 'Unable to retrieve Looker API Secret.'});
                    }
                });
                await keytar.getPassword(LookerCredentialKeys.serviceKey, LookerCredentialKeys.lookerServerPortKey).then((result) => {
                    apiCredentials.lookerServerPort = result || '';
                    if (apiCredentials.lookerServerPort === '') {
                        reject({'error': 'Unable to retrieve Looker API Secret.'});
                    }
                });
                resolve(apiCredentials);
            }
        });
    }
}


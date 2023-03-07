import { IBlockchain } from './blockchains.interface'

export interface IGenerateAddress {
  mnemonic: string
  deriveIndex: number | null | undefined
}

export interface IGetBalance {
  address: string
}

export interface IGetBalanceResponse {
  balance: number
}

export interface IGenerateAddressResponse {
  address: string
  privateKey: string
}

export interface IRestoreAddressFromPrivateKey {
  privateKey: string
}

export interface IRestoreAddressFromPrivateKeyResponse {
  address: string
}

export interface ITransfer {
  fromPrivateKey: string
  toAddress: string
  amount: number
}

export interface ITransferResponse {
  transactionId: string
}

export interface IWallet {
  generateAddress: ({}: IGenerateAddress) =>
    | Promise<IGenerateAddressResponse>
    | IGenerateAddressResponse
  restoreAddressFromPrivateKey: ({}: IRestoreAddressFromPrivateKey) =>
    | Promise<IRestoreAddressFromPrivateKeyResponse>
    | IRestoreAddressFromPrivateKeyResponse
  getBalance: ({}: IGetBalance) => Promise<IGetBalanceResponse>
  transfer: ({}: ITransfer) => Promise<ITransferResponse>
}

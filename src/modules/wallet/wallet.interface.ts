import { IBlockchain } from '@localTypes/blockchains.interface'
import {
  IGenerateAddress,
  IGenerateAddressResponse,
  IGetBalance,
  IGetBalanceResponse,
  IRestoreAddressFromPrivateKey,
  IRestoreAddressFromPrivateKeyResponse,
  ITransfer,
  ITransferResponse
} from '@localTypes/wallet.interface'

export interface IWallet {
  generateAddress: (
    {}: IBlockchain,
    {}: IGenerateAddress
  ) => Promise<IGenerateAddressResponse> | IGenerateAddressResponse
  restoreAddressFromPrivateKey: (
    {}: IBlockchain,
    {}: IRestoreAddressFromPrivateKey
  ) =>
    | Promise<IRestoreAddressFromPrivateKeyResponse>
    | IRestoreAddressFromPrivateKeyResponse
  getBalance: ({}: IBlockchain, {}: IGetBalance) => Promise<IGetBalanceResponse>
  transfer: ({}: IBlockchain, {}: ITransfer) => Promise<ITransferResponse>
}

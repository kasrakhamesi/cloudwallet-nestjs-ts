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
import { IBlockchain } from '@localTypes/blockchains.interface'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { EthereumService } from '@packages/ethereum/ethereum.service'
import { IWallet } from './wallet.interface'
const bip39 = require('bip39')

@Injectable()
export class WalletService implements IWallet {
  constructor(private readonly ethereumService: EthereumService) {}
  public async generateAddress(
    blockchain: IBlockchain,
    { mnemonic, deriveIndex }: IGenerateAddress
  ): Promise<IGenerateAddressResponse> {
    if (!bip39.validateMnemonic(mnemonic))
      throw new HttpException('Invalid mnemonic', HttpStatus.BAD_REQUEST)
    return this[`${blockchain}Service`].generateAddress({
      mnemonic,
      deriveIndex
    })
  }

  public async restoreAddressFromPrivateKey(
    blockchain: IBlockchain,
    { privateKey }: IRestoreAddressFromPrivateKey
  ): Promise<IRestoreAddressFromPrivateKeyResponse> {
    return this[`${blockchain}Service`].restoreAddressFromPrivateKey({
      privateKey
    })
  }

  public async getBalance(
    blockchain: IBlockchain,
    { address }: IGetBalance
  ): Promise<IGetBalanceResponse> {
    return this[`${blockchain}Service`].getBalance({ address })
  }

  public async transfer(
    blockchain: IBlockchain,
    { fromPrivateKey, toAddress, amount }: ITransfer
  ): Promise<ITransferResponse> {
    return this[`${blockchain}Service`].transfer({
      fromPrivateKey,
      toAddress,
      amount
    })
  }
}

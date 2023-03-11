import {
  IGenerateAddress,
  IGenerateAddressResponse,
  IGetBalance,
  IGetBalanceResponse,
  IRestoreAddressFromPrivateKey,
  IRestoreAddressFromPrivateKeyResponse,
  ITransactions,
  ITransactionsResponse,
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

  public async generateMnemonic(): Promise<string> {
    return await bip39.generateMnemonic()
  }

  public async generateAddress(
    blockchain: IBlockchain,
    { mnemonic, deriveIndex }: IGenerateAddress
  ): Promise<IGenerateAddressResponse> {
    if (!bip39.validateMnemonic(mnemonic))
      throw new HttpException('Invalid mnemonic', HttpStatus.BAD_REQUEST)
    return await this[
      `${blockchain?.blockchain || blockchain}Service`
    ].generateAddress({
      mnemonic,
      deriveIndex
    })
  }

  public async restoreAddressFromPrivateKey(
    blockchain: IBlockchain,
    { privateKey }: IRestoreAddressFromPrivateKey
  ): Promise<IRestoreAddressFromPrivateKeyResponse> {
    return await this[`${blockchain}Service`].restoreAddressFromPrivateKey({
      privateKey
    })
  }

  public async getBalance(
    blockchain: IBlockchain,
    { address, contract }: IGetBalance
  ): Promise<IGetBalanceResponse> {
    return await this[`${blockchain}Service`].getBalance({ address, contract })
  }

  public async transfer(
    blockchain: IBlockchain,
    { fromPrivateKey, toAddress, value, contract, chain }: ITransfer
  ): Promise<ITransferResponse> {
    return await this[`${blockchain}Service`].transfer({
      fromPrivateKey,
      toAddress,
      value,
      contract,
      chain
    })
  }
  public async transactions(
    blockchain: IBlockchain,
    { address, contract }: ITransactions
  ): Promise<ITransactionsResponse> {
    return await this[`${blockchain}Service`].transactions({
      address,
      contract
    })
  }
}

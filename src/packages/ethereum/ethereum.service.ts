import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import ethereumWallet, { hdkey } from 'ethereumjs-wallet'
import {
  IGenerateAddressResponse,
  IGenerateAddress,
  IWallet,
  IRestoreAddressFromPrivateKey,
  IRestoreAddressFromPrivateKeyResponse,
  IGetBalance,
  IGetBalanceResponse,
  ITransfer,
  ITransferResponse
} from '@localTypes/wallet.interface'
import Web3 from 'web3'
const bip39 = require('bip39')

@Injectable()
export class EthereumService implements IWallet {
  private web3 = new Web3('http://75.119.132.41:8545')

  public async generateAddress({
    mnemonic,
    deriveIndex = 0
  }: IGenerateAddress): Promise<IGenerateAddressResponse> {
    try {
      const seed = await bip39.mnemonicToSeed(mnemonic)
      const hdwallet = hdkey.fromMasterSeed(seed)
      const path = `m/44'/60'/0'/0/${deriveIndex}`
      const wallet = hdwallet.derivePath(path).getWallet()
      const address = wallet.getChecksumAddressString()
      const privateKey = wallet.getPrivateKeyString()
      return {
        address,
        privateKey
      }
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST)
    }
  }
  public restoreAddressFromPrivateKey({
    privateKey
  }: IRestoreAddressFromPrivateKey): IRestoreAddressFromPrivateKeyResponse {
    try {
      const prvBuffer =
        privateKey.length > 65
          ? Buffer.from(privateKey.substring(2, 66), 'hex')
          : Buffer.from(privateKey, 'hex')
      const keyPair = ethereumWallet.fromPrivateKey(prvBuffer)
      const address = keyPair.getChecksumAddressString()
      return {
        address
      }
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST)
    }
  }
  public async getBalance({
    address
  }: IGetBalance): Promise<IGetBalanceResponse> {
    try {
      const value = await this.web3.eth.getBalance(address)
      const balance = parseFloat(this.web3.utils.fromWei(value, 'ether'))
      return {
        balance
      }
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST)
    }
  }
  public async transfer({
    fromPrivateKey,
    toAddress,
    amount
  }: ITransfer): Promise<ITransferResponse> {
    try {
      const from = this.restoreAddressFromPrivateKey({
        privateKey: fromPrivateKey
      })
      const nonce = await this.web3.eth.getTransactionCount(
        from.address,
        'pending'
      )

      const value = this.web3.utils.toHex(
        this.web3.utils.toWei(amount.toString(), 'ether')
      )

      const maxFee = this.web3.utils.toHex(
        this.web3.utils.toWei(Number(100).toString(), 'gwei')
      )

      const maxPriorityFee = this.web3.utils.toHex(
        this.web3.utils.toWei(Number(3).toString(), 'gwei')
      )

      const gasLimit = await this.estimateGas(
        from.address,
        toAddress,
        '0x',
        value,
        maxFee,
        maxPriorityFee
      )

      const txParams = {
        nonce: nonce,
        chainId: 1,
        type: 2,
        value: value,
        gasLimit: gasLimit?.data,
        maxFeePerGas: maxFee,
        maxPriorityFeePerGas: maxPriorityFee,
        to: toAddress
      }

      const rawTransaction = await this.web3.eth.accounts.signTransaction(
        txParams,
        fromPrivateKey
      )

      const transactionResult = await this.web3.eth.sendSignedTransaction(
        rawTransaction?.rawTransaction
      )

      return {
        transactionId: transactionResult?.transactionHash
      }
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST)
    }
  }

  // utils
  private estimateGas = async (
    from: string,
    to: string,
    data: string | null | undefined,
    value: string | number,
    maxFeePerGas: string | number,
    maxPriorityFeePerGas: string | number
  ) => {
    try {
      const estimateGas = await this.web3.eth.estimateGas({
        from,
        to,
        value,
        data,
        maxFeePerGas,
        maxPriorityFeePerGas
      })
      return {
        data: estimateGas
      }
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST)
    }
  }
}

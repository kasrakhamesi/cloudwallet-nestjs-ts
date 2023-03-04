import { Injectable } from '@nestjs/common'
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
} from '../wallet.interface'
import bip39 from 'bip39'
import Web3 from 'web3'
const web3 = new Web3()

const estimateGas = async (
  from: string,
  to: string,
  data: string | null | undefined,
  value: string | number,
  maxFeePerGas: string | number,
  maxPriorityFeePerGas: string | number
) => {
  try {
    const estimateGas = await web3.eth.estimateGas({
      from,
      to,
      value,
      data,
      maxFeePerGas,
      maxPriorityFeePerGas
    })
    return {
      isSuccess: true,
      data: estimateGas
    }
  } catch (e) {
    return {
      isSuccess: false,
      message: e?.message || String(e)
    }
  }
}

@Injectable()
export class EthereumService implements IWallet {
  constructor() {}
  public async generateAddress({
    mnemonic,
    deriveIndex
  }: IGenerateAddress): Promise<IGenerateAddressResponse> {
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
  }
  public restoreAddressFromPrivateKey({
    privateKey
  }: IRestoreAddressFromPrivateKey): IRestoreAddressFromPrivateKeyResponse {
    const prvBuffer =
      privateKey.length > 65
        ? Buffer.from(privateKey.substring(2, 66), 'hex')
        : Buffer.from(privateKey, 'hex')
    const keyPair = ethereumWallet.fromPrivateKey(prvBuffer)
    const address = keyPair.getChecksumAddressString()
    return {
      address
    }
  }
  public async getBalance({
    address
  }: IGetBalance): Promise<IGetBalanceResponse> {
    const value = await web3.eth.getBalance(address)
    const balance = parseFloat(web3.utils.fromWei(value, 'ether'))
    return {
      balance
    }
  }
  public async transfer({
    fromPrivateKey,
    toAddress,
    amount
  }: ITransfer): Promise<ITransferResponse> {
    const from = this.restoreAddressFromPrivateKey({
      privateKey: fromPrivateKey
    })
    const nonce = await web3.eth.getTransactionCount(from.address, 'pending')

    const value = web3.utils.toHex(web3.utils.toWei(amount.toString(), 'ether'))

    const maxFee = web3.utils.toHex(
      web3.utils.toWei(Number(100).toString(), 'gwei')
    )

    const maxPriorityFee = web3.utils.toHex(
      web3.utils.toWei(Number(3).toString(), 'gwei')
    )

    const gasLimit = await estimateGas(
      from.address,
      toAddress,
      '0x',
      value,
      maxFee,
      maxPriorityFee
    )

    if (!gasLimit?.isSuccess) throw new Error(gasLimit?.message)

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

    const rawTransaction = await web3.eth.accounts.signTransaction(
      txParams,
      fromPrivateKey
    )

    const transactionResult = await web3.eth.sendSignedTransaction(
      rawTransaction?.rawTransaction
    )

    return {
      transactionId: transactionResult?.transactionHash
    }
  }
}

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
  ITransferResponse,
  ITransactions,
  ITransactionsResponse,
  ITransaction,
  ITransactionResponse
} from '@localTypes/wallet.interface'
import Web3 from 'web3'
import axios from 'axios'
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
    address,
    contract
  }: IGetBalance): Promise<IGetBalanceResponse> {
    try {
      if (!contract) {
        const balance = await this.web3.eth.getBalance(address)
        return {
          balance: parseFloat(balance)
        }
      }
      const ABI: any = [
        {
          constant: true,
          inputs: [{ name: '_owner', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: 'balance', type: 'uint256' }],
          type: 'function'
        }
      ]
      const contractData = new this.web3.eth.Contract(ABI, contract)
      const balance = await contractData.methods.balanceOf(address).call()
      return { balance: parseFloat(balance) }
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST)
    }
  }
  public async transfer({
    fromPrivateKey,
    toAddress,
    value,
    contract,
    chain
  }: ITransfer): Promise<ITransferResponse> {
    try {
      const from = this.restoreAddressFromPrivateKey({
        privateKey: fromPrivateKey
      })
      const nonce = await this.web3.eth.getTransactionCount(
        from.address,
        'pending'
      )

      let data = '0x'

      if (contract) {
        const ABI: any = [
          {
            constant: false,
            inputs: [
              {
                name: '_to',
                type: 'address'
              },
              {
                name: '_value',
                type: 'uint256'
              }
            ],
            name: 'transfer',
            outputs: [
              {
                name: '',
                type: 'bool'
              }
            ],
            type: 'function'
          }
        ]

        const contractData = new this.web3.eth.Contract(ABI, contract)
        data = await contractData.methods
          .transfer(toAddress, value) // TODO ZARD DAR DECIMAL
          .encodeABI()
      }

      const newValue = contract
        ? this.web3.utils.toHex(
            this.web3.utils.toWei(Number(0).toString(), 'ether')
          )
        : value

      const maxFee = this.web3.utils.toHex(
        this.web3.utils.toWei(Number(100).toString(), 'gwei')
      )

      const maxPriorityFee = this.web3.utils.toHex(
        this.web3.utils.toWei(Number(3).toString(), 'gwei')
      )

      const gasLimit = await this.estimateGas(
        from.address,
        toAddress,
        data,
        value,
        maxFee,
        maxPriorityFee
      )

      const txParams = contract
        ? {
            nonce,
            chainId: chain ? parseInt(chain) : 1,
            type: 2,
            value: newValue,
            data,
            gasLimit: gasLimit?.data,
            maxFeePerGas: maxFee,
            maxPriorityFeePerGas: maxPriorityFee,
            to: contract
          }
        : {
            nonce,
            chainId: chain ? parseInt(chain) : 1,
            type: 2,
            value: newValue,
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

  public async transactions({
    address,
    contract
  }: ITransactions): Promise<ITransactionsResponse[]> {
    try {
      const url = contract
        ? `http://75.119.132.41:3010/v1/address/${address}/contract-txs/${contract}`
        : `http://75.119.132.41:3010/v1/address/${address}/basic-txs`

      const { data } = await axios({
        method: 'get',
        url,
        headers: {
          'content-type': 'application/json'
        }
      })

      const lastBlack = await this.web3.eth.getBlockNumber()

      return data.data.transactions
        .filter((item: any) =>
          item.error === '' && contract
            ? item.contract !== null
            : item.contract === null
        )
        .map((item: any) => {
          return {
            transactionId: item.id,
            timestamp: parseInt(item.timestamp),
            value: parseFloat(item?.contract?.value || item.value),
            confirmations: lastBlack - parseInt(item.blockNumber),
            type: item.from === address ? 'send' : 'receive',
            contract: item?.contract?.address || null,
            error: item.error === '' ? false : true
          }
        })
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST)
    }
  }

  public async transaction({
    transactionId
  }: ITransaction): Promise<ITransactionResponse> {
    try {
      const url = `http://75.119.132.41:3010/v1/transaction/${transactionId}`

      const { data } = await axios({
        method: 'get',
        url,
        headers: {
          'content-type': 'application/json'
        }
      })

      const lastBlack = await this.web3.eth.getBlockNumber()
      const transaction = data.data
      return {
        transactionId: transaction.id,
        timestamp: parseInt(transaction.timestamp),
        value: parseFloat(
          transaction.contract ? transaction.contract.value : transaction.value
        ),
        confirmations: lastBlack - parseInt(transaction.blockNumber),
        from: transaction.from,
        to: transaction?.contract?.to || transaction.to,
        contract: transaction?.contract?.address || null,
        error: transaction.error === '' ? false : true
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

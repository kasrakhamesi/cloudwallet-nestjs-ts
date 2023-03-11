import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common'
import { WalletService } from './wallet.service'
import {
  GenerateAddressDto,
  RestoreAddressFromPrivateKeyDto,
  TransferDto
} from './dto/wallet.dto'
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import {
  IGenerateAddressResponse,
  IGetBalanceResponse,
  IRestoreAddressFromPrivateKeyResponse,
  ITransactionResponse,
  ITransactionsResponse,
  ITransferResponse
} from '@localTypes/wallet.interface'
import { IBlockchain } from '@localTypes/blockchains.interface'

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('mnemonic/generate')
  public async generateMnemonic() {
    return {
      statusCode: 200,
      data: {
        mnemonic: await this.walletService.generateMnemonic()
      }
    }
  }

  @Post('blockchains/addresses/generate')
  public async generateAddresses(
    @Body() generateAddressDto: GenerateAddressDto
  ) {
    const address = await this.walletService.generateAddress(
      { blockchain: 'ethereum' },
      generateAddressDto
    )
    return {
      statusCode: 201,
      data: [
        {
          blockchain: 'ethereum',
          address: address.address,
          privateKey: address.privateKey
        }
      ]
    }
  }

  @Post('blockchain/:blockchain/address/generate')
  @ApiParam({
    name: 'blockchain',
    type: 'string',
    required: true,
    example: 'ethereum'
  })
  public async generateAddress(
    @Param('blockchain') blockchain: IBlockchain,
    @Body() generateAddressDto: GenerateAddressDto
  ) {
    return {
      statusCode: 201,
      data: <IGenerateAddressResponse>(
        await this.walletService.generateAddress(blockchain, generateAddressDto)
      )
    }
  }

  @Post('blockchain/:blockchain/address/restore')
  @ApiParam({
    name: 'blockchain',
    type: 'string',
    required: true,
    example: 'ethereum'
  })
  public async restoreAddressFromPrivateKey(
    @Param('blockchain') blockchain: IBlockchain,
    @Body() restoreAddressFromPrivateKeyDto: RestoreAddressFromPrivateKeyDto
  ) {
    return {
      statusCode: 201,
      data: <IRestoreAddressFromPrivateKeyResponse>(
        await this.walletService.restoreAddressFromPrivateKey(
          blockchain,
          restoreAddressFromPrivateKeyDto
        )
      )
    }
  }

  @Get('blockchain/:blockchain/address/:address/balance')
  @ApiParam({
    name: 'address',
    type: 'string',
    required: true,
    example: '0x8044ed1A4Cc16B116C01cc2c3076263B97DFf1F5'
  })
  @ApiParam({
    name: 'blockchain',
    type: 'string',
    required: true,
    example: 'ethereum'
  })
  @ApiQuery({
    name: 'contract',
    type: 'string',
    required: false,
    example: '0x8044ed1A4Cc16B116C01cc2c3076263B97DFf1F5'
  })
  public async getBalance(
    @Param('blockchain') blockchain: IBlockchain,
    @Param('address') address: string,
    @Query('contract') contract: string
  ) {
    return {
      statusCode: 200,
      data: <IGetBalanceResponse>await this.walletService.getBalance(
        blockchain,
        {
          address,
          contract
        }
      )
    }
  }

  @Post('blockchain/:blockchain/address/transfer')
  @ApiParam({
    name: 'blockchain',
    type: 'string',
    required: true,
    example: 'ethereum'
  })
  @ApiQuery({
    name: 'chain',
    type: 'string',
    required: false,
    example: '3'
  })
  @ApiQuery({
    name: 'contract',
    type: 'string',
    required: false,
    example: '0x8044ed1A4Cc16B116C01cc2c3076263B97DFf1F5'
  })
  public async transfer(
    @Param('blockchain') blockchain: IBlockchain,
    @Body() transferDto: TransferDto,
    @Query('contract') contract: string,
    @Query('chain') chain: string
  ) {
    return {
      statusCode: 201,
      data: <ITransferResponse>await this.walletService.transfer(blockchain, {
        fromPrivateKey: transferDto.fromPrivateKey,
        toAddress: transferDto.toAddress,
        value: transferDto.value,
        contract,
        chain
      })
    }
  }

  @Get('blockchain/:blockchain/address/:address/transactions')
  @ApiParam({
    name: 'address',
    type: 'string',
    required: true,
    example: '0x8044ed1A4Cc16B116C01cc2c3076263B97DFf1F5'
  })
  @ApiParam({
    name: 'blockchain',
    type: 'string',
    required: true,
    example: 'ethereum'
  })
  @ApiQuery({
    name: 'contract',
    type: 'string',
    required: false,
    example: '0x8044ed1A4Cc16B116C01cc2c3076263B97DFf1F5'
  })
  public async transactions(
    @Param('blockchain') blockchain: IBlockchain,
    @Param('address') address: string,
    @Query('contract') contract: string
  ) {
    return {
      statusCode: 200,
      data: <ITransactionsResponse>await this.walletService.transactions(
        blockchain,
        {
          address,
          contract
        }
      )
    }
  }

  @Get('blockchain/:blockchain/transaction/:transaction')
  @ApiParam({
    name: 'transaction',
    type: 'string',
    required: true,
    example:
      '0x9037569543b49b39fac28762811168a6a20d8e749c097ed232ffa5ba0095ff84'
  })
  @ApiParam({
    name: 'blockchain',
    type: 'string',
    required: true,
    example: 'ethereum'
  })
  public async transaction(
    @Param('blockchain') blockchain: IBlockchain,
    @Param('transaction') transaction: string
  ) {
    return {
      statusCode: 200,
      data: <ITransactionResponse>await this.walletService.transaction(
        blockchain,
        {
          transactionId: transaction
        }
      )
    }
  }

  @Get('blockhains')
  public getBlockchains() {
    return {
      statusCode: 200,
      data: ['ethereum']
    }
  }
}

import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { WalletService } from './wallet.service'
import {
  GenerateAddressDto,
  RestoreAddressFromPrivateKeyDto,
  TransferDto
} from './dto/wallet.dto'
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import {
  IGenerateAddressResponse,
  IGetBalance,
  IGetBalanceResponse,
  IRestoreAddressFromPrivateKeyResponse,
  ITransactionsResponse,
  ITransferResponse
} from '@localTypes/wallet.interface'
import { IBlockchain } from '@localTypes/blockchains.interface'
import { Query } from '@nestjs/common/decorators/http/route-params.decorator'

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
    console.log(address)
    return {
      statusCode: 200,
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
      statusCode: 200,
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
      statusCode: 200,
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
      statusCode: 200,
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

  @Get('blockhains')
  public getBlockchains() {
    return {
      statusCode: 200,
      data: ['ethereum']
    }
  }
}

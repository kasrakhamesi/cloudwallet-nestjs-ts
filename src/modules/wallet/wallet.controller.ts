import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { WalletService } from './wallet.service'
import {
  GenerateAddressDto,
  RestoreAddressFromPrivateKeyDto,
  TransferDto
} from './dto/wallet.dto'
import { ApiParam, ApiTags } from '@nestjs/swagger'
import {
  IGenerateAddressResponse,
  IGetBalance,
  IGetBalanceResponse,
  IRestoreAddressFromPrivateKeyResponse,
  ITransferResponse
} from '@localTypes/wallet.interface'
import { IBlockchain } from '@localTypes/blockchains.interface'

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}
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
  public async getBalance(
    @Param('blockchain') blockchain: IBlockchain,
    @Param('address') address: IGetBalance
  ) {
    return {
      statusCode: 200,
      data: <IGetBalanceResponse>await this.walletService.getBalance(
        blockchain,
        {
          address: address.toString()
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
  public async transfer(
    @Param('blockchain') blockchain: IBlockchain,
    @Body() transferDto: TransferDto
  ) {
    return {
      statusCode: 200,
      data: <ITransferResponse>(
        await this.walletService.transfer(blockchain, transferDto)
      )
    }
  }
}

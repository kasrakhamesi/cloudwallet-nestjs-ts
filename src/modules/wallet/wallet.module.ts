import { Module } from '@nestjs/common'
import { WalletService } from './wallet.service'
import { WalletController } from './wallet.controller'
import { EthereumService } from '@packages/ethereum/ethereum.service'

@Module({
  controllers: [WalletController],
  providers: [WalletService, EthereumService]
})
export class WalletModule {}

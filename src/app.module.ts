import { WalletModule } from '@modules/wallet/wallet.module'
import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [WalletModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}

import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class GenerateAddressDto {
  @ApiProperty({
    description: 'mnemonic',
    example:
      'monitor trap fee lamp average width crime length stamp little erase boil'
  })
  @IsNotEmpty({ message: 'آدرس نمونیک نباید خالی باشد' })
  mnemonic: string

  @ApiProperty({
    description: 'deriveIndex',
    example: 1
  })
  @IsNotEmpty({ message: 'ایندکس نمیتواند خالی باشد' })
  deriveIndex: number
}

export class RestoreAddressFromPrivateKeyDto {
  @ApiProperty({
    description: 'privateKey',
    example:
      '0xbee9e0fcc17b88415568154bd0c5d264fe5ef46d939ef85ae55999a5da09014b'
  })
  @IsNotEmpty({ message: 'کلید شخصی نمیتواند خالی باشد' })
  privateKey: string
}

export class TransferDto {
  @ApiProperty({
    description: 'fromPrivateKey',
    example:
      '0xbee9e0fcc17b88415568154bd0c5d264fe5ef46d939ef85ae55999a5da09014b'
  })
  @IsNotEmpty({ message: 'کلید شخصی آدرس مبدا نمیتواند خالی باشد' })
  fromPrivateKey: string

  @ApiProperty({
    description: 'toAddress',
    example: '0x8044ed1A4Cc16B116C01cc2c3076263B97DFf1F5'
  })
  @IsNotEmpty({ message: 'آدرس مقصد نمیتواند خالی باشد' })
  toAddress: string

  @ApiProperty({
    description: 'amount',
    example: 1
  })
  @IsNotEmpty({ message: 'مقدار نمیتواند خالی باشد' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'مقدار باید عدد باشد' }
  )
  amount: number
}

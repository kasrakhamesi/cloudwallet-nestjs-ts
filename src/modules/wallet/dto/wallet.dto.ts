import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

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

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { ValidationPipe } from '@nestjs/common'

function createSwagger(app: NestFastifyApplication) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Cloudwallet API')
    .addBearerAuth()
    .setDescription('API for the cloudwallet')
    .setVersion('1')
    .build()
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('docs', app, swaggerDocument)
}

function addPipes(app: NestFastifyApplication) {
  app.useGlobalPipes(new ValidationPipe())
}

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, {
    cors: {
      origin: '*'
    }
  })
  createSwagger(app)
  addPipes(app)
  await app.listen(3000)
}
bootstrap()

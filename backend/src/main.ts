import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());

  const doc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle('Wallet Portal API').setVersion('1.0').build(),
  );
  SwaggerModule.setup('api', app, doc);

  await app.listen(process.env.PORT || 3001);
}

bootstrap();

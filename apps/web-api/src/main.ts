import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  let port = process.env.PORT;
  if (typeof port === 'undefined') {
    if (process.env.NODE_ENV === 'development') {
      port = '3000';
    } else {
      throw new Error('Port not defined.');
    }
  }
  await app.listen(port, () => {
    Logger.log(`Listening on port ${port}!`);
  });
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:4200',        // o un array ['http://localhost:4200','...']
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,                      // si envías cookies o auth
    allowedHeaders: 'Content-Type, Authorization'
  });
  app.useGlobalPipes(new ValidationPipe({
    transform: true,      // <- convierte los tipos de DTO
    whitelist: true,      // <- elimina propiedades no declaradas en el DTO
    transformOptions: {
      enableImplicitConversion: true,  // <— aquí
    },
  }));
  await app.listen(process.env.PORT || 3000);
}
bootstrap();

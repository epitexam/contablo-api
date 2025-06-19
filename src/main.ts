import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Contablo API')
    .setDescription('API to manage users, posts, and comments in Contablo forum.')
    .setVersion('1.0')
    .addTag('Users', 'User management')
    .addTag('Articles', 'Article management')
    .addTag('Posts', 'Post management')
    .addTag('Comments', 'Comment management')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, documentFactory)

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

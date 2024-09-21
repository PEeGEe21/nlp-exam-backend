import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { config } from './config';
import { SeederService } from './seeder/seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  const corsOptions = {
    origin:
      config.env === 'development'
        ? '*'
        : [
            'https://nlp-exam-frontend.vercel.app',
          ],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  };
  app.enableCors(corsOptions); // TODO: Setup cors config based on FE's server IPs
  // app.use(csurf());
  app.setGlobalPrefix('/api/');
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Examination System')
    .setDescription('The Examination System API description')
    .setVersion('1.0')
    .addBearerAuth()
    .setExternalDoc('Examination System API & Examination System Postman Collection', '/api/docs-json')
    .build();
  
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const seederService = app.get(SeederService);
  // await seederService.seedDifficulties();
  // await seederService.seedOptionTypes();
  // await seederService.seedQuestions();

  const port = process.env.PORT || config.port;
  await app.listen(port);

  console.log(`listening on: http://localhost:${port}`);
}
bootstrap();

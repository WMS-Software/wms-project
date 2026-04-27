import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_USER: Joi.string(),
        DB_USERNAME: Joi.string(),
        DB_PASSWORD: Joi.string(),
        DB_PASS: Joi.string(),
        DB_DATABASE: Joi.string(),
        DB_NAME: Joi.string(),
        DB_SYNC: Joi.string().valid('true', 'false').default('false'),
      }).or('DB_USER', 'DB_USERNAME').or('DB_PASSWORD', 'DB_PASS').or('DB_DATABASE', 'DB_NAME'),
    }),
    TypeOrmModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: Number(configService.get<string>('DB_PORT')),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    // entities: [__dirname+ '/**/*.entity{.ts,.js}'],    // we will use in prod but for now we use autoload
    autoLoadEntities: true,
    synchronize: configService.get<string>('DB_SYNC') === 'true',
    logging: true,
  
  }),
  inject: [ConfigService],
}),
    ],
      controllers: [],
      providers: [],
})
export class DatabaseModule {}

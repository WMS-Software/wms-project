import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
    imports: [
        ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: ".env.development"

  }),
    TypeOrmModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: Number(configService.get<string>('DB_PORT')),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [__dirname+ '/**/*.entity{.ts,.js}'],
    synchronize: configService.get<string>('DB_SYNC') === 'true',
    logging: true
  }),
  inject: [ConfigService],
}),
    ],
      controllers: [],
      providers: [],
})
export class DatabaseModule {}
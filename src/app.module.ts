import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

import * as modules from './modules';
import * as thirdPartyModules from './third-party';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),

    ...Object.values(modules),
    ...Object.values(thirdPartyModules),
  ],
})
export class AppModule {}

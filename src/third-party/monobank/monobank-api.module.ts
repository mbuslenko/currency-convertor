import { Module } from '@nestjs/common';

import { MonobankApiService } from './monobank-api.service';

@Module({
    providers: [MonobankApiService],
    exports: [MonobankApiService],
})
export class MonobankApiModule {}

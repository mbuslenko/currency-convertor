import { Module } from '@nestjs/common';

import { MonobankApiModule } from '../../third-party';
import { ConvertorService } from './convertor.service';
import { ConvertorController } from './api/convertor.controller';

@Module({
    imports: [MonobankApiModule],
    providers: [ConvertorService],
    controllers: [ConvertorController]
})
export class ConvertorModule {}

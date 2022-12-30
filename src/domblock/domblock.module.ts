import { Module } from '@nestjs/common';
import { DomblockGateway } from './domblock.gateway';

@Module({
    providers: [DomblockGateway],
})
export class DomblockModule {}

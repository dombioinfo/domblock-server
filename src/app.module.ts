import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DomblockModule } from './domblock/domblock.module';

@Module({
  imports: [DomblockModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

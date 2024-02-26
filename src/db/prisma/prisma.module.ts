import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

//전역
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

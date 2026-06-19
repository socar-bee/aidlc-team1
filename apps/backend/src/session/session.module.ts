import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableSessionEntity } from './entities/table-session.entity';
import { SessionRepository } from './repositories/session.repository';
import { SessionService } from './services/session.service';

@Module({
  imports: [TypeOrmModule.forFeature([TableSessionEntity])],
  providers: [SessionService, SessionRepository],
  exports: [SessionService, SessionRepository, TypeOrmModule],
})
export class SessionModule {}

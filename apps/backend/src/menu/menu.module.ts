import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuEntity } from './entities/menu.entity';
import { MenuRepository } from './repositories/menu.repository';
import { MenuService } from './services/menu.service';
import { MenuController } from './controllers/menu.controller';
import { CategoryModule } from '../category/category.module';
import { AuthModule } from '../auth/auth.module';
import { StoreModule } from '../store/store.module';

@Module({
  imports: [TypeOrmModule.forFeature([MenuEntity]), CategoryModule, AuthModule, StoreModule],
  controllers: [MenuController],
  providers: [MenuService, MenuRepository],
  exports: [MenuService, MenuRepository, TypeOrmModule],
})
export class MenuModule {}

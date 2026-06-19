import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { MenuEntity } from '../menu/entities/menu.entity';
import { CategoryRepository } from './repositories/category.repository';
import { CategoryService } from './services/category.service';
import { CategoryController } from './controllers/category.controller';
import { AuthModule } from '../auth/auth.module';
import { StoreModule } from '../store/store.module';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity, MenuEntity]), AuthModule, StoreModule],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository],
  exports: [CategoryService, CategoryRepository, TypeOrmModule],
})
export class CategoryModule {}

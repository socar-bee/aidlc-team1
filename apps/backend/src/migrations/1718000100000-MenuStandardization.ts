import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * menu 테이블에 범용 표준화 필드(영문명/외부코드/영양성분/규격) 추가.
 * 스타벅스 음료 등 외부 표준 데이터를 담기 위한 확장.
 */
export class MenuStandardization1718000100000 implements MigrationInterface {
  name = 'MenuStandardization1718000100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`menu\`
        ADD COLUMN \`nameEn\` VARCHAR(200) NULL AFTER \`name\`,
        ADD COLUMN \`externalCode\` VARCHAR(64) NULL AFTER \`nameEn\`,
        ADD COLUMN \`caloriesKcal\` INT NULL AFTER \`imageUrl\`,
        ADD COLUMN \`sugarG\` DECIMAL(6,1) NULL AFTER \`caloriesKcal\`,
        ADD COLUMN \`proteinG\` DECIMAL(6,1) NULL AFTER \`sugarG\`,
        ADD COLUMN \`sodiumMg\` INT NULL AFTER \`proteinG\`,
        ADD COLUMN \`saturatedFatG\` DECIMAL(6,1) NULL AFTER \`sodiumMg\`,
        ADD COLUMN \`caffeineMg\` INT NULL AFTER \`saturatedFatG\`,
        ADD COLUMN \`allergens\` VARCHAR(300) NULL AFTER \`caffeineMg\`,
        ADD COLUMN \`servingSize\` VARCHAR(50) NULL AFTER \`allergens\`;
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX \`uq_menu_store_external\`
        ON \`menu\` (\`storeId\`, \`externalCode\`);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`uq_menu_store_external\` ON \`menu\`;`);
    await queryRunner.query(`
      ALTER TABLE \`menu\`
        DROP COLUMN \`servingSize\`,
        DROP COLUMN \`allergens\`,
        DROP COLUMN \`caffeineMg\`,
        DROP COLUMN \`saturatedFatG\`,
        DROP COLUMN \`sodiumMg\`,
        DROP COLUMN \`proteinG\`,
        DROP COLUMN \`sugarG\`,
        DROP COLUMN \`caloriesKcal\`,
        DROP COLUMN \`externalCode\`,
        DROP COLUMN \`nameEn\`;
    `);
  }
}

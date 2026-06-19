import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1718000000000 implements MigrationInterface {
  name = 'InitialSchema1718000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`store\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`name\` VARCHAR(100) NOT NULL,
        \`code\` VARCHAR(64) NOT NULL,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE INDEX \`IDX_store_code\` (\`code\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await queryRunner.query(`
      CREATE TABLE \`admin_user\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`storeId\` INT NOT NULL,
        \`username\` VARCHAR(64) NOT NULL,
        \`passwordHash\` VARCHAR(255) NOT NULL,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE INDEX \`uq_admin_store_username\` (\`storeId\`, \`username\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`fk_admin_store\` FOREIGN KEY (\`storeId\`)
          REFERENCES \`store\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await queryRunner.query(`
      CREATE TABLE \`restaurant_table\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`storeId\` INT NOT NULL,
        \`tableNumber\` INT NOT NULL,
        \`passwordHash\` VARCHAR(255) NOT NULL,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE INDEX \`uq_table_store_number\` (\`storeId\`, \`tableNumber\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`fk_table_store\` FOREIGN KEY (\`storeId\`)
          REFERENCES \`store\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await queryRunner.query(`
      CREATE TABLE \`category\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`storeId\` INT NOT NULL,
        \`name\` VARCHAR(100) NOT NULL,
        \`sortOrder\` INT NOT NULL DEFAULT 0,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE INDEX \`uq_category_store_name\` (\`storeId\`, \`name\`),
        INDEX \`ix_category_store_sort\` (\`storeId\`, \`sortOrder\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`fk_category_store\` FOREIGN KEY (\`storeId\`)
          REFERENCES \`store\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await queryRunner.query(`
      CREATE TABLE \`menu\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`storeId\` INT NOT NULL,
        \`categoryId\` INT NOT NULL,
        \`name\` VARCHAR(200) NOT NULL,
        \`price\` DECIMAL(10,2) NOT NULL,
        \`description\` TEXT NULL,
        \`imageUrl\` VARCHAR(500) NULL,
        \`sortOrder\` INT NOT NULL DEFAULT 0,
        \`isActive\` TINYINT(1) NOT NULL DEFAULT 1,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`ix_menu_store_category_sort\` (\`storeId\`, \`categoryId\`, \`sortOrder\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`fk_menu_store\` FOREIGN KEY (\`storeId\`)
          REFERENCES \`store\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_menu_category\` FOREIGN KEY (\`categoryId\`)
          REFERENCES \`category\`(\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await queryRunner.query(`
      CREATE TABLE \`table_session\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`tableId\` INT NOT NULL,
        \`startedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`endedAt\` DATETIME NULL,
        INDEX \`ix_session_table_ended\` (\`tableId\`, \`endedAt\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`fk_session_table\` FOREIGN KEY (\`tableId\`)
          REFERENCES \`restaurant_table\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await queryRunner.query(`
      CREATE TABLE \`app_order\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`sessionId\` INT NOT NULL,
        \`tableId\` INT NOT NULL,
        \`orderNumber\` VARCHAR(32) NOT NULL,
        \`totalAmount\` DECIMAL(12,2) NOT NULL,
        \`status\` ENUM('PENDING','PREPARING','COMPLETED','CANCELED') NOT NULL DEFAULT 'PENDING',
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`canceledAt\` DATETIME NULL,
        UNIQUE INDEX \`uq_order_number\` (\`orderNumber\`),
        INDEX \`ix_order_session_status_created\` (\`sessionId\`, \`status\`, \`createdAt\`),
        INDEX \`ix_order_table_created\` (\`tableId\`, \`createdAt\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`fk_order_session\` FOREIGN KEY (\`sessionId\`)
          REFERENCES \`table_session\`(\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`fk_order_table\` FOREIGN KEY (\`tableId\`)
          REFERENCES \`restaurant_table\`(\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await queryRunner.query(`
      CREATE TABLE \`order_item\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`orderId\` INT NOT NULL,
        \`menuId\` INT NOT NULL,
        \`menuNameSnapshot\` VARCHAR(200) NOT NULL,
        \`unitPriceSnapshot\` DECIMAL(10,2) NOT NULL,
        \`quantity\` INT NOT NULL,
        INDEX \`ix_order_item_order\` (\`orderId\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`fk_order_item_order\` FOREIGN KEY (\`orderId\`)
          REFERENCES \`app_order\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `order_item`');
    await queryRunner.query('DROP TABLE IF EXISTS `app_order`');
    await queryRunner.query('DROP TABLE IF EXISTS `table_session`');
    await queryRunner.query('DROP TABLE IF EXISTS `menu`');
    await queryRunner.query('DROP TABLE IF EXISTS `category`');
    await queryRunner.query('DROP TABLE IF EXISTS `restaurant_table`');
    await queryRunner.query('DROP TABLE IF EXISTS `admin_user`');
    await queryRunner.query('DROP TABLE IF EXISTS `store`');
  }
}

#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/1b158839e8bd767aa827cd88343172f6614757ec4c67ffb7e911a9ea6877e07b/contract';
import endContract from '../../snapshots/1b158839e8bd767aa827cd88343172f6614757ec4c67ffb7e911a9ea6877e07b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'crop',
        columns: [
          col('baseTemp', 'float8', {
            notNull: true,
            default: lit(10),
            codecRef: { codecId: 'pg/float8@1' },
          }),
          col('bloomDate', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('expectedYield', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('farmId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('harvestDate', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('plantingDate', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('status', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('targetGdd', 'float8', {
            notNull: true,
            default: lit(1500),
            codecRef: { codecId: 'pg/float8@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'farm',
        columns: [
          col('actualArea', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('address', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('gridX', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('gridY', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('totalArea', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'farmLog',
        columns: [
          col('avgTemp', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('cropId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('date', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('memo', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('stage', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('workType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'crop',
        index: 'crop_farmId_idx_786bd89b',
        columns: ['farmId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'farmLog',
        index: 'farmLog_cropId_idx_879e8d63',
        columns: ['cropId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'crop',
        foreignKey: {
          name: 'crop_farmId_fkey',
          columns: ['farmId'],
          references: { schema: 'public', table: 'farm', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'farmLog',
        foreignKey: {
          name: 'farmLog_cropId_fkey',
          columns: ['cropId'],
          references: { schema: 'public', table: 'crop', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);

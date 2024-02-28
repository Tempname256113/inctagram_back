import { PrismaClient } from '@prisma/client';
import { Injectable, OnModuleInit } from '@nestjs/common';
import kyselyExtension from 'prisma-extension-kysely';
import { DB } from '../../prisma/generated/types';
import {
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from 'kysely';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  prismaWithAddon = new PrismaClient().$extends(
    kyselyExtension({
      kysely: (driver) =>
        new Kysely<DB>({
          dialect: {
            createDriver: () => driver,
            createAdapter: () => new PostgresAdapter(),
            createIntrospector: (db) => new PostgresIntrospector(db),
            createQueryCompiler: () => new PostgresQueryCompiler(),
          },
        }),
    }),
  );

  async onModuleInit() {
    await Promise.all([this.prismaWithAddon.$connect(), this.$connect()]);
  }
}

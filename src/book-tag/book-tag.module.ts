import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { BookTagController } from "./book-tag.controller";
import { BookTagService } from "./book-tag.service";
import { CacheModule } from "@nestjs/cache-manager";

@Module({
    imports: [PrismaModule, CacheModule],
    controllers: [BookTagController],
    providers: [BookTagService]
})

export class BookTagModule {}
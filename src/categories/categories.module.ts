import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { CategoryService } from "./categories.service";
import { CategoryController } from "./categories.controller";
import { CacheModule } from "@nestjs/cache-manager";

@Module({
    imports: [PrismaModule, CacheModule.register({
        ttl: 60, // default cache time-to-live (in seconds)
        max: 100, // max items (if in-memory)
    })],
    providers: [CategoryService],
    controllers: [CategoryController]
})

export class CategoriesModule { }
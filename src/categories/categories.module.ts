import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { CategoryService } from "./categories.service";
import { CategoryController } from "./categories.controller";

@Module({
    imports: [PrismaModule],
    providers: [CategoryService],
    controllers: [CategoryController]
})

export class CategoriesModule {}
import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    providers: [],
    exports: []
})

export class CategoryModule {}
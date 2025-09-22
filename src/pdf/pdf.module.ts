import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { PdfService } from "./pdf.service";

@Module({
    imports: [PrismaModule],
    providers: [PdfService]
})

export class PdfModule {}
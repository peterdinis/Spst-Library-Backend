import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { ClerkService } from "./clerk.service";
import { CategoryModule } from "src/category/category.module";
import { BooksModule } from "src/books/books.module";

@Module({
    imports: [CategoryModule, BooksModule],
    providers: [AdminService, ClerkService],
    controllers: [AdminController]
})

export class AdminModule {} 
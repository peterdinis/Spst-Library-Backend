import { Injectable} from "@nestjs/common";
import { ClerkService } from "./clerk.service";
import { PrismaService } from "src/prisma/prisma.service";
import { CategoryService } from "src/category/category.service";
import { BooksService } from "src/books/books.service";

@Injectable()
export class AdminService {
    constructor(
        private readonly clerkService: ClerkService,
        private readonly prismaService: PrismaService,
        private readonly categoryService: CategoryService,
        private readonly booksService: BooksService,
    ) { }

    async getActiveUsers() {
        return this.clerkService.getActiveUsers();
    }

    async allCategories() {
        return this.categoryService.findAllCached()
    }

    async allBooks() {
        return this.booksService.findAllCached()
    }

    
}
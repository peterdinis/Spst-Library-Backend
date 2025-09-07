
import { PrismaClient, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ----- DELETE EXISTING DATA -----
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.bookTag.deleteMany();
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  console.log('🧹 Existing data cleared');

  // ----- ROLES -----
  const roleNames = ['ADMIN', 'TEACHER', 'STUDENT'];
  const roles: { id: number; name: string }[] = [];

  for (const name of roleNames) {
    const role = await prisma.role.create({ data: { name } });
    roles.push(role);
  }
  console.log('👤 3 roles created');

  // ----- USERS -----
  const users: { id: number; name: string; email: string; password: string; roleId: number; createdAt: Date; updatedAt: Date }[] = [];

  for (let i = 0; i < 100; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: await bcrypt.hash("password123", 10), // Hash the password properly
        roleId: faker.helpers.arrayElement(roles).id,
      },
    });
    users.push(user);
  }
  console.log('👥 100 users created');

  // ----- CATEGORIES -----
  const categories: { id: number; name: string; description: string | null; createdAt: Date; updatedAt: Date }[] = [];
  for (let i = 0; i < 100; i++) {
    const category = await prisma.category.create({
      data: {
        name: faker.lorem.words({ min: 1, max: 3 }),
        description: faker.lorem.sentence(),
      },
    });
    categories.push(category);
  }
  console.log('📂 100 categories created');

  // ----- AUTHORS -----
  const authors: {
    id: number;
    name: string;
    bio: string | null;
    litPeriod: string;
    bornDate: string;
    deathDate: string | null;
    createdAt: Date;
    updatedAt: Date;
  }[] = [];

  for (let i = 0; i < 100; i++) {
    const bornDate = faker.date.past({ years: 100, refDate: new Date('2000-01-01') });
    const author = await prisma.author.create({
      data: {
        name: faker.person.fullName(),
        bio: faker.lorem.paragraph(),
        litPeriod: faker.helpers.arrayElement(['Medieval', 'Renaissance', 'Modern', 'Contemporary']),
        bornDate: bornDate.toISOString().split('T')[0],
        deathDate: faker.datatype.boolean()
          ? faker.date.between({ 
              from: bornDate, 
              to: new Date('2024-01-01') 
            }).toISOString().split('T')[0]
          : null,
      },
    });
    authors.push(author);
  }
  console.log('✍️ 100 authors created');

  // ----- BOOKS -----
  const books: {
    id: number;
    name: string;
    description: string | null;
    year: number | null;
    categoryId: number | null;
    authorId: number;
    isAvailable: boolean;
    isNew: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[] = [];

  for (let i = 0; i < 100; i++) {
    const book = await prisma.book.create({
      data: {
        name: faker.lorem.words({ min: 1, max: 4 }),
        description: faker.lorem.sentences({ min: 2, max: 3 }),
        year: faker.number.int({ min: 1900, max: 2024 }),
        categoryId: faker.helpers.arrayElement(categories).id,
        authorId: faker.helpers.arrayElement(authors).id,
        isAvailable: faker.datatype.boolean(),
        isNew: faker.datatype.boolean(),
      },
    });
    books.push(book);
  }
  console.log('📚 100 books created');

  // ----- BOOK TAGS -----
  const bookTags: { id: number; name: string; createdAt: Date; updatedAt: Date }[] = [];
  
  for (let i = 0; i < 50; i++) {
    const tag = await prisma.bookTag.create({
      data: {
        name: faker.lorem.word() + '-' + faker.string.uuid().slice(0, 6),
      },
    });
    bookTags.push(tag);
  }

  // Connect books to tags (many-to-many relationship)
  for (const tag of bookTags) {
    const selectedBooks = faker.helpers.arrayElements(books, faker.number.int({ min: 1, max: 10 }));
    await prisma.bookTag.update({
      where: { id: tag.id },
      data: {
        books: {
          connect: selectedBooks.map((b) => ({ id: b.id })),
        },
      },
    });
  }
  console.log('🏷️ 50 tags created and connected to books');

  // ----- RATINGS -----
  for (let i = 0; i < 200; i++) {
    await prisma.rating.create({
      data: {
        bookId: faker.helpers.arrayElement(books).id,
        value: faker.number.int({ min: 1, max: 5 }),
        comment: faker.datatype.boolean() ? faker.lorem.sentence() : null,
      },
    });
  }
  console.log('⭐ 200 ratings created');

  // ----- ORDERS -----
  for (let i = 0; i < 100; i++) {
    const orderUser = faker.helpers.arrayElement(users);
    const orderBooks = faker.helpers.arrayElements(books, faker.number.int({ min: 1, max: 5 }));
    
    await prisma.order.create({
      data: {
        userId: orderUser.id,
        status: faker.helpers.arrayElement([OrderStatus.PENDING, OrderStatus.COMPLETED, OrderStatus.CANCELLED]),
        items: {
          create: orderBooks.map((b) => ({
            bookId: b.id,
            quantity: faker.number.int({ min: 1, max: 3 }),
          })),
        },
      },
    });
  }
  console.log('🛒 100 orders created');

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
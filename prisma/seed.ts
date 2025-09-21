import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // ----- VYČISTENIE DATABÁZY -----
  await prisma.token.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.bookTag.deleteMany();
  await prisma.book.deleteMany();
  await prisma.category.deleteMany();
  await prisma.author.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  // ----- ROLES -----
  await prisma.role.createMany({
    data: [
      { name: 'ADMIN' },
      { name: 'STUDENT' },
      { name: 'TEACHER' },
    ],
  });

  // ----- USERS -----
  const hashedPassword = await bcrypt.hash('Password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: { connect: { name: 'ADMIN' } },
    },
  });

  const student = await prisma.user.create({
    data: {
      email: 'student@example.com',
      name: 'John Student',
      password: hashedPassword,
      role: { connect: { name: 'STUDENT' } },
    },
  });

  // ----- CATEGORY -----
  const fiction = await prisma.category.create({
    data: {
      name: 'Fiction',
      description: 'Fictional works and novels',
    },
  });

  // ----- AUTHOR -----
  const author = await prisma.author.create({
    data: {
      name: 'William Shakespeare',
      bio: 'English playwright, poet, and actor',
      litPeriod: 'Renaissance',
      bornDate: '1564-04-26',
      deathDate: '1616-04-23',
    },
  });

  // ----- BOOK TAGS -----
  const classicTag = await prisma.bookTag.create({
    data: { name: 'Classic' },
  });

  const dramaTag = await prisma.bookTag.create({
    data: { name: 'Drama' },
  });

  // ----- BOOK -----
  const book = await prisma.book.create({
    data: {
      name: 'Hamlet',
      description: 'A tragedy written by William Shakespeare.',
      year: 1600,
      category: { connect: { id: fiction.id } },
      author: { connect: { id: author.id } },
      bookTags: { connect: [{ id: classicTag.id }, { id: dramaTag.id }] },
    },
  });

  // ----- RATING -----
  await prisma.rating.create({
    data: {
      bookId: book.id,
      value: 5,
      comment: 'A timeless classic!',
    },
  });

  // ----- ORDER + ORDER ITEM -----
  const order = await prisma.order.create({
    data: {
      userId: student.id,
      status: 'PENDING',
      items: {
        create: [
          {
            bookId: book.id,
            quantity: 1,
          },
        ],
      },
    },
  });

  console.log('✅ Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

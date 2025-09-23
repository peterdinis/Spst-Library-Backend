import { PrismaClient, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: passwordHash,
    },
  });
  console.log('✅ Created admin:', admin.id);

  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@example.com',
      name: 'Teacher User',
      password: passwordHash,
    },
  });
  console.log('✅ Created teacher:', teacher.id);

  const student = await prisma.user.create({
    data: {
      email: 'student@example.com',
      name: 'Student User',
      password: passwordHash,
    },
  });
  console.log('✅ Created student:', student.id);

  // Categories
  const fiction = await prisma.category.create({
    data: { name: 'Fiction', description: 'Fictional books' },
  });
  const science = await prisma.category.create({
    data: { name: 'Science', description: 'Scientific books' },
  });
  console.log('✅ Created categories:', fiction.id, science.id);

  // Authors
  const author1 = await prisma.author.create({
    data: {
      name: 'J. K. Rowling',
      bio: 'Author of Harry Potter series',
      litPeriod: 'Contemporary',
      bornDate: '1965-07-31',
    },
  });

  const author2 = await prisma.author.create({
    data: {
      name: 'Stephen Hawking',
      bio: 'Theoretical physicist and cosmologist',
      litPeriod: 'Modern',
      bornDate: '1942-01-08',
      deathDate: '2018-03-14',
    },
  });
  console.log('✅ Created authors:', author1.id, author2.id);

  // Books
  const book1 = await prisma.book.create({
    data: {
      name: 'Harry Potter and the Philosopher’s Stone',
      description: 'Fantasy novel',
      year: 1997,
      categoryId: fiction.id,
      authorId: author1.id,
      isAvailable: true,
      isNew: false,
    },
  });

  const book2 = await prisma.book.create({
    data: {
      name: 'A Brief History of Time',
      description: 'Book on cosmology',
      year: 1988,
      categoryId: science.id,
      authorId: author2.id,
      isAvailable: true,
      isNew: true,
    },
  });
  console.log('✅ Created books:', book1.id, book2.id);

  // Book tags
  const tagFantasy = await prisma.bookTag.create({
    data: {
      name: 'Fantasy',
      books: { connect: [{ id: book1.id }] },
    },
  });

  const tagScience = await prisma.bookTag.create({
    data: {
      name: 'Science',
      books: { connect: [{ id: book2.id }] },
    },
  });
  console.log('✅ Created book tags:', tagFantasy.id, tagScience.id);

  // Ratings
  await prisma.rating.createMany({
    data: [
      { bookId: book1.id, value: 5, comment: 'Amazing book!' },
      { bookId: book2.id, value: 4, comment: 'Very insightful.' },
    ],
  });
  console.log('✅ Created ratings');

  // Orders
  await prisma.order.create({
    data: {
      userId: student.id,
      status: OrderStatus.PENDING,
      items: {
        create: [
          { bookId: book1.id, quantity: 1 },
          { bookId: book2.id, quantity: 2 },
        ],
      },
    },
    include: { items: true },
  });

  await prisma.order.create({
    data: {
      userId: teacher.id,
      status: OrderStatus.COMPLETED,
      items: {
        create: [{ bookId: book2.id, quantity: 1 }],
      },
    },
    include: { items: true },
  });
  console.log('✅ Created orders');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // ❗ Odstránenie existujúcich dát
  await prisma.order.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.author.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.account.deleteMany({});

  // Create Categories
  const categories = await Promise.all(
    ['Fiction', 'Non-fiction', 'Science', 'History', 'Poetry', 'Drama'].map(name =>
      prisma.category.create({ data: { name } })
    )
  );

  // Create Authors
  const authors = await Promise.all(
    Array.from({ length: 100 }).map(() =>
      prisma.author.create({
        data: {
          name: faker.person.fullName(),
          litPeriod: faker.helpers.arrayElement(['Romanticism', 'Realism', 'Modernism', 'Postmodernism']),
          dateBorn: faker.date.past({ years: 80, refDate: new Date(1950, 0, 1) }),
          dateDeath: faker.helpers.maybe(() => faker.date.past({ years: 20 }), { probability: 0.5 }),
          nationality: faker.location.country(),
          bio: faker.lorem.paragraph(),
        },
      })
    )
  );

  // Create Books s novými stĺpcami
  const books = await Promise.all(
    Array.from({ length: 200 }).map(() =>
      prisma.book.create({
        data: {
          title: faker.lorem.words({ min: 2, max: 5 }),
          quantity: faker.number.int({ min: 1, max: 10 }),
          authorId: faker.helpers.arrayElement(authors).id,
          categoryId: faker.helpers.arrayElement(categories).id,
          publisherName: faker.company.name(),
          isbn: faker.string.alphanumeric(13),
          publishedYear: faker.date.past({ years: 70 }).getFullYear(),
          description: faker.lorem.paragraph(),
          coverImageUrl: faker.image.urlLoremFlickr({ category: 'books' }),
          language: faker.helpers.arrayElement(['English', 'Slovak', 'German', 'French']),
          isAviable: faker.datatype.boolean(),
          isBorrowed: faker.datatype.boolean(), 
        },
      })
    )
  );

  // Create Accounts
  const accounts = await Promise.all(
    Array.from({ length: 100 }).map((_, i) =>
      prisma.account.create({
        data: {
          name: faker.person.fullName(),
          username: faker.internet.userName(),
          email: faker.internet.email(),
          password: faker.internet.password(), // ❗ Use hashed passwords in production
          role: i === 0 ? Role.ADMIN : faker.helpers.arrayElement([Role.STUDENT, Role.TEACHER]),
          isActive: true,
        },
      })
    )
  );

  // Create Orders
  await Promise.all(
    Array.from({ length: 150 }).map(() =>
      prisma.order.create({
        data: {
          accountId: faker.helpers.arrayElement(accounts).id,
          bookId: faker.helpers.arrayElement(books).id,
          status: faker.helpers.arrayElement(Object.values(OrderStatus)),
        },
      })
    )
  );

  console.log('✅ Database seeded with isAvailable and isBorrowed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

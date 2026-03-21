import { PrismaClient, AgeGroup, CourseLevel, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const courseTemplates = [
  {
    title: 'Как работают деньги',
    slug: 'kak-rabotayut-dengi',
    description: 'Базовый курс для подростков: от истории денег до первых финансовых привычек.',
    ageGroup: AgeGroup.teen,
    level: CourseLevel.beginner,
    coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    lessons: [
      'Что такое деньги и почему они ценны',
      'Доходы, расходы и первые цели',
      'Как работает карманный бюджет',
      'Безопасность карт и онлайн-платежей'
    ]
  },
  {
    title: 'Первая зарплата и личный бюджет',
    slug: 'pervaya-zarplata-i-lichnyy-byudzhet',
    description: 'Практический курс о планировании расходов, накоплениях и финансовой дисциплине.',
    ageGroup: AgeGroup.young,
    level: CourseLevel.intermediate,
    coverImage: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80',
    lessons: [
      'Финансовые цели на год',
      'Метод 50/30/20 на практике',
      'Подушка безопасности',
      'Налоги, самозанятость и документы',
      'Первые шаги к инвестиционной грамотности'
    ]
  },
  {
    title: 'Защита сбережений от инфляции',
    slug: 'zashchita-sberezheniy-ot-inflyatsii',
    description: 'Курс для взрослых о защите капитала, резервном фонде и осознанных финансовых решениях.',
    ageGroup: AgeGroup.adult,
    level: CourseLevel.advanced,
    coverImage: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=1200&q=80',
    lessons: [
      'Что инфляция делает с накоплениями',
      'Личный антиинфляционный план',
      'Распределение активов без спешки',
      'Стратегия ликвидной подушки',
      'Семейный финансовый сценарий'
    ]
  }
];

async function main() {
  await prisma.quizResult.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.webinarEnrollment.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.article.deleteMany();
  await prisma.botFeature.deleteMany();
  await prisma.webinar.deleteMany();
  await prisma.contactRequest.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  const [admin, teenUser, youngUser, adultUser] = await Promise.all([
    prisma.user.create({ data: { name: 'Админ FinSkills', email: 'admin@finskills.pro', passwordHash, ageGroup: AgeGroup.adult, role: Role.admin } }),
    prisma.user.create({ data: { name: 'Алина', email: 'teen@finskills.pro', passwordHash, ageGroup: AgeGroup.teen } }),
    prisma.user.create({ data: { name: 'Максим', email: 'young@finskills.pro', passwordHash, ageGroup: AgeGroup.young } }),
    prisma.user.create({ data: { name: 'Елена', email: 'adult@finskills.pro', passwordHash, ageGroup: AgeGroup.adult } })
  ]);

  for (const template of courseTemplates) {
    const course = await prisma.course.create({
      data: {
        title: template.title,
        slug: template.slug,
        description: template.description,
        ageGroup: template.ageGroup,
        level: template.level,
        coverImage: template.coverImage,
        isPublished: true
      }
    });

    for (let index = 0; index < template.lessons.length; index++) {
      const lessonTitle = template.lessons[index];
      const lesson = await prisma.lesson.create({
        data: {
          courseId: course.id,
          title: lessonTitle,
          description: `Практический урок: ${lessonTitle.toLowerCase()}.`,
          videoUrl: 'https://www.youtube.com/embed/1e8xgF0JtVg',
          content: `# ${lessonTitle}\n\nВ этом уроке пользователь изучает ключевые принципы, получает примеры из жизни и мини-чеклист для внедрения навыка.\n\n- понятные определения\n- практические кейсы\n- домашнее задание\n- рекомендации по семейному или личному бюджету`,
          order: index + 1,
          durationMinutes: 12 + index * 3
        }
      });

      const quiz = await prisma.quiz.create({
        data: {
          lessonId: lesson.id,
          title: `Тест: ${lessonTitle}`
        }
      });

      await prisma.quizQuestion.createMany({
        data: [
          {
            quizId: quiz.id,
            question: `Какой главный вывод из темы «${lessonTitle}»?`,
            optionA: 'Планировать и анализировать решения',
            optionB: 'Игнорировать бюджет',
            optionC: 'Ждать удачного момента без подготовки',
            optionD: 'Тратить без целей',
            correctAnswer: 'A'
          },
          {
            quizId: quiz.id,
            question: 'Что помогает развивать финансовую устойчивость?',
            optionA: 'Отсутствие записей расходов',
            optionB: 'Резерв и план действий',
            optionC: 'Эмоциональные покупки',
            optionD: 'Случайные решения',
            correctAnswer: 'B'
          }
        ]
      });
    }
  }

  const allLessons = await prisma.lesson.findMany({ include: { quiz: true } });
  const startedLessons = allLessons.slice(0, 4);
  for (const lesson of startedLessons) {
    await prisma.userProgress.create({
      data: {
        userId: youngUser.id,
        lessonId: lesson.id,
        completed: true,
        completedAt: new Date()
      }
    });
    if (lesson.quiz) {
      await prisma.quizResult.create({
        data: { userId: youngUser.id, quizId: lesson.quiz.id, score: 80 }
      });
    }
  }

  await prisma.botFeature.createMany({
    data: [
      { title: 'Напоминания', description: 'Мягкие напоминания о целях, вебинарах и заданиях.', icon: 'Bell' },
      { title: 'Ответы на вопросы', description: 'Краткие объяснения терминов и понятий по финансовой грамотности.', icon: 'MessageCircleQuestion' },
      { title: 'Финансовые сводки', description: 'Образовательные обзоры рынка без рекомендаций к покупке или продаже.', icon: 'BarChart3' },
      { title: 'Полезные привычки', description: 'Подсказки по бюджету, накоплениям и дисциплине.', icon: 'Sparkles' }
    ]
  });

  await prisma.webinar.createMany({
    data: [
      {
        title: 'Как говорить с подростком о деньгах',
        description: 'Практический вебинар о семейных привычках и вовлечении детей в планирование бюджета.',
        speaker: 'Мария Левина',
        date: new Date('2026-04-10T16:00:00.000Z'),
        meetingUrl: 'https://example.com/webinar-1',
        isPublished: true
      },
      {
        title: 'Бюджет без стресса: первые 30 дней',
        description: 'Пошаговый вебинар для молодых специалистов и студентов.',
        speaker: 'Игорь Нечаев',
        date: new Date('2026-04-15T18:00:00.000Z'),
        meetingUrl: 'https://example.com/webinar-2',
        isPublished: true
      },
      {
        title: 'Инфляция и стратегия личной устойчивости',
        description: 'Разбор сценариев защиты сбережений и распределения резервов.',
        speaker: 'Ольга Громова',
        date: new Date('2026-04-22T17:30:00.000Z'),
        meetingUrl: 'https://example.com/webinar-3',
        isPublished: true
      }
    ]
  });

  await prisma.article.createMany({
    data: [
      { title: 'Как вести бюджет без сложных таблиц', slug: 'kak-vesti-byudzhet-bez-slozhnyh-tablic', excerpt: 'Простой подход к учёту денег для начинающих.', content: '# Бюджет\n\nСоставьте 3 категории расходов и следите за регулярностью.', category: 'бюджет', isPublished: true },
      { title: 'Инфляция простыми словами', slug: 'inflyaciya-prostymi-slovami', excerpt: 'Почему цены растут и как это учитывать в планах.', content: '# Инфляция\n\nИнфляция снижает покупательную способность денег.', category: 'инфляция', isPublished: true },
      { title: 'Налоги для новичка', slug: 'nalogi-dlya-novichka', excerpt: 'Что важно понимать про налоговые обязанности.', content: '# Налоги\n\nИзучите свой статус и виды обязательств.', category: 'налоги', isPublished: true },
      { title: 'Инвестиции без мифов', slug: 'investicii-bez-mifov', excerpt: 'Образовательный взгляд на риск, горизонт и диверсификацию.', content: '# Инвестиции\n\nСначала цель, потом инструмент.', category: 'инвестиции', isPublished: true },
      { title: '5 финансовых привычек на каждый день', slug: '5-finansovyh-privychek-na-kazhdyj-den', excerpt: 'Небольшие действия, которые улучшают устойчивость.', content: '# Привычки\n\nРегулярность важнее идеальности.', category: 'финансовые привычки', isPublished: true }
    ]
  });

  const firstWebinar = await prisma.webinar.findFirstOrThrow();
  await prisma.webinarEnrollment.create({
    data: { userId: adultUser.id, webinarId: firstWebinar.id }
  });

  console.log({ admin: admin.email, demoUsers: [teenUser.email, youngUser.email, adultUser.email] });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

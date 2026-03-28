import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type LessonInput = { title: string; description: string };
type CourseInput = {
  ageGroup: '14-17' | '18-25' | '26+';
  isFree: boolean;
  title: string;
  slug: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  coverImage: string;
  lessons: LessonInput[];
};

const LESSON_PLACEHOLDER_CONTENT = `# Материал готовится

Подробный текст урока будет добавлен в следующем обновлении.

## Что сделать сейчас
- Прочитайте название урока и сформулируйте 1–2 вопроса по теме.
- Подготовьте короткий список личных наблюдений, связанных с темой урока.
- После публикации контента вернитесь к этому уроку и пройдите его полностью.`;

const COURSES: CourseInput[] = [
  {
    ageGroup: '14-17',
    isFree: true,
    title: 'Мои первые деньги: как копить и не спускать на ерунду',
    slug: 'moi-pervye-dengi-kak-kopit-i-ne-spuskat-na-erundu',
    description: 'Базовый курс для подростков о карманных деньгах, накоплениях и осознанных покупках.',
    level: 'beginner',
    coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    lessons: [
      { title: 'Деньги — это инструмент. Почему они заканчиваются?', description: 'Разбираем, как ежедневные решения влияют на баланс денег.' },
      { title: 'Копилка 2.0. Как накопить на новый телефон или кроссовки.', description: 'Учимся ставить цель, срок и комфортный шаг накопления.' },
      { title: 'Ловушки маркетологов и скидки, которые тебе врут.', description: 'Тренируем навык отличать реальную выгоду от манипуляции.' }
    ]
  },
  {
    ageGroup: '14-17',
    isFree: false,
    title: 'Подросток-капиталист: заработок и безопасность',
    slug: 'podrostok-kapitalist-zarabotok-i-bezopasnost',
    description: 'Премиум-курс о первом заработке, банковских инструментах и защите от мошенников.',
    level: 'intermediate',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    lessons: [
      { title: 'Как легально заработать до 18 лет в интернете и офлайн.', description: 'Разбираем безопасные форматы подработки и критерии выбора.' },
      { title: 'Твоя первая банковская карта. Как не платить комиссии.', description: 'Понимаем тарифы, комиссии и базовые правила пользования картой.' },
      { title: 'Осторожно, скам! Как мошенники крадут деньги в Telegram и играх.', description: 'Учимся распознавать типовые схемы цифрового мошенничества.' },
      { title: 'Магия сложного процента. Как стать миллионером к 30 годам.', description: 'Вводный урок о долгом горизонте и силе регулярных вложений.' }
    ]
  },
  {
    ageGroup: '18-25',
    isFree: true,
    title: 'Свободное плавание: база для выживания',
    slug: 'svobodnoe-plavanie-baza-dlya-vyzhivaniya',
    description: 'Курс для студентов и молодых специалистов о базовой финансовой устойчивости.',
    level: 'beginner',
    coverImage: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=1200&q=80',
    lessons: [
      { title: 'Первая зарплата. Как разделить деньги (Правило 50/30/20).', description: 'Настраиваем базовую структуру месячного бюджета.' },
      { title: 'Кредитки — абсолютное зло или полезный инструмент?', description: 'Разбираем риски и сценарии ответственного использования кредитки.' },
      { title: 'Финансовая подушка безопасности. Как собрать первые 100 000 руб.', description: 'Пошагово собираем резерв для спокойствия и гибкости.' }
    ]
  },
  {
    ageGroup: '18-25',
    isFree: false,
    title: 'Взлом системы: как создать первый капитал',
    slug: 'vzlom-sistemy-kak-sozdat-pervyj-kapital',
    description: 'Премиум-курс о росте дохода, базовых инвестициях и налоговых инструментах.',
    level: 'intermediate',
    coverImage: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80',
    lessons: [
      { title: 'Аренда жилья vs Ипотека. Математика самостоятельной жизни.', description: 'Сравниваем два сценария на горизонте нескольких лет.' },
      { title: 'Как просить повышение и увеличить доход за год на 30%.', description: 'Готовим аргументацию и стратегию переговоров по доходу.' },
      { title: 'Брокерский счет для новичков. Акции, облигации и фонды.', description: 'Вводим базовые инструменты и риски инвестиционного старта.' },
      { title: 'Налоги в твою пользу. Как вернуть деньги (Налоговые вычеты).', description: 'Объясняем, какие вычеты доступны и как их оформлять.' }
    ]
  },
  {
    ageGroup: '26+',
    isFree: true,
    title: 'Финансовый детокс: берем бюджет под контроль',
    slug: 'finansovyj-detoks-berem-byudzhet-pod-kontrol',
    description: 'Курс для взрослых о ревизии расходов, антидолговой дисциплине и защите накоплений.',
    level: 'beginner',
    coverImage: 'https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?auto=format&fit=crop&w=1200&q=80',
    lessons: [
      { title: 'Аудит расходов. Куда утекают деньги и как найти "черные дыры".', description: 'Проводим ревизию категорий расходов и находим утечки.' },
      { title: 'Инфляция съедает сбережения. Как правильно хранить деньги.', description: 'Выбираем структуру хранения денег под цели и сроки.' },
      { title: 'Долги и кредиты. Две стратегии быстрого погашения.', description: 'Разбираем рабочие подходы к ускоренному закрытию долгов.' }
    ]
  },
  {
    ageGroup: '26+',
    isFree: false,
    title: 'Семейный финдиректор и Инвестор PRO',
    slug: 'semejnyj-findirektor-i-investor-pro',
    description: 'Премиум-курс для семей о стратегическом бюджете, ипотеке и долгосрочном капитале.',
    level: 'advanced',
    coverImage: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
    lessons: [
      { title: 'Семейный бюджет без ссор.', description: 'Выстраиваем прозрачные правила и роли в семейных финансах.' },
      { title: 'Умная ипотека. Как сократить переплату банку в 2 раза.', description: 'Изучаем инструменты снижения переплаты по ипотеке.' },
      { title: 'Долгосрочный инвестиционный портфель (пенсия и пассивный доход).', description: 'Собираем базовую модель семейного долгосрочного портфеля.' },
      { title: 'Детский капитал. Как обеспечить ребенку старт в жизни.', description: 'Планируем накопления на образование и стартовый капитал ребёнка.' }
    ]
  }
];

async function clearCourseTables() {
  await prisma.quizResult.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
}

async function seedCourses() {
  for (const course of COURSES) {
    const createdCourse = await prisma.course.create({
      data: {
        title: course.title,
        slug: course.slug,
        description: course.description,
        ageGroup: course.ageGroup,
        level: course.level,
        coverImage: course.coverImage,
        isPublished: true,
        isPremium: !course.isFree
      }
    });

    for (const [index, lesson] of course.lessons.entries()) {
      await prisma.lesson.create({
        data: {
          courseId: createdCourse.id,
          title: lesson.title,
          description: lesson.description,
          videoUrl: '',
          content: LESSON_PLACEHOLDER_CONTENT,
          order: index + 1,
          durationMinutes: 15
        }
      });
    }
  }
}

async function main() {
  await clearCourseTables();
  await seedCourses();

  console.log({
    cleared: ['quizResult', 'userProgress', 'quizQuestion', 'quiz', 'lesson', 'course'],
    seededCourses: COURSES.length,
    seededLessons: COURSES.reduce((sum, item) => sum + item.lessons.length, 0)
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

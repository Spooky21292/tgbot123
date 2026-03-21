import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { RUSSIAN_ASSETS } from '../lib/russian-assets';

const prisma = new PrismaClient();
const lessonVideo = 'https://www.youtube.com/embed/1e8xgF0JtVg';

type LessonSeed = { title: string; description: string; videoUrl: string; content: string };
type CourseSeed = { title: string; slug: string; description: string; age: string; level: string; cover: string; isPremium: boolean; lessons: LessonSeed[] };
type CourseBlueprint = { title: string; slug: string; description: string; age: string; level: string; cover: string; isPremium: boolean; focus: string; practical: string };
type ArticleBlueprint = { title: string; slug: string; category: string; excerpt: string; angle: string; audience: string };

const coverPool = [
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80'
];

function makeLesson(title: string, description: string, focus: string, audience: string, practical: string, step: string): LessonSeed {
  const content = `# ${title}

${audience} сталкивается с темой «${focus}» не в вакууме, а в повседневных решениях: покупки, обязательства, разговоры с семьёй, планы на обучение, подработка, рост дохода, тревога из-за ошибок и желание чувствовать больше контроля. Этот урок устроен как подробный конспект, который помогает не просто «узнать термин», а увидеть, как тема работает в реальной жизни.

## Что важно понять в самом начале

Финансовая грамотность редко строится на одном ярком инсайте. Гораздо чаще она складывается из маленьких спокойных действий: замечать паттерны, задавать вопросы до решения, не путать импульс и цель, отделять приятное от действительно важного. Когда человек начинает делать это регулярно, он ощущает не только экономическую пользу, но и психологическую опору.

## Как эта тема проявляется в повседневности

Тема «${focus}» влияет на то, как человек планирует месяц, переживает неожиданные траты, относится к накоплениям и видит свои возможности в будущем. Если не разбираться в ней, решения принимаются по настроению: сегодня экономить, завтра компенсировать усталость покупкой, потом снова тревожиться из-за хаоса. Если же выстраивать систему, появляется ритм: понятно, на что идут деньги, что действительно приоритетно и где у решения есть последствия.

## На что смотреть особенно внимательно

- где в этой теме чаще всего возникает самообман
- какие траты или решения выглядят маленькими, но на дистанции меняют картину
- какие правила реально можно поддерживать месяцами
- как не спутать удобство, срочность или чужой пример со своим интересом
- как превратить знание в конкретное действие уже на этой неделе

## Пример из жизни

Представьте ситуацию: человек хочет действовать правильно, но у него нет чёткой логики. Он ориентируется на остаток на карте, откладывает важные разговоры, не фиксирует цели и надеется, что «в следующий раз всё будет лучше». Обычно это приводит к повторяющемуся циклу: напряжение → импульсивное решение → краткое облегчение → новая тревога. Как только появляется система вокруг темы «${focus}», напряжение снижается. Даже если доход не меняется мгновенно, меняется качество решений.

💡 Совет: ${practical}. Сильные финансовые привычки выглядят не как подвиг, а как повторяемое спокойное действие.

⚠️ Ошибка: ждать идеального момента, чтобы навести порядок. Идеального момента почти никогда не бывает, зато есть первый рабочий шаг.

## Что делать после урока

${step}

## Вопросы для самостоятельной работы

- Что в теме «${focus}» вызывает у меня больше всего путаницы или напряжения?
- Какое правило я готов внедрить сразу, чтобы проверить его в реальной жизни?
- Где я чаще действую по эмоции, а где уже умею действовать по плану?
- Какие разговоры или решения я слишком долго откладываю?
- Что должно измениться через месяц, чтобы я почувствовал реальный прогресс?
`;

  return { title, description, videoUrl: lessonVideo, content };
}

function buildCourseLessons(blueprint: CourseBlueprint): LessonSeed[] {
  const topics = [
    ['База и карта решений', `Как устроена тема «${blueprint.focus}» и почему без неё сложно принимать спокойные решения.`, 'Составьте короткую карту: что в этой теме у вас уже под контролем, а что пока требует внимания.'],
    ['Повседневный ритм и ошибки', `Разобрать повседневные сценарии, где «${blueprint.focus}» сильнее всего влияет на деньги и поведение.`, 'В течение недели отмечайте минимум три ситуации, где тема урока повлияла на ваши решения.'],
    ['Практика, правила и личные ориентиры', `Собрать рабочие правила, которые помогают держать тему «${blueprint.focus}» под контролем без перегруза.`, 'Запишите 3 собственных правила и проверьте их на практике в течение 7 дней.'],
    ['Долгий горизонт и устойчивость', `Перевести тему «${blueprint.focus}» в систему, которая будет работать и через месяц, и через год.`, 'Сделайте мини-план на 30 дней: что вы будете пересматривать, отслеживать и улучшать.']
  ];

  return topics.map(([suffix, description, step], index) =>
    makeLesson(
      `${blueprint.title}: ${suffix}`,
      description,
      blueprint.focus,
      blueprint.age === '14-17' ? 'Подросток и его семья' : blueprint.age === '18-25' ? 'Студент, молодой специалист или фрилансер' : 'Взрослый человек или семья',
      blueprint.practical,
      `${step} Дополнительно вернитесь к своему бюджету, привычкам и ближайшей цели, чтобы связать урок с реальной жизнью. Шаг ${index + 1} лучше делать письменно — так выводы становятся конкретнее.`
    )
  );
}

const courseBlueprints: CourseBlueprint[] = [
  { title: 'Финансовая грамотность для подростков: деньги, безопасность и первые решения', slug: 'finansovaya-gramotnost-dlya-podrostkov-dengi-i-bezopasnost', description: 'Большой курс для 14–17 лет: деньги, бюджет, резерв, цифровая безопасность и первые самостоятельные решения.', age: '14-17', level: 'beginner', cover: coverPool[0], isPremium: false, focus: 'деньги, привычки и безопасность', practical: 'После любого поступления денег сначала выделяйте часть на цель или запас, а уже потом переходите к тратам' },
  { title: 'Подросток и первый доход: карманные деньги, подработка и договорённости', slug: 'podrostok-i-pervyj-dohod-karmannye-dengi-i-podrabotka', description: 'Курс о первых доходах подростка, отношениях с деньгами и безопасной подработке.', age: '14-17', level: 'beginner', cover: coverPool[1], isPremium: false, focus: 'первый доход и ответственность', practical: 'Фиксируйте договорённости по срокам и оплате даже для маленькой подработки' },
  { title: 'Онлайн-безопасность и карты для подростков', slug: 'onlajn-bezopasnost-i-karty-dlya-podrostkov', description: 'Практический курс о картах, комиссиях, подписках, фишинге и защите денег в интернете.', age: '14-17', level: 'intermediate', cover: coverPool[2], isPremium: true, focus: 'цифровая осторожность и банковские привычки', practical: 'Любое подозрительное сообщение перепроверяйте через официальное приложение или личный звонок' },
  { title: 'Как копить на цели без давления и срывов', slug: 'kak-kopit-na-celi-bez-davleniya-i-sryvov', description: 'Большой курс о целях, накоплениях, резерве и спокойной мотивации.', age: '14-17', level: 'intermediate', cover: coverPool[3], isPremium: true, focus: 'накопления и личные цели', practical: 'Разделите деньги на повседневные, целевые и резервные, чтобы не смешивать задачи' },
  { title: 'Первая зарплата без хаоса: взрослый финансовый старт', slug: 'pervaya-zarplata-bez-haosa-vzroslyj-finansovyj-start', description: 'Курс для 18–25 о первой зарплате, структуре месяца, подписках и базовом резерве.', age: '18-25', level: 'beginner', cover: coverPool[4], isPremium: false, focus: 'первая зарплата и структура месяца', practical: 'День зарплаты используйте как точку распределения денег, а не как старт спонтанных трат' },
  { title: 'Бюджет молодого взрослого: жильё, транспорт и подписки', slug: 'byudzhet-molodogo-vzroslogo-zhilyo-transport-i-podpiski', description: 'Курс о взрослом бюджете, регулярных платежах и защите от утечек.', age: '18-25', level: 'intermediate', cover: coverPool[5], isPremium: true, focus: 'регулярные расходы и бюджет месяца', practical: 'Раз в неделю сверяйте повторяющиеся списания и сравнивайте их с планом' },
  { title: 'Фриланс без хаоса: деньги, сроки и уважение к своему времени', slug: 'frilans-bez-haosa-dengi-sroki-i-uvazhenie-k-svoemu-vremeni', description: 'Большой курс о проектной работе, цене времени, переговорах и стабильности.', age: '18-25', level: 'intermediate', cover: coverPool[1], isPremium: true, focus: 'проектная работа и нестабильный доход', practical: 'Записывайте результат, сроки и стоимость проекта до старта работы' },
  { title: 'Налоги и финансовая аккуратность для начинающих специалистов', slug: 'nalogi-i-finansovaya-akkuratnost-dlya-nachinayushchih-specialistov', description: 'Курс о том, как подойти к налоговой теме и документам без страха.', age: '18-25', level: 'intermediate', cover: coverPool[2], isPremium: true, focus: 'налоги, документы и финансовая чистота', practical: 'Храните подтверждения оплат, переписки и договорённостей в одной понятной системе' },
  { title: 'Инвестиции для начинающих без обещаний быстрой прибыли', slug: 'investicii-dlya-nachinayushchih-bez-obeshchanij-bystroj-pribyli', description: 'Курс о рынке, риске, горизонте, дисциплине и поведенческих ошибках.', age: '18-25', level: 'advanced', cover: coverPool[3], isPremium: true, focus: 'инвестиционное мышление и риск', practical: 'Перед любым рыночным действием проверяйте цель, срок и допустимый риск' },
  { title: 'Деньги и карьера: как расти без эмоционального выгорания', slug: 'dengi-i-karera-kak-rasti-bez-emocionalnogo-vygoraniya', description: 'Курс о росте дохода, карьерных решениях и защите личного ресурса.', age: '18-25', level: 'advanced', cover: coverPool[4], isPremium: true, focus: 'карьерные решения и рост дохода', practical: 'Оценивайте предложения не только по сумме, но и по нагрузке, времени и последствиям' },
  { title: 'Финансовая безопасность в цифровой среде', slug: 'finansovaya-bezopasnost-v-cifrovoj-srede', description: 'Курс о картах, маркетплейсах, подписках, фишинге и бытовой цифровой дисциплине.', age: '18-25', level: 'beginner', cover: coverPool[5], isPremium: false, focus: 'безопасность цифровых денег', practical: 'Возвращайте себе паузу перед любой онлайн-оплатой и проверяйте источник' },
  { title: 'Личная финансовая система: как собрать рабочий план на год', slug: 'lichnaya-finansovaya-sistema-kak-sobrat-rabochij-plan-na-god', description: 'Курс о целях, приоритетах, резерве и системной ревизии финансов.', age: '18-25', level: 'advanced', cover: coverPool[0], isPremium: true, focus: 'личная стратегия и приоритеты', practical: 'Раз в месяц проводите короткую финансовую ревизию с обновлением целей и рисков' },
  { title: 'Сбережения и защита капитала: спокойная стратегия для жизни и семьи', slug: 'sberezheniya-i-zashchita-kapitala-spokojnaya-strategiya', description: 'Курс для 26+ о семейной финансовой системе, инфляции, резерве и стратегии на год.', age: '26+', level: 'advanced', cover: coverPool[1], isPremium: true, focus: 'сбережения, защита капитала и устойчивость', practical: 'Разделите деньги на быстрый резерв, среднесрочные цели и долгий горизонт' },
  { title: 'Семейный бюджет без взаимных претензий', slug: 'semejnyj-byudzhet-bez-vzaimnyh-pretenzij', description: 'Большой курс о совместных деньгах, ролях, целях и семейных правилах.', age: '26+', level: 'intermediate', cover: coverPool[2], isPremium: false, focus: 'семейный бюджет и договорённости', practical: 'Проводите короткий семейный финансовый разговор в спокойное время, а не после конфликта' },
  { title: 'Инфляция, цены и покупательная способность без паники', slug: 'inflyaciya-ceny-i-pokupatelnaya-sposobnost-bez-paniki', description: 'Курс о влиянии инфляции на повседневные решения, цели и структуру накоплений.', age: '26+', level: 'intermediate', cover: coverPool[3], isPremium: false, focus: 'инфляция и повседневные решения', practical: 'Раз в квартал обновляйте стоимость крупных целей и семейных обязательств' },
  { title: 'Резерв и сценарии безопасности для семьи', slug: 'rezerv-i-scenarii-bezopasnosti-dlya-semi', description: 'Курс о ликвидности, запасе и подготовке к нестабильным периодам.', age: '26+', level: 'intermediate', cover: coverPool[4], isPremium: true, focus: 'резерв, ликвидность и стресс-сценарии', practical: 'Опишите 3 сценария, где резерв нужен срочно, и держите сумму для них отдельно' },
  { title: 'Крупные семейные цели: жильё, обучение, отпуск, переходы', slug: 'krupnye-semejnye-celi-zhilyo-obuchenie-otpusk-perehody', description: 'Курс о больших целях, сроках, приоритетах и семейной мотивации.', age: '26+', level: 'intermediate', cover: coverPool[5], isPremium: true, focus: 'крупные цели и распределение ресурсов', practical: 'Каждую крупную цель переводите в сумму, срок и ежемесячный шаг' },
  { title: 'Финансовая устойчивость при нестабильном доходе', slug: 'finansovaya-ustojchivost-pri-nestabilnom-dohode', description: 'Курс для семей и взрослых специалистов о периодах нестабильности и антикризисном плане.', age: '26+', level: 'advanced', cover: coverPool[0], isPremium: true, focus: 'нестабильный доход и антикризисная логика', practical: 'Заранее определите, какие расходы сокращаются в первую очередь при просадке дохода' },
  { title: 'Поведенческие ошибки взрослых инвесторов', slug: 'povedencheskie-oshibki-vzroslyh-investorov', description: 'Курс о страхе, жадности, спешке и системах защиты от эмоциональных решений.', age: '26+', level: 'advanced', cover: coverPool[1], isPremium: true, focus: 'поведенческие ошибки и защита от импульса', practical: 'Перед крупным решением делайте обязательную паузу и возвращайтесь к своим правилам' },
  { title: 'Личный и семейный финансовый план на 12 месяцев', slug: 'lichnyj-i-semejnyj-finansovyj-plan-na-12-mesyacev', description: 'Финальный системный курс про годовую стратегию, контроль и приоритеты.', age: '26+', level: 'advanced', cover: coverPool[2], isPremium: true, focus: 'годовая стратегия и финансовый ритм', practical: 'Держите стратегию как живой документ и обновляйте её минимум раз в месяц' }
];

const articleBlueprints: ArticleBlueprint[] = [
  { title: 'Бюджет без перегруза: система, которая держится дольше недели', slug: 'byudzhet-bez-peregruza-sistema-kotoraya-derzhitsya-dolshe-nedeli', category: 'бюджет', excerpt: 'Как превратить контроль расходов в спокойную привычку, которая действительно помогает жить лучше.', angle: 'спокойный бюджет на каждый месяц', audience: 'для человека, который устал от хаотичных трат' },
  { title: 'Как увидеть реальные утечки в расходах, а не ругать себя вслепую', slug: 'kak-uvidet-realnye-utechki-v-rashodah-a-ne-rugat-sebya-vslepuju', category: 'бюджет', excerpt: 'Практический взгляд на мелкие траты, подписки и повседневные деньги.', angle: 'поиск утечек в бюджете', audience: 'для подростка, студента и взрослого' },
  { title: 'Почему бюджет ломается через 5 дней и как это исправить', slug: 'pochemu-byudzhet-lomaetsya-cherez-5-dnej-i-kak-eto-ispravit', category: 'бюджет', excerpt: 'Не про силу воли, а про слишком тяжёлую систему и отсутствие ритма.', angle: 'устойчивость финансовой системы', audience: 'для тех, кто уже пытался вести бюджет' },
  { title: 'Маркетплейсы, скидки и скрытые траты: почему удобство тоже стоит денег', slug: 'marketplejsy-skidki-i-skrytye-traty-pochemu-udobstvo-tozhe-stoit-deneg', category: 'бюджет', excerpt: 'Как цифровое удобство незаметно меняет расходный ритм и съедает внимание.', angle: 'онлайн-покупки и бюджет', audience: 'для активного пользователя маркетплейсов' },
  { title: 'Бюджет семьи без взаимных претензий: как обсуждать деньги спокойнее', slug: 'byudzhet-semi-bez-vzaimnyh-pretenzij-kak-obsuzhdat-dengi-spokojnee', category: 'семейные финансы', excerpt: 'Как перейти от конфликтов к совместным решениям и понятным правилам.', angle: 'семейные разговоры о деньгах', audience: 'для пары и семьи' },
  { title: 'Подушка безопасности: как собрать резерв, который правда помогает', slug: 'podushka-bezopasnosti-kak-sobrat-rezerv-kotoryj-pravda-pomogaet', category: 'сбережения', excerpt: 'Чем резерв отличается от накоплений на мечту и почему важна ликвидность.', angle: 'резерв и непредвиденные траты', audience: 'для любого уровня дохода' },
  { title: 'Резерв для семьи: сколько нужно и как не держать всё в одной куче', slug: 'rezerv-dlya-semi-skolko-nuzhno-i-kak-ne-derzhat-vsyo-v-odnoj-kuche', category: 'семейные финансы', excerpt: 'Практический материал о слоях финансовой безопасности для семьи.', angle: 'слои семейного резерва', audience: 'для семейной финансовой системы' },
  { title: 'Как копить на большую цель, не превращая жизнь в постоянный отказ', slug: 'kak-kopit-na-bolshuyu-cel-ne-prevraschaya-zhizn-v-postoyannyj-otkaz', category: 'сбережения', excerpt: 'Система накоплений без жёсткого самоограничения и срыва.', angle: 'цели и накопления', audience: 'для тех, кто копит на крупную покупку или обучение' },
  { title: 'Почему маленькие суммы тоже меняют будущее', slug: 'pochemu-malenkie-summy-tozhe-menyayut-budushchee', category: 'сбережения', excerpt: 'О регулярности, привычках и уважении к небольшим деньгам.', angle: 'сила регулярности', audience: 'для новичков в накоплениях' },
  { title: 'Инфляция без паники: как реагировать на рост цен в обычной жизни', slug: 'inflyaciya-bez-paniki-kak-reagirovat-na-rost-cen-v-obychnoj-zhizni', category: 'инфляция', excerpt: 'Как смотреть на рост цен трезво и не ломать стратегию на эмоциях.', angle: 'рост цен и спокойные действия', audience: 'для семейного и личного бюджета' },
  { title: 'Как инфляция меняет планы на год и почему это нормально', slug: 'kak-inflyaciya-menyaet-plany-na-god-i-pochemu-eto-normalno', category: 'инфляция', excerpt: 'О пересмотре целей, сроков и ориентиров без ощущения провала.', angle: 'адаптация целей к росту цен', audience: 'для людей с долгими целями' },
  { title: 'Покупательная способность: что реально важно понимать без сложной экономики', slug: 'pokupatelnaya-sposobnost-chto-realno-vazhno-ponimat-bez-slozhnoj-ekonomiki', category: 'инфляция', excerpt: 'Простой материал о том, как цены влияют на повседневные решения.', angle: 'покупательная способность в быту', audience: 'для широкой аудитории' },
  { title: 'Первая зарплата: 7 решений, которые лучше принять в первый день', slug: 'pervaya-zarplata-7-reshenij-kotorye-luchshe-prinyat-v-pervyj-den', category: 'карьера', excerpt: 'Как выстроить финансовый ритм сразу после первых регулярных поступлений.', angle: 'первый зарплатный день', audience: 'для молодого специалиста' },
  { title: 'Как не потерять контроль над деньгами в первый рабочий год', slug: 'kak-ne-poteryat-kontrol-nad-dengami-v-pervyj-rabochij-god', category: 'карьера', excerpt: 'О взрослом бюджете, темпе расходов и реальности начала карьеры.', angle: 'первый рабочий год', audience: 'для молодых специалистов' },
  { title: 'Фриланс без хаоса: как говорить о деньгах, сроках и правках', slug: 'frilans-bez-haosa-kak-govorit-o-dengah-srokah-i-pravkah', category: 'карьера', excerpt: 'Практические правила для проектной работы без ощущения, что вами пользуются.', angle: 'проектная работа и границы', audience: 'для фрилансера и самозанятого' },
  { title: 'Цена вашего времени: почему её нельзя определять на эмоциях', slug: 'cena-vashego-vremeni-pochemu-eyo-nelzya-opredelyat-na-emociyah', category: 'карьера', excerpt: 'О переговорах, самооценке и зрелом взгляде на стоимость труда.', angle: 'стоимость времени и труда', audience: 'для специалистов и студентов' },
  { title: 'Налоги без страха: как подступиться к теме, если вы только начинаете зарабатывать', slug: 'nalogi-bez-straha-kak-podstupitsya-k-teme-esli-vy-tolko-nachinaete-zarabatyvat', category: 'налоги', excerpt: 'Спокойный вводный материал о налоговой теме без перегруза и паники.', angle: 'первое знакомство с налогами', audience: 'для начинающих специалистов' },
  { title: 'Почему финансовая аккуратность начинается с документов', slug: 'pochemu-finansovaya-akkuratnost-nachinaetsya-s-dokumentov', category: 'налоги', excerpt: 'Как чеки, договорённости и подтверждения снижают тревогу и путаницу.', angle: 'документы и порядок', audience: 'для проектной работы и семьи' },
  { title: 'Какие вопросы о доходе и налогах стоит задать себе заранее', slug: 'kakie-voprosy-o-dohode-i-nalogah-stoit-zadat-sebe-zaranee', category: 'налоги', excerpt: 'Небольшой чек-лист для спокойного старта без откладывания темы.', angle: 'вопросы для самопроверки', audience: 'для тех, кто начинает зарабатывать' },
  { title: 'Финансовая безопасность в интернете: 10 бытовых правил, которые реально работают', slug: 'finansovaya-bezopasnost-v-internete-10-bytovyh-pravil-kotorye-realno-rabotayut', category: 'безопасность', excerpt: 'Набор простых цифровых привычек, которые реально снижают риск потери денег.', angle: 'цифровая осторожность', audience: 'для каждого пользователя интернета' },
  { title: 'Фишинг, поддельные сайты и сообщения от поддержки: как распознать вовремя', slug: 'fishing-poddelnye-sajty-i-soobshcheniya-ot-podderzhki-kak-raspoznat-vovremya', category: 'безопасность', excerpt: 'Практика распознавания типичных мошеннических сценариев без перегруза терминологией.', angle: 'фишинг и цифровой обман', audience: 'для владельцев карт и онлайн-сервисов' },
  { title: 'Почему спешка — главный союзник мошенничества', slug: 'pochemu-speshka-glavnyj-soyuznik-moshennichestva', category: 'безопасность', excerpt: 'Как вернуть себе паузу перед опасным решением.', angle: 'искусственная срочность и риск', audience: 'для повседневных финансовых решений' },
  { title: 'Подросток и первые деньги: как помочь выстроить привычки без давления', slug: 'podrostok-i-pervye-dengi-kak-pomoch-vystroit-privychki-bez-davleniya', category: 'финансовые привычки', excerpt: 'Материал для семьи о карманных деньгах, целях и уважении к самостоятельности подростка.', angle: 'подростковые привычки и семья', audience: 'для родителей и подростков' },
  { title: 'Почему финансовые привычки формируются раньше, чем кажется', slug: 'pochemu-finansovye-privychki-formiruyutsya-ranshe-chem-kazhetsya', category: 'финансовые привычки', excerpt: 'О маленьких решениях, которые незаметно переходят во взрослую жизнь.', angle: 'формирование денежного поведения', audience: 'для подростков и молодых взрослых' },
  { title: 'Как внедрить одну полезную денежную привычку и не сорваться через три дня', slug: 'kak-vnedrit-odnu-poleznuyu-denezhnuyu-privychku-i-ne-sorvatsya-cherez-tri-dnya', category: 'финансовые привычки', excerpt: 'Про системность, мягкий старт и реальный ритм без самообмана.', angle: 'привычка без перегруза', audience: 'для любого возраста' },
  { title: 'Инвестиции без иллюзий: 5 вопросов, которые нужно задать себе до старта', slug: 'investicii-bez-illyuzij-5-voprosov-kotorye-nuzhno-zadat-sebe-do-starta', category: 'инвестиции', excerpt: 'Полезная рамка для знакомства с рынком без спешки и самообмана.', angle: 'вопросы до входа в рынок', audience: 'для начинающих инвесторов' },
  { title: 'Почему высокая доходность без объяснения риска — плохой сигнал', slug: 'pochemu-vysokaya-dohodnost-bez-obyasneniya-riska-plohoy-signal', category: 'инвестиции', excerpt: 'Разговор о риске простым языком без агрессивного маркетинга.', angle: 'доходность и риск', audience: 'для новичков в инвестициях' },
  { title: 'Диверсификация без сложных слов: что это даёт на практике', slug: 'diversifikaciya-bez-slozhnyh-slov-chto-eto-dayot-na-praktike', category: 'инвестиции', excerpt: 'Как распределение риска помогает не зависеть от одной идеи.', angle: 'диверсификация в быту', audience: 'для осторожного инвестора' },
  { title: 'Как отличить обучение рынку от азарта', slug: 'kak-otlichit-obuchenie-rynku-ot-azarta', category: 'инвестиции', excerpt: 'О границе между интересом к рынку и желанием «отыграться» или быстро заработать.', angle: 'инвестиционное мышление против азарта', audience: 'для начинающих и сомневающихся' },
  { title: 'Семейные цели: как договориться о приоритетах, а не спорить о каждой покупке', slug: 'semejnye-celi-kak-dogovoritsya-o-prioritetah-a-ne-sporit-o-kazhdoj-pokupke', category: 'семейные финансы', excerpt: 'Как большие цели помогают меньше конфликтовать о повседневных тратах.', angle: 'цели и приоритеты семьи', audience: 'для пары и семьи' },
  { title: 'Когда доход нестабилен: как семье подготовиться заранее', slug: 'kogda-dohod-nestabilen-kak-seme-podgotovitsya-zaranee', category: 'семейные финансы', excerpt: 'Антикризисная логика без паники и ощущение, что всё держится на волоске.', angle: 'нестабильный доход', audience: 'для семьи и самозанятых' },
  { title: 'Крупные семейные цели без выгорания: отпуск, жильё, обучение и переходы', slug: 'krupnye-semejnye-celi-bez-vygoraniya-otpusk-zhilyo-obuchenie-i-perehody', category: 'семейные финансы', excerpt: 'Как большие планы сделать достижимыми, а не тревожными.', angle: 'долгие цели семьи', audience: 'для планирования на год и больше' },
  { title: 'Как разговаривать о деньгах с подростком без морализаторства', slug: 'kak-razgovarivat-o-dengah-s-podrostkom-bez-moralizatorstva', category: 'финансовые привычки', excerpt: 'Практика семейного диалога, который не разрушает доверие.', angle: 'спокойный разговор с подростком', audience: 'для родителей' },
  { title: 'Карта, подписки и бытовая цифровая дисциплина: что стоит проверить сегодня', slug: 'karta-podpiski-i-bytovaya-cifrovaya-disciplina-chto-stoit-proverit-segodnya', category: 'безопасность', excerpt: 'Небольшой аудит цифровых привычек, который реально снижает риск.', angle: 'цифровой аудит', audience: 'для пользователей банковских приложений' },
  { title: 'Почему сравнение себя с чужими доходами часто ломает финансовый план', slug: 'pochemu-sravnenie-sebya-s-chuzhimi-dohodami-chasto-lomaet-finansovyj-plan', category: 'финансовые привычки', excerpt: 'О соцсетях, тревоге и решениях, которые принимаются не в своих интересах.', angle: 'сравнение и финансовое поведение', audience: 'для подростков и молодых взрослых' },
  { title: 'Накопления без фанатизма: как оставить в бюджете место для жизни', slug: 'nakopleniya-bez-fanatizma-kak-ostavit-v-byudzhete-mesto-dlya-zhizni', category: 'сбережения', excerpt: 'Как совмещать накопление, удовольствие и отсутствие срывов.', angle: 'мягкая система накоплений', audience: 'для личного бюджета' },
  { title: 'Почему план на год полезнее, чем эмоциональные финансовые обещания себе', slug: 'pochemu-plan-na-god-poleznee-chem-emocionalnye-finansovye-obeshchaniya-sebe', category: 'сбережения', excerpt: 'О силе ритма, маленьких шагов и регулярной ревизии.', angle: 'годовой финансовый план', audience: 'для тех, кто хочет системность' },
  { title: 'Как понять, что вы устали от денег, а не от жизни в целом', slug: 'kak-ponyat-chto-vy-ustali-ot-deneg-a-ne-ot-zhizni-v-celom', category: 'финансовые привычки', excerpt: 'Про усталость от хаоса, денежное напряжение и роль системы.', angle: 'психология финансового напряжения', audience: 'для взрослых и молодых специалистов' },
  { title: 'Тревога из-за денег: какие вопросы помогают вернуть ощущение контроля', slug: 'trevoga-iz-za-deneg-kakie-voprosy-pomogayut-vernut-oshchushchenie-kontrolya', category: 'финансовые привычки', excerpt: 'Не про магическое успокоение, а про конкретные точки опоры.', angle: 'контроль вместо хаоса', audience: 'для любого, кто переживает из-за денег' },
  { title: 'Как не путать финансовую осторожность с постоянным страхом', slug: 'kak-ne-putat-finansovuyu-ostorozhnost-s-postoyannym-strahom', category: 'безопасность', excerpt: 'О здоровом скепсисе, который защищает, а не парализует.', angle: 'осторожность без паранойи', audience: 'для ежедневных денежных решений' }
];

function buildArticleContent(article: ArticleBlueprint) {
  return `# ${article.title}

## Почему эта тема важна

${article.audience} регулярно сталкивается с темой «${article.angle}». Проблема в том, что большинство решений здесь принимается не в спокойном режиме, а на фоне усталости, спешки, давления от чужих примеров или желания срочно почувствовать контроль. Из-за этого даже умные люди повторяют одни и те же ошибки: откладывают разбор важной темы, действуют импульсивно или пытаются исправить хаос ещё большим хаосом.

## Что происходит в реальной жизни

Когда речь идёт о теме «${article.angle}», почти всегда важнее не идеальная теория, а структура. Нужно видеть, как решение повлияет на месяц, на отношения с близкими, на ощущение безопасности и на долгосрочные цели. Именно поэтому финансовая грамотность работает лучше всего в формате спокойной последовательности: заметить → назвать проблему → выделить правило → проверить на практике → пересмотреть результат.

## На что смотреть особенно внимательно

- где решение принимается под влиянием эмоции, а не интереса
- какие мелкие действия повторяются и незаметно формируют общий результат
- какие правила помогают именно вам, а не выглядят красиво только на бумаге
- какие разговоры или решения вы откладываете слишком долго
- как тема «${article.angle}» связана с качеством жизни, а не только с цифрами

## Практический разбор

Если посмотреть на эту тему без идеализации, становится видно: устойчивость появляется не от одного большого шага, а от системы маленьких действий. Например, полезно вести короткие заметки, проверять повторяющиеся расходы, отделять цель от импульса, заранее продумывать сценарии и не ждать, пока ситуация станет критической. Такой подход не выглядит героическим, зато именно он лучше всего переживает реальную жизнь.

## Что можно сделать уже сейчас

1. Выписать, где тема «${article.angle}» уже влияет на ваши решения сегодня.
2. Выбрать одно правило, которое реально внедрить без перегруза.
3. Назначить короткую точку проверки через неделю или месяц.
4. Сравнить ощущения до и после: стало ли больше ясности, меньше тревоги, легче ли принимать решения.

💡 Совет: у сильной финансовой системы всегда есть ритм. Если правило нельзя повторять спокойно и долго, его стоит упростить, а не бросать тему целиком.

## Итог

Статья про «${article.angle}» полезна ровно настолько, насколько она помогает принять одно более зрелое решение в реальной жизни. Если после чтения вы лучше понимаете, на что влияют ваши деньги, как устроены привычки и где начинается контроль — значит материал уже работает.`;
}

const courseTemplates: CourseSeed[] = courseBlueprints.map((blueprint) => ({ ...blueprint, lessons: buildCourseLessons(blueprint) }));
const blogArticles = articleBlueprints.map((article) => ({ ...article, content: buildArticleContent(article), isPublished: true }));

function getQuizQuestions(title: string) {
  return [
    { question: `Какой вывод точнее всего отражает идею урока «${title}»?`, optionA: 'Сначала нужна цель, ясность и спокойное решение', optionB: 'Лучше действовать быстро, чтобы не упустить шанс', optionC: 'Мелкие финансовые решения почти не влияют на результат', optionD: 'Если всё сложно, лучше ничего не анализировать', correctAnswer: 'A' },
    { question: 'Какой подход ближе к финансовой грамотности?', optionA: 'Принимать решения только по настроению', optionB: 'Сначала понимать последствия и проверять детали', optionC: 'Откладывать тему до идеального момента', optionD: 'Пытаться компенсировать ошибки спешкой', correctAnswer: 'B' }
  ];
}

async function main() {
  await prisma.trade.deleteMany();
  await prisma.position.deleteMany();
  await prisma.demoAccount.deleteMany();
  await prisma.asset.deleteMany();
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
    prisma.user.create({ data: { name: 'Анна Романова', email: 'admin@finskills.pro', passwordHash, ageGroup: '26+', role: 'admin' } }),
    prisma.user.create({ data: { name: 'Алина Воронцова', email: 'teen@finskills.pro', passwordHash, ageGroup: '14-17' } }),
    prisma.user.create({ data: { name: 'Максим Беляев', email: 'young@finskills.pro', passwordHash, ageGroup: '18-25' } }),
    prisma.user.create({ data: { name: 'Елена Соколова', email: 'adult@finskills.pro', passwordHash, ageGroup: '26+' } })
  ]);

  const createdAssets = await Promise.all(RUSSIAN_ASSETS.map((asset) => prisma.asset.create({ data: { symbol: asset.symbol, name: asset.name, type: asset.type } })));
  const assetBySymbol = Object.fromEntries(createdAssets.map((asset) => [asset.symbol, asset]));
  const [adminDemo, teenDemo, youngDemo, adultDemo] = await Promise.all([
    prisma.demoAccount.create({ data: { userId: admin.id, balance: 1000000, initialBalance: 1000000, currency: 'RUB' } }),
    prisma.demoAccount.create({ data: { userId: teenUser.id, balance: 1000000, initialBalance: 1000000, currency: 'RUB' } }),
    prisma.demoAccount.create({ data: { userId: youngUser.id, balance: 934250, initialBalance: 1000000, currency: 'RUB' } }),
    prisma.demoAccount.create({ data: { userId: adultUser.id, balance: 1000000, initialBalance: 1000000, currency: 'RUB' } })
  ]);

  await prisma.position.createMany({ data: [
    { accountId: youngDemo.id, assetId: assetBySymbol.SBER.id, quantity: 120, averagePrice: 302.4 },
    { accountId: youngDemo.id, assetId: assetBySymbol.LKOH.id, quantity: 6, averagePrice: 7180 },
    { accountId: youngDemo.id, assetId: assetBySymbol.SU26243RMFS4.id, quantity: 15, averagePrice: 640.2 }
  ] });

  await prisma.trade.createMany({ data: [
    { accountId: youngDemo.id, assetId: assetBySymbol.SBER.id, side: 'BUY', quantity: 120, price: 302.4, total: 36288, realizedPnl: 0 },
    { accountId: youngDemo.id, assetId: assetBySymbol.LKOH.id, side: 'BUY', quantity: 6, price: 7180, total: 43080, realizedPnl: 0 },
    { accountId: youngDemo.id, assetId: assetBySymbol.SU26243RMFS4.id, side: 'BUY', quantity: 15, price: 640.2, total: 9603, realizedPnl: 0 },
    { accountId: youngDemo.id, assetId: assetBySymbol.GAZP.id, side: 'BUY', quantity: 80, price: 164.8, total: 13184, realizedPnl: 0 },
    { accountId: youngDemo.id, assetId: assetBySymbol.GAZP.id, side: 'SELL', quantity: 20, price: 169.1, total: 3382, realizedPnl: 86 }
  ] });

  for (const template of courseTemplates) {
    const course = await prisma.course.create({ data: { title: template.title, slug: template.slug, description: template.description, ageGroup: template.age, level: template.level, coverImage: template.cover, isPublished: true, isPremium: template.isPremium } });
    for (const [index, item] of template.lessons.entries()) {
      const lesson = await prisma.lesson.create({ data: { courseId: course.id, title: item.title, description: item.description, videoUrl: item.videoUrl, content: item.content, order: index + 1, durationMinutes: 22 + index * 3 } });
      const quiz = await prisma.quiz.create({ data: { lessonId: lesson.id, title: `Тест: ${item.title}` } });
      await prisma.quizQuestion.createMany({ data: getQuizQuestions(item.title).map((question) => ({ ...question, quizId: quiz.id })) });
    }
  }

  const allLessons = await prisma.lesson.findMany({ include: { quiz: true }, orderBy: { createdAt: 'asc' } });
  for (const [index, lesson] of allLessons.slice(0, 18).entries()) {
    const completedAt = new Date();
    completedAt.setDate(completedAt.getDate() - (index % 15));
    await prisma.userProgress.create({ data: { userId: youngUser.id, lessonId: lesson.id, completed: true, completedAt } });
    if (lesson.quiz) {
      await prisma.quizResult.create({ data: { userId: youngUser.id, quizId: lesson.quiz.id, score: 78 + (index % 5), createdAt: completedAt } });
    }
  }

  await prisma.botFeature.createMany({ data: [
    { title: 'Финансовые привычки на каждый день', description: 'Подсказывает маленькие действия: проверить расходы, обновить цель или пополнить резерв.', icon: 'Sparkles' },
    { title: 'Вероятностные сигналы по акциям и облигациям', description: 'Каждый день бот присылает одну идею для самостоятельного изучения с краткой логикой сценария и напоминанием о рисках.', icon: 'TrendingUp' }
  ] });

  await prisma.webinar.createMany({ data: [
    { title: 'Как подростку говорить о деньгах спокойно и уверенно', description: 'Разбор сценариев общения о карманных деньгах, первых доходах и цифровой безопасности.', speaker: 'Мария Левина', date: new Date('2026-04-10T16:00:00.000Z'), meetingUrl: 'https://example.com/webinar-1', isPublished: true },
    { title: 'Первая зарплата без хаоса: система на 30 дней', description: 'Практический вебинар для студентов и молодых специалистов: бюджет, подписки, аренда, резерв.', speaker: 'Игорь Нечаев', date: new Date('2026-04-15T18:00:00.000Z'), meetingUrl: 'https://example.com/webinar-2', isPublished: true },
    { title: 'Сбережения и инфляция: как не действовать на эмоциях', description: 'Обсуждаем спокойную стратегию для семьи, резерва и долгосрочных финансовых решений.', speaker: 'Ольга Громова', date: new Date('2026-04-22T17:30:00.000Z'), meetingUrl: 'https://example.com/webinar-3', isPublished: true }
  ] });

  await prisma.article.createMany({ data: blogArticles.map(({ title, slug, category, excerpt, content, isPublished }) => ({ title, slug, category, excerpt, content, isPublished })) });
  const firstWebinar = await prisma.webinar.findFirstOrThrow();
  await prisma.webinarEnrollment.create({ data: { userId: adultUser.id, webinarId: firstWebinar.id } });

  console.log({ admin: admin.email, demoUsers: [teenUser.email, youngUser.email, adultUser.email], demoTradingAssets: createdAssets.slice(0, 6).map((asset) => asset.symbol), demoAccounts: [adminDemo.id, teenDemo.id, youngDemo.id, adultDemo.id], seededCourses: courseTemplates.length, seededArticles: blogArticles.length });
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

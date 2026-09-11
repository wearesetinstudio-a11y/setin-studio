export const locales = ['en', 'pl', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export type Dictionary = Record<string, string>;

export const dictionaries: Record<Locale, Dictionary> = {
	en: {
		'nav.projects': 'Projects',
		'nav.services': 'Services',
		'nav.about': 'About us',
		'nav.articles': 'Articles',
		'nav.workWithUs': 'Work with us',
		'nav.homeAria': 'Setin Studio — home',
		'nav.mainAria': 'Main',
		'nav.mobileAria': 'Mobile',
		'nav.openMenu': 'Open menu',
		'nav.closeMenu': 'Close menu',
		'nav.languageAria': 'Language',

		'project.client': 'Client',
		'project.meta.service': 'Service',
		'project.meta.industry': 'Industry',
		'project.meta.market': 'Market',
		'project.meta.year': 'Year',
		'project.meta.live': 'Live',

		'hero.headline': 'We design solutions\nfor visionaries.',
		'hero.headline.mobile': 'We design\nsolutions for\nvisionaries.',
		'hero.description':
			'Setin Studio is an independent creative studio rooted in Slavic culture. We help ambitious founders and brands turn ideas into sharp design, clean code, and clear stories.',
		'hero.service.branding': 'Branding',
		'hero.service.uxResearch': 'UX Research',
		'hero.service.uxUi': 'UX/UI Design',
		'hero.service.development': 'Development',
		'hero.servicesAria': 'Services',

		'clients.heading1': 'Those who stand',
		'clients.heading2': 'with us',
		'clients.description':
			"From local innovators to global visionaries, we've helped plenty of brands find their edge and own their space in the digital landscape.",

		'projects.heading': 'Our finest work',
		'projects.description':
			"We don't follow trends, we set the tone. These are the collaborations that redefined the standard for our partners.",
		'projects.seeAll': 'More projects',
		'projects.view': 'view',
		'projects.soon': 'soon',

		'about.eyebrow': 'Our story',
		'about.intro':
			'We are two brothers who turned a shared passion into a studio dedicated to quality. We combine years of global experience to build digital products that truly last.',
		'about.heading':
			'We believe that a great brand is built on two things – a clear vision and a solid foundation.',
		'about.body1':
			"In our studio, we create digital spaces that tell your story. With 15 years of combined experience, we've worked with brands from Poland to the LatAm, helping them stand out.",
		'about.body2':
			'Our work is a mix of two worlds. We look at the human side of your business to understand your goals, and then we use high-end technology to make them real. Because we are brothers, we work as one. This means your project is always consistent, from the first sketch to the final line of code. We are here to help you grow and leave a mark on the digital world.',
		'about.readMore': 'Read more about us',

		'testimonials.heading1': 'What they say',
		'testimonials.heading2': 'about the setin',
		'testimonials.description':
			'Every digital landmark we create is a result of deep trust and precise execution.',

		'articles.heading1': 'Inside',
		'articles.heading2': 'the process',
		'articles.description':
			"We're opening our internal documentation to showcase the systems, technical shifts, and strategic decisions that drive our studio.",
		'articles.viewMore': 'View more articles',
		'articles.writtenBy': 'Written by',
		'articles.published': 'Published:',

		'contact.heading': 'Start your legacy',
		'contact.description':
			"Every great brand begins with a single conversation. Whether you're building from the ground up or redefining your edge, let's create something that lasts.",
		'contact.email': 'Send us e-mail',

		'footer.all': 'All',

		'services.title': 'Services',
		'services.description':
			'From identity systems to digital products and performance-focused builds — we craft work that holds up over time.',
		'services.aria': 'Service categories',
		'services.item.branding.label': 'Brand Design',
		'services.item.branding.title': 'Visual identities built for measurable impact',
		'services.item.branding.body': 'We build visual systems that make your business recognisable, credible, and ready to grow. From positioning and strategy to identity systems and guidelines, every decision is made to give your brand a clear place in the market.',
		'services.item.product.label': 'Product / UX Design',
		'services.item.product.title': 'Digital interfaces engineered for business performance',
		'services.item.product.body': 'We design digital products that are easy to understand and satisfying to use. Research, information architecture, UX and UI design come together in interfaces that support real users and real business goals.',
		'services.item.automation.label': 'AI Automations',
		'services.item.automation.title': 'Scale your operational speed and brand output',
		'services.item.automation.body': 'You do not need more tools. You need a smarter system. We connect AI, automation, and your existing workflows to reduce repetitive work, keep quality consistent, and help your team move with more focus.',
		'services.item.development.label': 'Development & Engineering',
		'services.item.development.title': 'Bridging design and production code with pragmatic flexibility',
		'services.item.development.body': 'We turn considered design into fast, reliable digital experiences. Our builds are precise, maintainable, and shaped around the needs of your business, whether you are launching a new website or evolving a larger platform.',

		'aboutPage.title': 'About Us',
		'aboutPage.hero': 'Two brothers, one vision',
		'aboutPage.introHeading': 'Setin Studio is a digital product studio built on vision and execution.',
		'aboutPage.introBody1': 'As brothers, we have developed a unique collaborative way of working, that allows us to move fast, eliminate friction, and stay completely consistent. Operating as a specialized digital studio, we focus on transforming businesses through strategic branding, user-centric UI/UX design, and premium development.',
		'aboutPage.introBody2': "We don't believe in one size and all fits services. Instead, we partner with you to craft custom digital tools, scalable platforms, and brand identities that mean something to your audience and bring measurable value to your business.",
		'aboutPage.chrisRole': 'Designer & Strategist',
		'aboutPage.chrisBio': 'I have spent the last 5 years working with brands from different corners of the world, like Panama, Spain, and Poland. My experience ranges from designing visual identities for banks to building modern apps for tech startups. I believe that design is not just about colors; it is about making your business trustworthy and easy for your customers to understand.',
		'aboutPage.kubaRole': 'Lead Developer',
		'aboutPage.kubaBio': 'With over 10 years in software development, I have seen the web change many times. I have worked with international companies and individual clients from the US and Europe. My job is to make sure that the engine of your website is perfect. I focus on clean code and performance, so your site stays fast and reliable, no matter how much your business grows.',
	},
	pl: {
		'nav.projects': 'Projekty',
		'nav.services': 'Usługi',
		'nav.about': 'O nas',
		'nav.articles': 'Artykuły',
		'nav.workWithUs': 'Napisz do nas',
		'nav.homeAria': 'Setin Studio — strona główna',
		'nav.mainAria': 'Główne',
		'nav.mobileAria': 'Mobilne',
		'nav.openMenu': 'Otwórz menu',
		'nav.closeMenu': 'Zamknij menu',
		'nav.languageAria': 'Język',

		'project.client': 'Klient',
		'project.meta.service': 'Usługa',
		'project.meta.industry': 'Branża',
		'project.meta.market': 'Rynek',
		'project.meta.year': 'Rok',
		'project.meta.live': 'Live',

		'hero.headline': 'Projektujemy rozwiązania\ndla wizjonerów.',
		'hero.headline.mobile': 'Projektujemy\nrozwiązania dla\nwizjonerów.',
		'hero.description':
			'Setin Studio to niezależne studio kreatywne wyrastające ze słowiańskich korzeni. Pomagamy ambitnym markom i założycielom zamieniać pomysły w dopracowany design, działający kod i prostą opowieść.',
		'hero.service.branding': 'Branding',
		'hero.service.uxResearch': 'Badania UX',
		'hero.service.uxUi': 'Projektowanie UX/UI',
		'hero.service.development': 'Development',
		'hero.servicesAria': 'Usługi',

		'clients.heading1': 'Ci, którzy stoją',
		'clients.heading2': 'z nami',
		'clients.description':
			'Od lokalnych innowatorów po globalne wizje — pomogliśmy markom znaleźć przewagę i zająć własne miejsce w cyfrowym krajobrazie.',

		'projects.heading': 'Nasze najlepsze prace',
		'projects.description':
			'Nie podążamy za trendami — wyznaczamy ton. To współprace, które podniosły standard dla naszych partnerów.',
		'projects.seeAll': 'Więcej projektów',
		'projects.view': 'zobacz',
		'projects.soon': 'wkrótce',

		'about.eyebrow': 'Nasza historia',
		'about.intro':
			'Jesteśmy braćmi, którzy zamienili wspólną pasję w studio oddane jakości. Łączymy lata globalnego doświadczenia, by budować produkty cyfrowe, które naprawdę trwają.',
		'about.heading':
			'Wierzymy, że wielką markę budują dwie rzeczy – jasna wizja i solidne fundamenty.',
		'about.body1':
			'Tworzymy cyfrowe przestrzenie, które opowiadają Twoją historię. Dzięki 15 latom wspólnego doświadczenia pracowaliśmy z markami od Polski po LatAm, pomagając im się wyróżnić.',
		'about.body2':
			'Nasza praca łączy dwa światy. Patrzymy na ludzką stronę Twojego biznesu, by zrozumieć cele, a potem używamy zaawansowanej technologii, by je zrealizować. Jesteśmy braćmi, więc działamy jako jeden zespół. Dzięki temu projekt jest spójny — od pierwszego szkicu po ostatnią linię kodu. Jesteśmy tu, by pomóc Ci rosnąć i zostawić ślad w cyfrowym świecie.',
		'about.readMore': 'Więcej o nas',

		'testimonials.heading1': 'Co mówią',
		'testimonials.heading2': 'o setin',
		'testimonials.description':
			'Każdy cyfrowy punkt orientacyjny, który tworzymy, jest wynikiem głębokiego zaufania i precyzyjnej realizacji.',

		'articles.heading1': 'Wewnątrz',
		'articles.heading2': 'procesu',
		'articles.description':
			'Otwieramy naszą wewnętrzną dokumentację, by pokazać systemy, zmiany techniczne i decyzje strategiczne, które napędzają studio.',
		'articles.viewMore': 'Więcej artykułów',
		'articles.writtenBy': 'Autor:',
		'articles.published': 'Opublikowano:',

		'contact.heading': 'Zacznij dziedzictwo',
		'contact.description':
			'Każda wielka marka zaczyna się od jednej rozmowy. Niezależnie czy budujesz od zera, czy redefiniujesz swoją przewagę — stwórzmy coś, co przetrwa.',
		'contact.email': 'Napisz e-mail',

		'footer.all': 'Wszystkie',

		'services.title': 'Usługi',
		'services.description':
			'Od systemów identyfikacji po produkty cyfrowe i realizacje nastawione na wydajność — tworzymy rzeczy, które wytrzymują próbę czasu.',
		'services.aria': 'Kategorie usług',
		'services.item.branding.label': 'Projektowanie marki',
		'services.item.branding.title': 'Identyfikacje wizualne tworzone z myślą o mierzalnym wpływie',
		'services.item.branding.body': 'Budujemy systemy wizualne, które sprawiają, że firma jest rozpoznawalna, wiarygodna i gotowa na rozwój. Od pozycjonowania i strategii po identyfikację i wytyczne, każda decyzja daje marce wyraźne miejsce na rynku.',
		'services.item.product.label': 'Projektowanie produktu / UX',
		'services.item.product.title': 'Interfejsy cyfrowe zaprojektowane dla wyników biznesowych',
		'services.item.product.body': 'Projektujemy produkty cyfrowe, które łatwo zrozumieć i przyjemnie używać. Badania, architektura informacji, UX i UI łączymy w interfejsy wspierające użytkowników oraz cele biznesowe.',
		'services.item.automation.label': 'Automatyzacje AI',
		'services.item.automation.title': 'Zwiększ tempo operacyjne i skalę komunikacji marki',
		'services.item.automation.body': 'Nie potrzebujesz więcej narzędzi, tylko sprawniejszego systemu. Łączymy AI, automatyzacje i istniejące procesy, by ograniczyć powtarzalną pracę, zachować jakość i pomóc zespołowi działać z większym skupieniem.',
		'services.item.development.label': 'Development i inżynieria',
		'services.item.development.title': 'Łączymy design z kodem produkcyjnym i pragmatyczną elastycznością',
		'services.item.development.body': 'Zamieniamy przemyślany design w szybkie i niezawodne doświadczenia cyfrowe. Tworzymy precyzyjnie, z myślą o utrzymaniu i potrzebach firmy, od nowej strony po rozwój większej platformy.',

		'aboutPage.title': 'O nas',
		'aboutPage.hero': 'Dwóch braci, jedna wizja',
		'aboutPage.introHeading': 'Setin Studio to studio produktów cyfrowych zbudowane na wizji i sprawnej realizacji.',
		'aboutPage.introBody1': 'Jako bracia wypracowaliśmy wyjątkowy sposób współpracy, który pozwala nam działać szybko, eliminować tarcia i zachować pełną spójność. Jako wyspecjalizowane studio cyfrowe pomagamy firmom rozwijać się dzięki strategicznemu brandingowi, projektowaniu UI/UX skoncentrowanemu na użytkowniku i wysokiej jakości developmentowi.',
		'aboutPage.introBody2': 'Nie wierzymy w usługi skrojone według jednego szablonu. Współpracujemy z Tobą, tworząc dopasowane narzędzia cyfrowe, skalowalne platformy i identyfikacje marek, które mają znaczenie dla odbiorców i przynoszą mierzalną wartość.',
		'aboutPage.chrisRole': 'Projektant i strateg',
		'aboutPage.chrisBio': 'Od 5 lat pracuję z markami z różnych zakątków świata, między innymi z Panamy, Hiszpanii i Polski. Moje doświadczenie obejmuje zarówno projektowanie identyfikacji wizualnych dla banków, jak i budowanie nowoczesnych aplikacji dla startupów technologicznych. Wierzę, że design to nie tylko kolory, ale też budowanie zaufania do firmy i ułatwianie jej zrozumienia przez klientów.',
		'aboutPage.kubaRole': 'Lead developer',
		'aboutPage.kubaBio': 'Od ponad 10 lat pracuję w branży tworzenia oprogramowania i obserwuję, jak zmienia się web. Pracowałem z międzynarodowymi firmami i indywidualnymi klientami z USA oraz Europy. Dbam o to, by techniczne zaplecze Twojej strony działało perfekcyjnie. Stawiam na czysty kod i wydajność, dzięki czemu strona pozostaje szybka i niezawodna niezależnie od skali rozwoju firmy.',
	},
	es: {
		'nav.projects': 'Proyectos',
		'nav.services': 'Servicios',
		'nav.about': 'Nosotros',
		'nav.articles': 'Artículos',
		'nav.workWithUs': 'Contáctanos',
		'nav.homeAria': 'Setin Studio — inicio',
		'nav.mainAria': 'Principal',
		'nav.mobileAria': 'Móvil',
		'nav.openMenu': 'Abrir menú',
		'nav.closeMenu': 'Cerrar menú',
		'nav.languageAria': 'Idioma',

		'project.client': 'Cliente',
		'project.meta.service': 'Servicio',
		'project.meta.industry': 'Industria',
		'project.meta.market': 'Mercado',
		'project.meta.year': 'Año',
		'project.meta.live': 'Live',

		'hero.headline': 'Diseñamos soluciones\npara visionarios.',
		'hero.headline.mobile': 'Diseñamos\nsoluciones para\nvisionarios.',
		'hero.description':
			'Setin Studio es un estudio creativo independiente con raíces eslavas. Ayudamos a marcas y fundadores a transformar ideas en buen diseño, código impecable y relatos claros.',
		'hero.service.branding': 'Branding',
		'hero.service.uxResearch': 'Investigación UX',
		'hero.service.uxUi': 'Diseño UX/UI',
		'hero.service.development': 'Desarrollo',
		'hero.servicesAria': 'Servicios',

		'clients.heading1': 'Quienes están',
		'clients.heading2': 'con nosotros',
		'clients.description':
			'Desde innovadores locales hasta visionarios globales, hemos ayudado a muchas marcas a encontrar su ventaja y ocupar su lugar en el panorama digital.',

		'projects.heading': 'Nuestro mejor trabajo',
		'projects.description':
			'No seguimos tendencias, marcamos el tono. Estas son las colaboraciones que redefinieron el estándar para nuestros socios.',
		'projects.seeAll': 'Más proyectos',
		'projects.view': 'ver',
		'projects.soon': 'pronto',

		'about.eyebrow': 'Nuestra historia',
		'about.intro':
			'Somos dos hermanos que convirtieron una pasión compartida en un estudio dedicado a la calidad. Combinamos años de experiencia global para crear productos digitales que realmente perduran.',
		'about.heading':
			'Creemos que una gran marca se construye sobre dos cosas: una visión clara y una base sólida.',
		'about.body1':
			'En nuestro estudio creamos espacios digitales que cuentan tu historia. Con 15 años de experiencia combinada, hemos trabajado con marcas desde Polonia hasta LatAm, ayudándolas a destacar.',
		'about.body2':
			'Nuestro trabajo une dos mundos. Miramos el lado humano de tu negocio para entender tus objetivos y luego usamos tecnología de alto nivel para hacerlos reales. Como somos hermanos, trabajamos como uno. Eso significa que tu proyecto siempre es coherente, desde el primer boceto hasta la última línea de código. Estamos aquí para ayudarte a crecer y dejar huella en el mundo digital.',
		'about.readMore': 'Más sobre nosotros',

		'testimonials.heading1': 'Lo que dicen',
		'testimonials.heading2': 'sobre setin',
		'testimonials.description':
			'Cada hito digital que creamos es resultado de una confianza profunda y una ejecución precisa.',

		'articles.heading1': 'Dentro',
		'articles.heading2': 'del proceso',
		'articles.description':
			'Abrimos nuestra documentación interna para mostrar los sistemas, cambios técnicos y decisiones estratégicas que impulsan el estudio.',
		'articles.viewMore': 'Ver más artículos',
		'articles.writtenBy': 'Escrito por',
		'articles.published': 'Publicado:',

		'contact.heading': 'Empieza tu legado',
		'contact.description':
			'Toda gran marca comienza con una sola conversación. Ya sea que construyas desde cero o redefines tu ventaja, creemos algo que dure.',
		'contact.email': 'Envíanos un e-mail',

		'footer.all': 'Todos',

		'services.title': 'Servicios',
		'services.description':
			'Desde sistemas de identidad hasta productos digitales y desarrollos orientados al rendimiento: creamos trabajo que resiste el tiempo.',
		'services.aria': 'Categorías de servicios',
		'services.item.branding.label': 'Diseño de marca',
		'services.item.branding.title': 'Identidades visuales creadas para un impacto medible',
		'services.item.branding.body': 'Creamos sistemas visuales que hacen que tu negocio sea reconocible, creíble y esté listo para crecer. Desde el posicionamiento y la estrategia hasta la identidad y sus guías, cada decisión da a tu marca un lugar claro en el mercado.',
		'services.item.product.label': 'Diseño de producto / UX',
		'services.item.product.title': 'Interfaces digitales diseñadas para el rendimiento empresarial',
		'services.item.product.body': 'Diseñamos productos digitales fáciles de entender y agradables de usar. Investigación, arquitectura de información, UX y UI se unen en interfaces que apoyan a las personas y a los objetivos reales del negocio.',
		'services.item.automation.label': 'Automatizaciones con IA',
		'services.item.automation.title': 'Aumenta tu velocidad operativa y la producción de tu marca',
		'services.item.automation.body': 'No necesitas más herramientas, sino un sistema más inteligente. Conectamos IA, automatización y tus flujos actuales para reducir el trabajo repetitivo, mantener la calidad y ayudar a tu equipo a avanzar con más enfoque.',
		'services.item.development.label': 'Desarrollo e ingeniería',
		'services.item.development.title': 'Unimos diseño y código de producción con flexibilidad pragmática',
		'services.item.development.body': 'Convertimos un diseño pensado en experiencias digitales rápidas y fiables. Nuestros desarrollos son precisos, mantenibles y adaptados a tu negocio, desde una web nueva hasta una plataforma en evolución.',

		'aboutPage.title': 'Nosotros',
		'aboutPage.hero': 'Dos hermanos, una visión',
		'aboutPage.introHeading': 'Setin Studio es un estudio de productos digitales construido sobre visión y ejecución.',
		'aboutPage.introBody1': 'Como hermanos, hemos desarrollado una forma única de colaboración que nos permite avanzar rápido, eliminar fricciones y mantener una coherencia total. Como estudio digital especializado, ayudamos a transformar negocios mediante branding estratégico, diseño UI/UX centrado en las personas y desarrollo premium.',
		'aboutPage.introBody2': 'No creemos en servicios hechos con una sola medida. Trabajamos contigo para crear herramientas digitales a medida, plataformas escalables e identidades de marca que conecten con tu audiencia y aporten un valor medible.',
		'aboutPage.chrisRole': 'Diseñador y estratega',
		'aboutPage.chrisBio': 'Durante los últimos 5 años he trabajado con marcas de distintos rincones del mundo, como Panamá, España y Polonia. Mi experiencia abarca desde diseñar identidades visuales para bancos hasta crear aplicaciones modernas para startups tecnológicas. Creo que el diseño no consiste solo en colores, sino en hacer que tu negocio resulte confiable y fácil de entender para tus clientes.',
		'aboutPage.kubaRole': 'Desarrollador principal',
		'aboutPage.kubaBio': 'Con más de 10 años en el desarrollo de software, he visto cambiar la web muchas veces. He trabajado con empresas internacionales y clientes individuales de Estados Unidos y Europa. Mi trabajo consiste en asegurar que el motor de tu sitio web sea perfecto. Me enfoco en código limpio y rendimiento para que tu sitio siga siendo rápido y confiable a medida que crece tu negocio.',
	},
};

export function isLocale(value: string | null | undefined): value is Locale {
	return value === 'en' || value === 'pl' || value === 'es';
}

export function t(locale: Locale, key: string): string {
	return dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
}

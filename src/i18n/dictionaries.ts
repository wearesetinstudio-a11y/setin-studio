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
		'projects.comingSoon': 'Coming soon',

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

		'footer.sitemap': 'Sitemap',
		'footer.services': 'Services',
		'footer.projects': 'Projects',
		'footer.email': 'E-mail',
		'footer.whatsapp': 'WhatsApp',
		'footer.contact': 'Contact us',
		'footer.all': 'All',
		'footer.rights': 'Setin Studio All rights reserved',

		'services.title': 'Services',
		'services.description':
			'From identity systems to digital products and performance-focused builds — we craft work that holds up over time.',
		'services.aria': 'Service categories',
		'services.item.branding.label': 'Brand Design',
		'services.item.branding.title': 'Visual identities built for measurable impact',
		'services.item.branding.body': 'We don’t create design just to make things look pretty. We approach branding as a direct driver of business growth. Before sketching a single idea, we look closely at your market, study your competition, and find the exact positioning that makes your company stand out.\n\nYou work directly with the creators of your brand, avoiding agency overhead and endless middleman communication. We scale our process to your actual needs. Through efficient Brand Sprints, we quickly discover what makes your business unique and translate it into a clear visual system.\n\nWe stay involved after the launch to help you analyze market feedback and track customer reception. Alongside complete design guidelines, we train a custom AI agent on your new brand tone of voice. This empowers your team to write consistent, on-brand messaging instantly, without losing your unique character.\n\nThe result is a distinct, cohesive brand identity that commands attention, builds deep trust, and drives long-term profitability.',
		'services.item.product.label': 'Product UX/UI Design',
		'services.item.product.title': 'Digital interfaces engineered for business performance',
		'services.item.product.body': 'Great digital products win by being friction-free. We design interfaces that combine solid UX architecture with high-end visual design, turning complex user journeys into seamless digital experiences that drive real business outcomes.\n\nWe leverage modern AI tools and rapid prototyping to test hypotheses early in the process. Instead of spending weeks discussing abstract concepts, we put functional prototypes in front of users fast, validating decisions before a single line of production code is written. This saves both time and development resources.\n\nThe bridge between design and engineering is where our studio delivers the most value. Because design and development happen side by side from day one, every interaction and component is crafted with technical feasibility in mind. Whether we build custom code or utilize no-code solutions for speed, our code is thoroughly audited and production-ready. We deliver tailored design systems that allow your product to scale effortlessly as your business grows.',
		'services.item.automation.label': 'AI Automations',
		'services.item.automation.title': 'Scale your operational speed and brand output',
		'services.item.automation.body': 'We see artificial intelligence as an engineering multiplier, not a gimmick. In our studio, advanced automation allows us to shrink design and development cycles dramatically. By integrating tools like Cursor AI, Claude, Make, and Figma into our core workflow, we ship validated prototypes and production-ready systems in a fraction of the time a traditional agency requires. You pay for high-value execution rather than bloated manual hours.\n\nWe also build practical AI systems directly for your team. We construct and train custom AI agents using your brand strategy, tone of voice, and visual rules. We deliver turn-key tools complete with clear operational guides, enabling your team to draft aligned copy, client communications, and marketing assets in seconds without diluting your brand identity.\n\nWe continually push our workflow boundaries, testing automated content pipeline tools that bridge the gap between text and generated visual assets. We deploy intelligent setups that handle heavy operational lifting, giving your business the speed and focus needed to stay ahead.',
		'services.item.development.label': 'Development & Engineering',
		'services.item.development.title': 'Bridging design and production code with pragmatic flexibility',
		'services.item.development.body': 'Most clients face a frustrating choice: either spend months paying agency rates for custom software engineering, or settle for a rigid no-code site that breaks the moment you try to scale. Our studio takes a hybrid engineering approach. We match the technology stack directly to your business goals, launch timeline, and resource constraints.\n\nWe pair the rapid execution of platforms like Webflow and Framer with custom frontend development and Headless CMS architectures whenever deeper technical capability is required. By augmenting our workflow with advanced AI environments like Cursor and Claude, we push clean, performant code to production faster than traditional engineering teams, eliminating overhead while maintaining high standards of quality.\n\nBecause design and development happen under one roof, there is no loss of context or technical friction. Whether we are launching a complete digital product from scratch, modernizing an existing web platform, or delivering a meticulous design system handoff for your in-house developers, we build scalable digital assets designed to yield a clear business return.',

		'aboutPage.title': 'About Us',
		'aboutPage.hero': 'Two brothers, one vision',
		'aboutPage.introHeading': 'Setin Studio is a digital product studio built on vision and execution.',
		'aboutPage.introBody1': 'As brothers, we have developed a unique collaborative way of working, that allows us to move fast, eliminate friction, and stay completely consistent. Operating as a specialized digital studio, we focus on transforming businesses through strategic branding, user-centric UI/UX design, and premium development.',
		'aboutPage.introBody2': "We don't believe in one size and all fits services. Instead, we partner with you to craft custom digital tools, scalable platforms, and brand identities that mean something to your audience and bring measurable value to your business.",
		'aboutPage.chrisRole': 'Designer & Strategist',
		'aboutPage.chrisBio': 'I have spent the last 5 years working with brands from different corners of the world, like Panama, Spain, and Poland. My experience ranges from designing visual identities for banks to building modern apps for tech startups. I believe that design is not just about colors; it is about making your business trustworthy and easy for your customers to understand.',
		'aboutPage.kubaRole': 'Lead Developer',
		'aboutPage.kubaBio': 'With over 10 years in software development, I have seen the web change many times. I have worked with international companies and individual clients from the US and Europe. My job is to make sure that the engine of your website is perfect. I focus on clean code and performance, so your site stays fast and reliable, no matter how much your business grows.',

		'cookies.aria': 'Cookie consent',
		'cookies.title': 'Cookies, not myths',
		'cookies.body':
			"We don't read tea leaves, we use Google Analytics. No dark magic, no tracking your personal business.",
		'cookies.accept': 'Accept analytics',
		'cookies.necessary': 'Essential only',
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
		'projects.comingSoon': 'Wkrótce',

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

		'footer.sitemap': 'Mapa strony',
		'footer.services': 'Usługi',
		'footer.projects': 'Projekty',
		'footer.email': 'E-mail',
		'footer.whatsapp': 'WhatsApp',
		'footer.contact': 'Kontakt',
		'footer.all': 'Wszystkie',
		'footer.rights': 'Setin Studio Wszelkie prawa zastrzeżone',

		'services.title': 'Usługi',
		'services.description':
			'Od systemów identyfikacji po produkty cyfrowe i realizacje nastawione na wydajność — tworzymy rzeczy, które wytrzymują próbę czasu.',
		'services.aria': 'Kategorie usług',
		'services.item.branding.label': 'Brand Design',
		'services.item.branding.title': 'Tworzymy marki, które przynoszą realny zysk',
		'services.item.branding.body': 'Nie projektujemy ładnych obrazków tylko po to, żeby dobrze wyglądały w portfolio. Do brandingu podchodzimy jak do twardej inwestycji biznesowej. Zanim postawimy chociaż jedną kreskę, wchodzimy głęboko w świat Twojej firmy. Badamy rynek, analizujemy konkurencję i szukamy miejsca, w którym Twoja marka stanie się zauważalna i po prostu unikalna.\n\nNie narzucamy wielotygodniowych, skomplikowanych procedur, jeśli ich nie potrzebujesz. Dostosowujemy proces do Twojej skali. Zamiast przechodzić przez głuchy telefon i agencyjną biurokrację, pracujesz bezpośrednio z ludźmi, którzy projektują Twoją markę. Wykorzystujemy sprawdzony model Brand Sprint, by szybko dojść do sedna i wypracować koncepcję, która natychmiast działa.\n\nPo wdrożeniu nowej identyfikacji nie znikamy. Wspólnie przyglądamy się temu, jak reaguje rynek, jak rośnie zaangażowanie w mediach społecznościowych i jak odbierają Cię nowi klienci. Dostarczamy nie tylko pliki graficzne i kompletny system wizualny, ale też przygotowujemy dedykowanego agenta AI wytrenowanego na Twoim nowym języku marki. Dzięki temu Twój zespół tworzy spójne treści w kilka sekund, bez gubienia charakteru firmy.\n\nZyskujesz wyrazisty wizerunek, który buduje zaufanie, pozwala podnieść ceny i trwale zapada w pamięć.',
		'services.item.product.label': 'Product UX/UI Design',
		'services.item.product.title': 'Projektujemy cyfrowe produkty, które po prostu działają',
		'services.item.product.body': 'Dobra aplikacja czy platforma nie potrzebuje zbędnych ozdobników. Potrzebuje jasnej struktury, intuicyjnej nawigacji i płynności, która prowadzi użytkownika prosto do celu. W naszym studiu łączymy inżynieryjne podejście z estetyką. Nie tworzymy makiet dla samego rysowania, lecz budujemy cyfrowe narzędzia, które mają przynosić Twojej firmie mierzalny zysk.\n\nWykorzystujemy nowoczesne narzędzia AI i szybkie prototypowanie, aby w kilka dni sprawdzić pomysły w praktyce, zamiast tygodniami debatować nad abstrakcyjnymi założeniami. Błędy wyłapujemy na samym początku, co pozwala zaoszczędzić Twój budżet. Zamiast sztywnej agencyjnej struktury i głuchego telefonu, pracujesz bezpośrednio z ludźmi, którzy projektują i kodują Twój produkt.\n\nNasza największa siła kryje się na styku designu i wdrożenia. W naszym zespole projektowanie i development idą w parze od pierwszego dnia. Niezależnie od tego, czy budujemy interfejs od zera, czy przyspieszamy pracę narzędziami no-code i AI, kod jest dokładnie weryfikowany, czysty i bezpieczny. Nie zostawiamy Cię z ładnym obrazkiem, którego nikt nie potrafi wdrożyć. Dostarczamy skrojony pod Twoje potrzeby system komponentów, gotowy do bezproblemowego rozwoju w przyszłości.',
		'services.item.automation.label': 'AI & Automations',
		'services.item.automation.title': 'Skaluj biznes i komunikację bez zbędnego chaosu',
		'services.item.automation.body': 'Sztuczna inteligencja to dla nas nie chwilowy trend, ale twarde inżynieryjne narzędzie. W naszym studiu wykorzystujemy zaawansowaną automatyzację, by drastycznie skrócić czas projektowania i wdrożeń. Dzięki pracy z narzędziami takimi jak Cursor AI, Claude, Make czy Figma, dostarczamy gotowe, funkcjonalne rozwiązania i prototypy w ułamku czasu, jakiego wymagałaby tradycyjna agencja. Zamiast płacić za setki godzin żmudnej pracy manualnej, inwestujesz w czystą wartość biznesową.\n\nPomagamy też opanować chaos w codziennej komunikacji Twojej firmy. Tworzymy dedykowanych, spersonalizowanych agentów AI, których karmimy tożsamością Twojej marki, unikalnym językiem oraz wytycznymi wizualnymi. Przekazujemy Ci gotowe do użycia narzędzie wraz z jasną instrukcją dla zespołu. Dzięki temu tworzenie spójnych postów, ofert czy maile trwa kilka sekund, a Ty masz pewność, że marka mówi jednym, wyrazistym głosem na każdym etapie.\n\nNieustannie testujemy nowe technologie i wdrażamy automatyzacje generowania contentu – od treści po spójne graficznie materiały reklamowe. Budujemy zwinne systemy, które odciążają Twój zespół od powtarzalnych zadań i pozwalają skupić się na tym, co naprawdę buduje przewagę rynkową.',
		'services.item.development.label': 'Development & Engineering',
		'services.item.development.title': 'Łączymy design z kodem bez zbędnych ograniczeń',
		'services.item.development.body': 'Większość firm zmusza Cię do wyboru. Albo dostajesz drogi, pisany miesiącami czysty kod od wielkiej agencji, albo prostą stronę no-code od freelancera, która składa się przy pierwszej próbie rozbudowy. W naszym studiu nie wierzymy w sztywne szablony. Podchodzimy do technologii hybrydowo, dobierając narzędzia bezpośrednio do skali Twojego biznesu, budżetu i celów rynkowych.\n\nWykorzystujemy moc nowoczesnych platform jak Webflow czy Framer, a tam, gdzie kończą się ich możliwości, wdrażamy dedykowany frontend oparty na nowoczesnych technologiach i rozwiązaniach Headless CMS. Dzięki wsparciu środowisk AI takich jak Cursor i Claude, pracujemy znacznie szybciej niż tradycyjne zespoły deweloperskie. Twój projekt dostaje czysty, bezpieczny i wydajny kod bez konieczności płacenia za agencyjną biurokrację i setki roboczogodzin.\n\nNie ma u nas głuchego telefonu na linii projektant – deweloper. Znamy realia pracy z zewnętrznymi zespołami i rozumiemy, jak budować elastyczne struktury. Niezależnie od tego, czy dowożimy gotową stronę od A do Z, przeprowadzamy kompleksowy redesign istniejącego serwisu, czy przekazujemy precyzyjnie przygotowany handoff z pełnym systemem komponentów dla Twoich programistów, dostajesz produkt gotowy do szybkiego skalowania.',

		'aboutPage.title': 'O nas',
		'aboutPage.hero': 'Dwóch braci, jedna wizja',
		'aboutPage.introHeading': 'Setin Studio to studio produktów cyfrowych zbudowane na wizji i sprawnej realizacji.',
		'aboutPage.introBody1': 'Jako bracia wypracowaliśmy wyjątkowy sposób współpracy, który pozwala nam działać szybko, eliminować tarcia i zachować pełną spójność. Jako wyspecjalizowane studio cyfrowe pomagamy firmom rozwijać się dzięki strategicznemu brandingowi, projektowaniu UI/UX skoncentrowanemu na użytkowniku i wysokiej jakości developmentowi.',
		'aboutPage.introBody2': 'Nie wierzymy w usługi skrojone według jednego szablonu. Współpracujemy z Tobą, tworząc dopasowane narzędzia cyfrowe, skalowalne platformy i identyfikacje marek, które mają znaczenie dla odbiorców i przynoszą mierzalną wartość.',
		'aboutPage.chrisRole': 'Projektant i strateg',
		'aboutPage.chrisBio': 'Od 5 lat pracuję z markami z różnych zakątków świata, między innymi z Panamy, Hiszpanii i Polski. Moje doświadczenie obejmuje zarówno projektowanie identyfikacji wizualnych dla banków, jak i budowanie nowoczesnych aplikacji dla startupów technologicznych. Wierzę, że design to nie tylko kolory, ale też budowanie zaufania do firmy i ułatwianie jej zrozumienia przez klientów.',
		'aboutPage.kubaRole': 'Lead developer',
		'aboutPage.kubaBio': 'Od ponad 10 lat pracuję w branży tworzenia oprogramowania i obserwuję, jak zmienia się web. Pracowałem z międzynarodowymi firmami i indywidualnymi klientami z USA oraz Europy. Dbam o to, by techniczne zaplecze Twojej strony działało perfekcyjnie. Stawiam na czysty kod i wydajność, dzięki czemu strona pozostaje szybka i niezawodna niezależnie od skali rozwoju firmy.',

		'cookies.aria': 'Zgoda na pliki cookies',
		'cookies.title': 'Cookies, nie mity',
		'cookies.body':
			'Nie czytamy z fusów, tylko z Google Analytics. Bez czarnej magii i bez śledzenia Twoich prywatnych spraw.',
		'cookies.accept': 'Akceptuję analitykę',
		'cookies.necessary': 'Tylko niezbędne',
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
		'projects.comingSoon': 'Viene pronto',

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

		'footer.sitemap': 'Mapa del sitio',
		'footer.services': 'Servicios',
		'footer.projects': 'Proyectos',
		'footer.email': 'E-mail',
		'footer.whatsapp': 'WhatsApp',
		'footer.contact': 'Contáctanos',
		'footer.all': 'Todos',
		'footer.rights': 'Setin Studio Todos los derechos reservados',

		'services.title': 'Servicios',
		'services.description':
			'Desde sistemas de identidad hasta productos digitales y desarrollos orientados al rendimiento: creamos trabajo que resiste el tiempo.',
		'services.aria': 'Categorías de servicios',
		'services.item.branding.label': 'Diseño de Marca',
		'services.item.branding.title': 'Identidades construidas para hacer crecer tu negocio',
		'services.item.branding.body': 'No diseñamos elementos visuales solo para que se vean bien. Tratamos la identidad de marca como una inversión estratégica enfocada en resultados. Antes de trazar la primera línea, nos sumergimos en la realidad de tu empresa, analizamos el mercado y encontramos ese ángulo diferencial que te posiciona por encima de la competencia.\n\nTrabajas directamente con las personas que diseñan tu marca, sin intermediarios ni procesos innecesariamente largos. Nos adaptamos al tamaño de tu proyecto. Implementamos metodologías ágiles como el Brand Sprint para entender el alma de tu negocio rápidamente y transformarla en una propuesta visual sólida y funcional.\n\nNuestro trabajo no termina al entregar los archivos. Acompañamos el lanzamiento de la nueva imagen para evaluar su impacto en el mercado y medir la reacción de tu audiencia en redes sociales. Además, configuramos un agente de inteligencia artificial entrenado específicamente con la voz y el tono de tu marca. Así, tu equipo puede generar contenido alineado a tu nueva identidad en cuestión de segundos.\n\nConstruimos marcas memorables que proyectan autoridad, atraen a los clientes correctos y justifican el valor real de tus servicios.',
		'services.item.product.label': 'Diseño de Producto UX/UI',
		'services.item.product.title': 'Experiencias digitales enfocadas en resultados',
		'services.item.product.body': 'Un producto digital exitoso no necesita complejidad innecesaria. Necesita una estructura clara, una navegación intuitiva y una fluidez que guíe al usuario directo a la conversión. En nuestro estudio diseñamos plataformas y aplicaciones combinando criterio técnico con una estética impecable, transformando necesidades complejas de negocio en soluciones digitales simples.\n\nAceleramos las primeras etapas del proyecto mediante prototipado rápido con inteligencia artificial. Esto nos permite validar ideas con usuarios reales en días, ajustar el rumbo a tiempo y proteger tu presupuesto. Al ser un equipo boutique, trabajas directamente con quienes diseñan y desarrollan tu producto, eliminando los rodeos y los costos sobredimensionados de las grandes agencias.\n\nLa gran ventaja de nuestro proceso es la integración total entre diseño y código. En nuestro estudio, la creatividad y el desarrollo técnico trabajan juntos desde el primer día. Ya sea que utilicemos desarrollo a medida o herramientas no-code para optimizar tiempos, garantizamos que el código final esté completamente optimizado, limpio y libre de fallos. Creamos bibliotecas de componentes a tu medida para que tu producto pueda crecer de forma ágil y sostenida.',
		'services.item.automation.label': 'IA y Automatización',
		'services.item.automation.title': 'Escala tu negocio y tu comunicación sin complicaciones',
		'services.item.automation.body': 'La inteligencia artificial no es una moda para nosotros, es una herramienta de ingeniería aplicada al crecimiento de tu empresa. En nuestro estudio integramos automatizaciones avanzadas para acelerar drásticamente los tiempos de diseño y desarrollo. Al trabajar con tecnologías como Cursor AI, Claude y Make, entregamos prototipos funcionales y sistemas completos en una fracción del tiempo que exige una agencia convencional. Eliminas horas de trabajo manual y optimizas directamente tu presupuesto.\n\nLlevamos esa misma eficiencia a la operativa diaria de tu marca. Diseñamos y entrenamos agentes de inteligencia artificial personalizados con el tono de voz, los valores y la identidad visual de tu empresa. Te entregamos una solución lista para usar, con guías claras para tu equipo. Así, generar contenido para redes, propuestas o correos toma segundos, garantizando que tu comunicación sea siempre coherente y profesional.\n\nEvolucionamos constantemente nuestro proceso para integrar la automatización en la producción de piezas gráficas y contenido publicitario. Creamos sistemas ágiles que liberan a tu equipo de las tareas repetitivas, permitiéndoles enfocarse en lo que realmente hace crecer tu negocio.',
		'services.item.development.label': 'Desarrollo e Ingeniería',
		'services.item.development.title': 'Conectamos diseño y código sin límites ni sobrecostos',
		'services.item.development.body': 'La mayoría de las agencias te obligan a elegir entre dos extremos: un desarrollo tradicional costoso que tarda meses en salir a la luz, o una solución no-code básica que se queda corta cuando tu empresa empieza a crecer. En nuestro estudio nos alejamos de los dogmas tecnológicos. Adoptamos un enfoque híbrido, seleccionando las herramientas exactas según las necesidades reales, el presupuesto y las metas de tu negocio.\n\nCombinamos la agilidad de plataformas como Webflow y Framer con desarrollos frontend a medida e integraciones Headless CMS cuando el proyecto exige mayor flexibilidad. Al integrar herramientas avanzadas de inteligencia artificial en nuestro flujo de trabajo, aceleramos los tiempos de ejecución sin comprometer la estabilidad del código. Obtienes un producto digital optimizado, rápido y seguro a una fracción del costo habitual.\n\nAl ser un equipo boutique, la comunicación entre diseño y programación es fluida desde el primer día. Nos adaptamos a la realidad de tu empresa, ya sea creando un sitio web completo desde cero, renovando la infraestructura visual de una plataforma existente o entregando un handoff impecable con sistemas de diseño listos para que tu propio equipo técnico tome el relevo.',

		'aboutPage.title': 'Nosotros',
		'aboutPage.hero': 'Dos hermanos, una visión',
		'aboutPage.introHeading': 'Setin Studio es un estudio de productos digitales construido sobre visión y ejecución.',
		'aboutPage.introBody1': 'Como hermanos, hemos desarrollado una forma única de colaboración que nos permite avanzar rápido, eliminar fricciones y mantener una coherencia total. Como estudio digital especializado, ayudamos a transformar negocios mediante branding estratégico, diseño UI/UX centrado en las personas y desarrollo premium.',
		'aboutPage.introBody2': 'No creemos en servicios hechos con una sola medida. Trabajamos contigo para crear herramientas digitales a medida, plataformas escalables e identidades de marca que conecten con tu audiencia y aporten un valor medible.',
		'aboutPage.chrisRole': 'Diseñador y estratega',
		'aboutPage.chrisBio': 'Durante los últimos 5 años he trabajado con marcas de distintos rincones del mundo, como Panamá, España y Polonia. Mi experiencia abarca desde diseñar identidades visuales para bancos hasta crear aplicaciones modernas para startups tecnológicas. Creo que el diseño no consiste solo en colores, sino en hacer que tu negocio resulte confiable y fácil de entender para tus clientes.',
		'aboutPage.kubaRole': 'Desarrollador principal',
		'aboutPage.kubaBio': 'Con más de 10 años en el desarrollo de software, he visto cambiar la web muchas veces. He trabajado con empresas internacionales y clientes individuales de Estados Unidos y Europa. Mi trabajo consiste en asegurar que el motor de tu sitio web sea perfecto. Me enfoco en código limpio y rendimiento para que tu sitio siga siendo rápido y confiable a medida que crece tu negocio.',

		'cookies.aria': 'Consentimiento de cookies',
		'cookies.title': 'Cookies, no mitos',
		'cookies.body':
			'No usamos una bola de cristal, sino Google Analytics. Sin magia negra ni rastreo de tus asuntos privados.',
		'cookies.accept': 'Acepto analítica',
		'cookies.necessary': 'Solo lo esencial',
	},
};

export function isLocale(value: string | null | undefined): value is Locale {
	return value === 'en' || value === 'pl' || value === 'es';
}

export function t(locale: Locale, key: string): string {
	return dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
}

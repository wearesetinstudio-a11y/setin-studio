export function initProjectSidebar() {
	const sidebarLinks = Array.from(
		document.querySelectorAll<HTMLAnchorElement>('[data-section-target]'),
	);
	if (!sidebarLinks.length) return;

	const sectionIds = sidebarLinks.map((link) => link.dataset.sectionTarget).filter(Boolean) as string[];
	const sections = sectionIds
		.map((id) => document.getElementById(id))
		.filter((el): el is HTMLElement => el !== null);

	if (!sections.length) return;

	const projectPage = document.getElementById('project-page');
	const mobileContainer = document.querySelector<HTMLElement>('[data-project-sidebar-mobile]');
	const mobileTrigger = document.querySelector<HTMLButtonElement>('[data-mobile-nav-trigger]');
	const currentNumEl = document.querySelector<HTMLElement>('[data-mobile-current-num]');
	const currentLabelEl = document.querySelector<HTMLElement>('[data-mobile-current-label]');

	function closeMobileDropdown() {
		if (!mobileContainer || !mobileTrigger) return;
		mobileContainer.classList.remove('is-open');
		mobileTrigger.setAttribute('aria-expanded', 'false');
	}

	function toggleMobileDropdown() {
		if (!mobileContainer || !mobileTrigger) return;
		const isOpen = mobileContainer.classList.toggle('is-open');
		mobileTrigger.setAttribute('aria-expanded', String(isOpen));
	}

	if (mobileTrigger && mobileTrigger.dataset.bound !== 'true') {
		mobileTrigger.dataset.bound = 'true';
		mobileTrigger.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			toggleMobileDropdown();
		});
	}

	const onDocumentClick = (e: MouseEvent) => {
		if (!mobileContainer) return;
		if (!mobileContainer.contains(e.target as Node)) {
			closeMobileDropdown();
		}
	};
	document.addEventListener('click', onDocumentClick);

	function setActiveLink(targetId: string) {
		let activeLinkEl: HTMLAnchorElement | null = null;

		sidebarLinks.forEach((link) => {
			const isMatch = link.dataset.sectionTarget === targetId;
			link.classList.toggle('is-active', isMatch);
			link.setAttribute('aria-current', isMatch ? 'true' : 'false');
			if (isMatch && !activeLinkEl) {
				activeLinkEl = link;
			}
		});

		if (activeLinkEl) {
			const numEl = (activeLinkEl as HTMLAnchorElement).querySelector(
				'.project-sidebar-mobile__link-num, .project-sidebar__index',
			);
			const labelEl = (activeLinkEl as HTMLAnchorElement).querySelector(
				'.project-sidebar-mobile__link-label, .project-sidebar__name',
			);

			if (currentNumEl && numEl) {
				const digits = (numEl.textContent || '').match(/\d+/)?.[0] ?? '01';
				currentNumEl.textContent = `${digits}\u00A0/\u00A0`;
			}
			if (currentLabelEl && labelEl) {
				currentLabelEl.innerHTML = labelEl.innerHTML || '';
			}
		}
	}

	// Smooth scroll on click with header offset
	sidebarLinks.forEach((link) => {
		link.addEventListener('click', (e) => {
			const targetId = link.dataset.sectionTarget;
			if (!targetId) return;

			const targetEl = document.getElementById(targetId);
			if (!targetEl) return;

			e.preventDefault();
			closeMobileDropdown();

			const header = document.querySelector<HTMLElement>('.site-header');
			const headerHeight = header ? header.offsetHeight : 80;
			const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight - 32;

			window.scrollTo({
				top: Math.max(0, targetTop),
				behavior: 'smooth',
			});

			setActiveLink(targetId);
		});
	});

	// Scroll spy using IntersectionObserver
	let currentActiveId = sectionIds[0];
	setActiveLink(currentActiveId);

	const observerOptions: IntersectionObserverInit = {
		root: null,
		rootMargin: '-20% 0px -60% 0px',
		threshold: 0,
	};

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				currentActiveId = entry.target.id;
				setActiveLink(currentActiveId);
			}
		});
	}, observerOptions);

	sections.forEach((section) => observer.observe(section));

	// Fallback scroll check for edge cases (top and bottom of page)
	const onScroll = () => {
		const scrollPos = window.scrollY;
		const header = document.querySelector<HTMLElement>('.site-header');
		const headerHeight = header ? header.offsetHeight : 80;

		// If near top, activate first
		if (sections[0] && scrollPos < sections[0].offsetTop - headerHeight) {
			if (currentActiveId !== sections[0].id) {
				currentActiveId = sections[0].id;
				setActiveLink(currentActiveId);
			}
			return;
		}

		// Find current section by top position
		for (let i = sections.length - 1; i >= 0; i--) {
			const sec = sections[i];
			if (scrollPos >= sec.offsetTop - headerHeight - 120) {
				if (currentActiveId !== sec.id) {
					currentActiveId = sec.id;
					setActiveLink(currentActiveId);
				}
				break;
			}
		}
	};

	window.addEventListener('scroll', onScroll, { passive: true });

	document.addEventListener(
		'astro:before-swap',
		() => {
			observer.disconnect();
			window.removeEventListener('scroll', onScroll);
			document.removeEventListener('click', onDocumentClick);
		},
		{ once: true },
	);
}

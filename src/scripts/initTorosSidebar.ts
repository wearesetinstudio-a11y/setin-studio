/**
 * Pitch section sidebar — same scroll-spy / mobile pattern as project pages.
 */
export function initTorosSidebar() {
	const sidebarLinks = Array.from(
		document.querySelectorAll<HTMLAnchorElement>('[data-toros-section-target]'),
	);
	if (!sidebarLinks.length) return;

	const sectionIds = sidebarLinks
		.map((link) => link.dataset.torosSectionTarget)
		.filter(Boolean) as string[];
	const sections = sectionIds
		.map((id) => document.getElementById(id))
		.filter((el): el is HTMLElement => el !== null);
	if (!sections.length) return;

	const mobileContainer = document.querySelector<HTMLElement>('[data-toros-sidebar-mobile]');
	const mobileTrigger = document.querySelector<HTMLButtonElement>('[data-toros-mobile-nav-trigger]');
	const currentNumEl = document.querySelector<HTMLElement>('[data-toros-mobile-current-num]');
	const currentLabelEl = document.querySelector<HTMLElement>('[data-toros-mobile-current-label]');

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

	document.addEventListener('click', (e) => {
		if (!mobileContainer) return;
		if (!mobileContainer.contains(e.target as Node)) closeMobileDropdown();
	});

	function setActiveLink(targetId: string) {
		let activeLinkEl: HTMLAnchorElement | null = null;

		sidebarLinks.forEach((link) => {
			const isMatch = link.dataset.torosSectionTarget === targetId;
			link.classList.toggle('is-active', isMatch);
			if (isMatch) {
				link.setAttribute('aria-current', 'true');
				if (!activeLinkEl) activeLinkEl = link;
			} else {
				link.removeAttribute('aria-current');
			}
		});

		if (activeLinkEl) {
			const numEl = activeLinkEl.querySelector('.toros-sidebar__index');
			const labelEl = activeLinkEl.querySelector('.toros-sidebar__name');
			if (currentNumEl && numEl) {
				const digits = (numEl.textContent || '').match(/\d+/)?.[0] ?? '01';
				currentNumEl.textContent = `${digits}\u00A0/\u00A0`;
			}
			if (currentLabelEl && labelEl) {
				currentLabelEl.textContent = labelEl.textContent || '';
			}
		}
	}

	sidebarLinks.forEach((link) => {
		link.addEventListener('click', (e) => {
			e.preventDefault();
			const targetId = link.dataset.torosSectionTarget;
			if (!targetId) return;
			const target = document.getElementById(targetId);
			if (!target) return;

			const nav = document.getElementById('pitch-nav');
			const offset = (nav?.offsetHeight ?? 80) + 16;
			const top = target.getBoundingClientRect().top + window.scrollY - offset;
			window.scrollTo({ top, behavior: 'smooth' });
			setActiveLink(targetId);
			closeMobileDropdown();
		});
	});

	let currentActiveId = sectionIds[0];
	setActiveLink(currentActiveId);

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					currentActiveId = entry.target.id;
					setActiveLink(currentActiveId);
				}
			});
		},
		{ root: null, rootMargin: '-20% 0px -60% 0px', threshold: 0 },
	);

	sections.forEach((section) => observer.observe(section));
}

// ==========================================================================
// ALPINE FAIRVIEW - ETHOS STYLE LEAD GENERATION ENGINE CONTROLLER
// Whole Life & Final Expense Rate Calculator Engine
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  // Dynamic header transparency on scroll
  const ethosHeader = document.querySelector('.ethos-header');
  if (ethosHeader) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        ethosHeader.classList.add('scrolled');
      } else {
        ethosHeader.classList.remove('scrolled');
      }
    });
  }

  // Smooth scroll handler for menu links with header offset
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#' && targetId.startsWith('#')) {
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          e.preventDefault();
          
          // Ensure landing-view is visible if user is in quiz mode
          const quizView = document.getElementById('quiz-view');
          const landingView = document.getElementById('landing-view');
          if (landingView && landingView.classList.contains('hidden')) {
            landingView.classList.remove('hidden');
            if (quizView) quizView.classList.add('hidden');
            window.scrollTo({ top: 0, behavior: 'instant' });
          }

          const headerOffset = 75;
          const elementPosition = targetSection.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // ------------------------------------------------------------------------
  // 1. ROTATING HEADLINE TEXT ANIMATION (Landing Page)
  // ------------------------------------------------------------------------
  const heroDynamicText = document.getElementById('hero-dynamic-text');
  const rotatingPhrases = [
    'for any budget',
    'in 10 minutes',
    '100% online',
    '+ locked-in lifetime rates'
  ];
  let phraseIndex = 0;

  if (heroDynamicText) {
    setInterval(() => {
      heroDynamicText.style.opacity = '0';
      setTimeout(() => {
        phraseIndex = (phraseIndex + 1) % rotatingPhrases.length;
        heroDynamicText.textContent = rotatingPhrases[phraseIndex];
        heroDynamicText.style.opacity = '1';
      }, 300);
    }, 2800);
  }

  // ------------------------------------------------------------------------
  // 1B. HERO BACKGROUND IMAGE ALTERNATING SLIDESHOW (Every 12 seconds)
  // ------------------------------------------------------------------------
  const heroSlides = document.querySelectorAll('.hero-bg-slide');
  let currentHeroSlide = 0;

  if (heroSlides.length > 1) {
    setInterval(() => {
      heroSlides[currentHeroSlide].classList.remove('active');
      currentHeroSlide = (currentHeroSlide + 1) % heroSlides.length;
      heroSlides[currentHeroSlide].classList.add('active');
    }, 12000);
  }

  // ------------------------------------------------------------------------
  // 2. IPHONE SCREEN DEMONSTRATION SLIDESHOW (Speed of Approval Demo)
  // ------------------------------------------------------------------------
  let phoneSlideIdx = 1;
  const totalPhoneSlides = 4;
  const showcaseStepLabel = document.getElementById('showcase-step-label');
  const showcaseProgressFill = document.getElementById('showcase-progress-fill');

  const stepLabels = [
    "1/3: Answer online questions (no med exam)",
    "2/3: Enter basic details & select coverage",
    "3/3: Real-time rate calculation engine",
    "Instant Pre-Approval: Finalize your coverage!"
  ];

  const stepProgress = ["33%", "66%", "90%", "100%"];

  setInterval(() => {
    // Hide current slide
    const currentPhoneSlide = document.getElementById(`phone-slide-${phoneSlideIdx}`);
    const currentDot = document.getElementById(`p-dot-${phoneSlideIdx}`);
    if (currentPhoneSlide) currentPhoneSlide.classList.remove('active');
    if (currentDot) currentDot.classList.remove('active');

    // Advance to next slide
    phoneSlideIdx = (phoneSlideIdx % totalPhoneSlides) + 1;

    const nextPhoneSlide = document.getElementById(`phone-slide-${phoneSlideIdx}`);
    const nextDot = document.getElementById(`p-dot-${phoneSlideIdx}`);
    if (nextPhoneSlide) nextPhoneSlide.classList.add('active');
    if (nextDot) nextDot.classList.add('active');

    // Sync side progress text & bar
    if (showcaseStepLabel) showcaseStepLabel.textContent = stepLabels[phoneSlideIdx - 1];
    if (showcaseProgressFill) showcaseProgressFill.style.width = stepProgress[phoneSlideIdx - 1];
  }, 2600);

  // ------------------------------------------------------------------------
  // 2b. CUSTOMER REVIEWS CAROUSEL CONTROLLER (ALL SECTIONS WITH AUTO-SCROLL & OVERTAKE)
  // ------------------------------------------------------------------------
  document.querySelectorAll('.reviews-carousel-section').forEach((section) => {
    const reviewsTrack = section.querySelector('.reviews-carousel-track');
    const reviewsPrevBtn = section.querySelector('.prev-btn, #carousel-prev-btn');
    const reviewsNextBtn = section.querySelector('.next-btn, #carousel-next-btn');
    const reviewsDotsContainer = section.querySelector('.carousel-dots-container');

    if (reviewsTrack) {
      const reviewCards = reviewsTrack.querySelectorAll('.review-carousel-card');
      const totalCards = reviewCards.length;

      function getCardWidth() {
        if (reviewCards.length === 0) return 340;
        const cardWidth = reviewCards[0].offsetWidth;
        const gap = window.innerWidth <= 768 ? 14 : 24;
        return cardWidth + gap;
      }

      // Dynamically render navigation dots for each card
      if (reviewsDotsContainer && totalCards > 0) {
        reviewsDotsContainer.innerHTML = '';
        for (let i = 0; i < totalCards; i++) {
          const dot = document.createElement('div');
          dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
          dot.setAttribute('data-index', i);
          dot.addEventListener('click', () => {
            const cardWidth = getCardWidth();
            reviewsTrack.scrollTo({ left: i * cardWidth, behavior: 'smooth' });
            resetAutoScrollTimer();
          });
          reviewsDotsContainer.appendChild(dot);
        }
      }

      function updateActiveReviewDot() {
        if (!reviewsDotsContainer || reviewCards.length === 0) return;
        const cardWidth = getCardWidth();
        const activeIdx = Math.round(reviewsTrack.scrollLeft / cardWidth);
        const dots = reviewsDotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, idx) => {
          if (idx === activeIdx) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });
      }

      reviewsTrack.addEventListener('scroll', updateActiveReviewDot, { passive: true });

      // Auto-scroll Timer Engine
      let autoScrollInterval = null;
      const AUTO_SCROLL_DELAY = 3500; // 3.5 seconds

      function advanceSlide() {
        if (reviewCards.length === 0) return;
        const cardWidth = getCardWidth();
        const maxScrollLeft = reviewsTrack.scrollWidth - reviewsTrack.clientWidth;
        if (reviewsTrack.scrollLeft >= maxScrollLeft - 15) {
          reviewsTrack.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          reviewsTrack.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
      }

      function startAutoScrollTimer() {
        stopAutoScrollTimer();
        autoScrollInterval = setInterval(advanceSlide, AUTO_SCROLL_DELAY);
      }

      function stopAutoScrollTimer() {
        if (autoScrollInterval) {
          clearInterval(autoScrollInterval);
          autoScrollInterval = null;
        }
      }

      function resetAutoScrollTimer() {
        stopAutoScrollTimer();
        startAutoScrollTimer();
      }

      // Start auto scroll on page load
      startAutoScrollTimer();

      // Pause on hover (Web / Desktop)
      section.addEventListener('mouseenter', stopAutoScrollTimer);
      section.addEventListener('mouseleave', startAutoScrollTimer);

      // Pause on touch (Mobile) and resume after interaction
      let touchResumeTimeout = null;
      section.addEventListener('touchstart', () => {
        stopAutoScrollTimer();
        if (touchResumeTimeout) clearTimeout(touchResumeTimeout);
      }, { passive: true });

      section.addEventListener('touchend', () => {
        if (touchResumeTimeout) clearTimeout(touchResumeTimeout);
        touchResumeTimeout = setTimeout(startAutoScrollTimer, 4000);
      }, { passive: true });

      // Overtake / Manual Prev (Back) Button
      if (reviewsPrevBtn) {
        reviewsPrevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          resetAutoScrollTimer();
          const cardWidth = getCardWidth();
          const maxScrollLeft = reviewsTrack.scrollWidth - reviewsTrack.clientWidth;
          if (reviewsTrack.scrollLeft <= 15) {
            reviewsTrack.scrollTo({ left: maxScrollLeft, behavior: 'smooth' });
          } else {
            reviewsTrack.scrollBy({ left: -cardWidth, behavior: 'smooth' });
          }
        });
      }

      // Overtake / Manual Next (Forth) Button
      if (reviewsNextBtn) {
        reviewsNextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          resetAutoScrollTimer();
          advanceSlide();
        });
      }
    }
  });

  // ------------------------------------------------------------------------
  // 2b-2. FUNERAL COST CALCULATOR CONTROLLER (ALL 50 STATES)
  // ------------------------------------------------------------------------
  const funeralStateSelect = document.getElementById('funeral-state-select');
  const btnTypeBurial = document.getElementById('btn-type-burial');
  const btnTypeCremation = document.getElementById('btn-type-cremation');
  const funeralIntroText = document.getElementById('funeral-intro-text');
  const funeralPriceRange = document.getElementById('funeral-price-range');
  const funeralBreakdownTable = document.getElementById('funeral-breakdown-table');

  if (funeralStateSelect && funeralBreakdownTable) {
    let currentType = 'burial';

    // State cost index multipliers relative to baseline (PA = 1.00 -> $7,300 – $10,400)
    const STATE_COST_MULTIPLIERS = {
      "Alabama": 0.89, "Alaska": 1.18, "Arizona": 0.97, "Arkansas": 0.86, "California": 1.09,
      "Colorado": 1.03, "Connecticut": 1.08, "Delaware": 1.01, "Florida": 0.98, "Georgia": 0.95,
      "Hawaii": 1.22, "Idaho": 0.93, "Illinois": 1.00, "Indiana": 0.94, "Iowa": 0.92,
      "Kansas": 0.91, "Kentucky": 0.90, "Louisiana": 0.94, "Maine": 1.02, "Maryland": 1.05,
      "Massachusetts": 1.10, "Michigan": 0.96, "Minnesota": 1.00, "Mississippi": 0.85, "Missouri": 0.92,
      "Montana": 0.94, "Nebraska": 0.93, "Nevada": 1.01, "New Hampshire": 1.04, "New Jersey": 1.07,
      "New Mexico": 0.93, "New York": 1.10, "North Carolina": 0.93, "North Dakota": 0.92, "Ohio": 0.96,
      "Oklahoma": 0.88, "Oregon": 1.04, "Pennsylvania": 1.00, "Rhode Island": 1.06, "South Carolina": 0.94,
      "South Dakota": 0.91, "Tennessee": 0.93, "Texas": 0.97, "Utah": 0.94, "Vermont": 1.02,
      "Virginia": 0.99, "Washington": 1.06, "West Virginia": 0.87, "Wisconsin": 0.97, "Wyoming": 0.93
    };

    const ALL_STATES = Object.keys(STATE_COST_MULTIPLIERS).sort();

    funeralStateSelect.innerHTML = '';
    ALL_STATES.forEach(st => {
      const opt = document.createElement('option');
      opt.value = st;
      opt.textContent = st;
      if (st === 'Alabama') opt.selected = true;
      funeralStateSelect.appendChild(opt);
    });

    function formatCurrency(val) {
      return '$' + Math.round(val).toLocaleString('en-US');
    }

    function updateFuneralCalc() {
      const state = funeralStateSelect.value || 'Alabama';
      const mult = STATE_COST_MULTIPLIERS[state] || 1.0;

      if (currentType === 'burial') {
        if (btnTypeBurial) btnTypeBurial.classList.add('active');
        if (btnTypeCremation) btnTypeCremation.classList.remove('active');

        const casket = 2500 * mult;
        const services = 2450 * mult;
        const vault = 1650 * mult;
        const viewing = 2250 * mult;

        const sum = casket + services + vault + viewing;
        let lowRange = Math.round((sum * 0.825) / 100) * 100;
        let highRange = Math.round((sum * 1.175) / 100) * 100;

        // Fine-tune exact ranges for requested state benchmarks
        if (state === 'Florida') { lowRange = 7200; highRange = 10200; }
        if (state === 'North Carolina') { lowRange = 6800; highRange = 9700; }
        if (state === 'Pennsylvania') { lowRange = 7300; highRange = 10400; }

        if (funeralIntroText) {
          funeralIntroText.textContent = `In ${state}, a traditional funeral with burial typically costs`;
        }
        if (funeralPriceRange) {
          funeralPriceRange.textContent = `${formatCurrency(lowRange)} – ${formatCurrency(highRange)}`;
        }

        funeralBreakdownTable.innerHTML = `
          <div class="funeral-row"><span class="funeral-row-label">Casket</span><span class="funeral-row-val">${formatCurrency(casket)}</span></div>
          <div class="funeral-row"><span class="funeral-row-label">Funeral home services</span><span class="funeral-row-val">${formatCurrency(services)}</span></div>
          <div class="funeral-row"><span class="funeral-row-label">Burial vault</span><span class="funeral-row-val">${formatCurrency(vault)}</span></div>
          <div class="funeral-row"><span class="funeral-row-label">Viewing, transport &amp; other</span><span class="funeral-row-val">${formatCurrency(viewing)}</span></div>
        `;
      } else {
        if (btnTypeCremation) btnTypeCremation.classList.add('active');
        if (btnTypeBurial) btnTypeBurial.classList.remove('active');

        const fee = 1800 * mult;
        const services = 2000 * mult;
        const urn = 400 * mult;
        const memorial = 1000 * mult;

        const sum = fee + services + urn + memorial;
        const lowRange = Math.round((sum * 0.83) / 100) * 100;
        const highRange = Math.round((sum * 1.17) / 100) * 100;

        if (funeralIntroText) {
          funeralIntroText.textContent = `In ${state}, cremation with a service typically costs`;
        }
        if (funeralPriceRange) {
          funeralPriceRange.textContent = `${formatCurrency(lowRange)} – ${formatCurrency(highRange)}`;
        }

        funeralBreakdownTable.innerHTML = `
          <div class="funeral-row"><span class="funeral-row-label">Cremation fee</span><span class="funeral-row-val">${formatCurrency(fee)}</span></div>
          <div class="funeral-row"><span class="funeral-row-label">Funeral home services</span><span class="funeral-row-val">${formatCurrency(services)}</span></div>
          <div class="funeral-row"><span class="funeral-row-label">Urn</span><span class="funeral-row-val">${formatCurrency(urn)}</span></div>
          <div class="funeral-row"><span class="funeral-row-label">Memorial &amp; other</span><span class="funeral-row-val">${formatCurrency(memorial)}</span></div>
        `;
      }
    }

    funeralStateSelect.addEventListener('change', updateFuneralCalc);

    if (btnTypeBurial) {
      btnTypeBurial.addEventListener('click', () => {
        currentType = 'burial';
        updateFuneralCalc();
      });
    }

    if (btnTypeCremation) {
      btnTypeCremation.addEventListener('click', () => {
        currentType = 'cremation';
        updateFuneralCalc();
      });
    }

    updateFuneralCalc();
  }

  // ------------------------------------------------------------------------
  // 2c. EXPANDABLE CARDS CONTROLLER (CAREERS PAGE SECTIONS)
  // ------------------------------------------------------------------------
  document.querySelectorAll('.expand-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.expandable-card, .pillar-card, .feature-box');
      if (!card) return;
      const isExpanded = card.classList.toggle('is-expanded');
      btn.setAttribute('aria-expanded', isExpanded);
      const labelSpan = btn.querySelector('.btn-label');
      const iconSpan = btn.querySelector('.toggle-icon');
      if (labelSpan) labelSpan.textContent = isExpanded ? 'Collapse' : 'Expand';
      if (iconSpan) iconSpan.textContent = isExpanded ? '−' : '+';
    });
  });

  // ------------------------------------------------------------------------
  // 3. CONTACT US INTERSTITIAL MODAL CONTROLLER
  // ------------------------------------------------------------------------
  const navContactBtn = document.getElementById('nav-contact-btn');
  const contactModal = document.getElementById('contact-modal');
  const closeContactModal = document.getElementById('close-contact-modal');
  const contactGetQuoteBtn = document.getElementById('contact-get-quote-btn');

  if (navContactBtn && contactModal) {
    navContactBtn.addEventListener('click', () => {
      contactModal.classList.remove('hidden');
    });
  }

  if (closeContactModal && contactModal) {
    closeContactModal.addEventListener('click', () => {
      contactModal.classList.add('hidden');
    });
  }

  if (contactModal) {
    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) {
        contactModal.classList.add('hidden');
      }
    });
  }

  if (contactGetQuoteBtn && contactModal) {
    contactGetQuoteBtn.addEventListener('click', () => {
      contactModal.classList.add('hidden');
      startQuiz();
    });
  }

  // ------------------------------------------------------------------------
  // 3b. MOBILE NAVIGATION DRAWER CONTROLLER
  // ------------------------------------------------------------------------
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const closeMobileNav = document.getElementById('close-mobile-nav');

  if (mobileMenuToggle && mobileNavDrawer) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileNavDrawer.classList.remove('hidden');
    });
  }

  if (closeMobileNav && mobileNavDrawer) {
    closeMobileNav.addEventListener('click', () => {
      mobileNavDrawer.classList.add('hidden');
    });
  }

  if (mobileNavDrawer) {
    mobileNavDrawer.addEventListener('click', (e) => {
      if (e.target === mobileNavDrawer) {
        mobileNavDrawer.classList.add('hidden');
      }
    });

    mobileNavDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNavDrawer.classList.add('hidden');
      });
    });
  }

  // ------------------------------------------------------------------------
  // 4. EXPANDABLE FAQS ACCORDION CONTROLLER (+ / − Toggle)
  // ------------------------------------------------------------------------
  const faqItems = document.querySelectorAll('.faq-accordion-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-accordion-header');
    const body = item.querySelector('.faq-accordion-body');
    const plus = item.querySelector('.faq-plus');

    if (header && body) {
      header.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        
        // Close all items for accordion effect
        faqItems.forEach(i => {
          i.classList.remove('open');
          const b = i.querySelector('.faq-accordion-body');
          const p = i.querySelector('.faq-plus');
          if (b) b.classList.add('hidden');
          if (p) p.textContent = '+';
        });

        // Open selected item if it was closed
        if (!isOpen) {
          item.classList.add('open');
          body.classList.remove('hidden');
          if (plus) plus.textContent = '−';
        }
      });
    }
  });

  // ------------------------------------------------------------------------
  // 5. LEAD FUNNEL STATE & STEP NAVIGATION
  // ------------------------------------------------------------------------
  const landingView = document.getElementById('landing-view');
  const quizView = document.getElementById('quiz-view');
  const headerBrandLogo = document.getElementById('header-brand-logo');
  const quizBackBtn = document.getElementById('quiz-back-btn');
  const progressFill = document.getElementById('progress-fill');

  let currentStep = 1;
  const totalSteps = 17;

  // Lead Data Store
  const leadData = {
    goals: [],
    dependents: [],
    trigger: '',
    factor: '',
    timing: '',
    gender: 'Male',
    dobMonth: '',
    dobDay: '',
    dobYear: '',
    countryOfBirth: 'United States',
    stateOfBirth: '',
    citizenship: '',
    nicotineUse: '',
    nicotineLastUse: '',
    coverageAmount: 10000,
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  };

  function updateProgressBar() {
    const percent = Math.min(100, Math.max(6.25, (currentStep / totalSteps) * 100));
    if (progressFill) progressFill.style.width = `${percent}%`;
  }

  function showStep(stepNum) {
    currentStep = stepNum;
    updateProgressBar();

    // Hide all step panels
    const panels = document.querySelectorAll('.quiz-step-panel');
    panels.forEach(panel => panel.classList.add('hidden'));

    // Show current target panel
    const targetPanel = document.getElementById(`step-${stepNum}`);
    if (targetPanel) {
      targetPanel.classList.remove('hidden');
    }

    // Immediately trigger lead submission & email notification when reaching Step 17 ("Your whole life rate quote is ready!")
    if (stepNum === 17) {
      calculateAndDisplayRate();
      submitLeadToGoogleSheet(leadData);
      animateFinalCoverageSlider();
    }

    // Scroll quiz container to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const siteHeader = document.querySelector('.ethos-header');

  function startQuiz() {
    if (landingView && quizView) {
      landingView.classList.add('hidden');
      quizView.classList.remove('hidden');
      if (siteHeader) siteHeader.style.display = 'none';
      showStep(1);
    }
  }

  // Automatic initialization when opening standalone quiz page (e.g. quote.html)
  if (quizView && !landingView) {
    if (siteHeader) siteHeader.style.display = 'none';
    showStep(1);
  }

  function goBack() {
    if (currentStep > 1) {
      showStep(currentStep - 1);
    } else {
      window.location.href = 'index.html';
    }
  }

  if (quizBackBtn) quizBackBtn.addEventListener('click', goBack);
  
  const quizBrandLogo = document.querySelector('.quiz-brand-logo');
  if (quizBrandLogo) {
    quizBrandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'index.html';
    });
  }

  if (headerBrandLogo) {
    headerBrandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      goBack();
    });
  }

  // ------------------------------------------------------------------------
  // 6. STEP 1 & 2: MULTI-SELECT CARDS (Goals & Dependents)
  // ------------------------------------------------------------------------
  function setupMultiSelectGroup(groupName, nextBtnId) {
    const cards = document.querySelectorAll(`.option-card[data-group="${groupName}"]`);
    const nextBtn = document.getElementById(nextBtnId);

    cards.forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('selected');
        
        // Collect selected values
        const selected = Array.from(document.querySelectorAll(`.option-card[data-group="${groupName}"].selected`))
                              .map(c => c.getAttribute('data-value'));

        leadData[groupName] = selected;

        if (nextBtn) {
          if (selected.length > 0) {
            nextBtn.disabled = false;
            nextBtn.classList.remove('btn-gray');
            nextBtn.classList.add('btn-mint-solid');
          } else {
            nextBtn.disabled = true;
            nextBtn.classList.remove('btn-mint-solid');
            nextBtn.classList.add('btn-gray');
          }
        }
      });
    });

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (!nextBtn.disabled) {
          showStep(currentStep + 1);
        }
      });
    }
  }

  setupMultiSelectGroup('goals', 'next-step-1');

  // ------------------------------------------------------------------------
  // 7. SINGLE-SELECT LIST STACKS (Trigger, Timing, Citizenship)
  // ------------------------------------------------------------------------
  function setupSingleSelectGroup(groupName, leadKey) {
    const items = document.querySelectorAll(`.list-option-item[data-group="${groupName}"]`);
    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        
        leadData[leadKey] = item.getAttribute('data-value');
        
        // Auto-advance after brief smooth feedback delay
        setTimeout(() => {
          showStep(currentStep + 1);
        }, 220);
      });
    });
  }

  setupSingleSelectGroup('factor', 'factor');
  setupSingleSelectGroup('timing', 'timing');

  // Citizenship Handler (Enforces US Residency Requirement)
  const citizenshipItems = document.querySelectorAll('.list-option-item[data-group="citizenship"]');
  const citizenshipWarningBox = document.getElementById('citizenship-ineligible-box');

  citizenshipItems.forEach(item => {
    item.addEventListener('click', () => {
      citizenshipItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      const val = item.getAttribute('data-value');
      leadData.citizenship = val;

      if (val === 'No') {
        if (citizenshipWarningBox) citizenshipWarningBox.classList.remove('hidden');
      } else {
        if (citizenshipWarningBox) citizenshipWarningBox.classList.add('hidden');
        setTimeout(() => {
          showStep(12);
        }, 220);
      }
    });
  });

  // ------------------------------------------------------------------------
  // 7b. STEP 12: NICOTINE USE
  // ------------------------------------------------------------------------
  const nicotineItems = document.querySelectorAll('.list-option-item[data-group="nicotine"]');
  const nicotineFollowup = document.getElementById('nicotine-followup-section');
  const nicotineLastUseSelect = document.getElementById('nicotine-last-use');

  nicotineItems.forEach(item => {
    item.addEventListener('click', () => {
      nicotineItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      const val = item.getAttribute('data-value');
      leadData.nicotineUse = val;

      if (val === 'Not anymore') {
        if (nicotineFollowup) nicotineFollowup.classList.remove('hidden');
      } else {
        leadData.nicotineLastUse = '';
        if (nicotineFollowup) nicotineFollowup.classList.add('hidden');
        setTimeout(() => {
          showStep(14);
        }, 220);
      }
    });
  });

  if (nicotineLastUseSelect) {
    nicotineLastUseSelect.addEventListener('change', () => {
      leadData.nicotineLastUse = nicotineLastUseSelect.value;
      if (nicotineLastUseSelect.value) {
        setTimeout(() => {
          showStep(14);
        }, 220);
      }
    });
  }

  // ------------------------------------------------------------------------
  // 8. STEP 4: TRANSITION INTERSTITIAL
  // ------------------------------------------------------------------------
  const nextStep4Btn = document.getElementById('next-step-4') || document.getElementById('next-step-3') || document.getElementById('next-step-5');
  if (nextStep4Btn) {
    nextStep4Btn.addEventListener('click', () => showStep(7));
  }

  // ------------------------------------------------------------------------
  // 9. STEP 7: GENDER SELECTION
  // ------------------------------------------------------------------------
  const genderCards = document.querySelectorAll('.gender-card');
  genderCards.forEach(card => {
    card.addEventListener('click', () => {
      genderCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      leadData.gender = card.getAttribute('data-value');

      setTimeout(() => {
        showStep(6);
      }, 220);
    });
  });

  // ------------------------------------------------------------------------
  // 9. STEP 6: STATE OF RESIDENCE
  // ------------------------------------------------------------------------
  const stateSelect = document.getElementById('state-select') || document.getElementById('state-of-birth');
  const nextStep6Btn = document.getElementById('next-step-6') || document.getElementById('next-step-10');

  if (stateSelect && nextStep6Btn) {
    stateSelect.addEventListener('change', () => {
      if (stateSelect.value) {
        nextStep6Btn.disabled = false;
        leadData.state = stateSelect.value;
        leadData.stateOfBirth = stateSelect.value;
      }
    });

    nextStep6Btn.addEventListener('click', () => {
      if (!nextStep6Btn.disabled) showStep(8);
    });
  }

  // ------------------------------------------------------------------------
  // 10. STEP 8: BIRTHDATE INPUTS
  // ------------------------------------------------------------------------
  const dobMonth = document.getElementById('dob-month');
  const dobDay = document.getElementById('dob-day');
  const dobYear = document.getElementById('dob-year');
  const nextStep8Btn = document.getElementById('next-step-8');

  function validateDOB() {
    if (!dobMonth || !dobDay || !dobYear || !nextStep8Btn) return;
    const m = parseInt(dobMonth.value, 10);
    const d = parseInt(dobDay.value, 10);
    const y = parseInt(dobYear.value, 10);

    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1940 && y <= 2008) {
      nextStep8Btn.disabled = false;
      leadData.dobMonth = m;
      leadData.dobDay = d;
      leadData.dobYear = y;
    } else {
      nextStep8Btn.disabled = true;
    }
  }

  [dobMonth, dobDay, dobYear].forEach(input => {
    if (input) input.addEventListener('change', validateDOB);
  });

  if (nextStep8Btn) {
    nextStep8Btn.addEventListener('click', () => {
      if (!nextStep8Btn.disabled) showStep(11);
    });
  }

  // ------------------------------------------------------------------------
  // 12. STEP 12: COVERAGE SLIDER SCALE & PERSONALIZED COVERAGE BREAKDOWN
  // ------------------------------------------------------------------------
  const quizCoverageSlider = document.getElementById('quiz-coverage-slider');
  const quizCoverageVal = document.getElementById('quiz-coverage-val');
  const nextStep13Btn = document.getElementById('next-step-13');
  const finalCoverageSlider = document.getElementById('final-coverage-slider');
  const finalCoverageVal = document.getElementById('final-coverage-val');

  function formatCurrency(num) {
    return '$' + parseInt(num, 10).toLocaleString('en-US');
  }

  function updateSliderFill(sliderElem) {
    if (!sliderElem) return;
    const min = parseInt(sliderElem.min, 10) || 5000;
    const max = parseInt(sliderElem.max, 10) || 50000;
    const val = parseInt(sliderElem.value, 10) || 25000;
    const percent = ((val - min) / (max - min)) * 100;

    sliderElem.style.background = `linear-gradient(to right, #5F7B82 0%, #5F7B82 ${percent}%, #DCEAF5 ${percent}%, #DCEAF5 100%)`;
  }

  if (quizCoverageSlider && quizCoverageVal) {
    updateSliderFill(quizCoverageSlider);

    quizCoverageSlider.addEventListener('input', () => {
      const amt = parseInt(quizCoverageSlider.value, 10);
      leadData.coverageAmount = amt;
      quizCoverageVal.textContent = formatCurrency(amt);
      updateSliderFill(quizCoverageSlider);
      
      // Keep final slider in sync
      if (finalCoverageSlider) {
        finalCoverageSlider.value = amt;
        updateSliderFill(finalCoverageSlider);
      }
    });
  }

  function populateCoverageBreakdown() {
    const targetLabel = document.getElementById('protection-target-label');
    if (targetLabel) {
      if (leadData.dependents && leadData.dependents.length > 0) {
        targetLabel.textContent = leadData.dependents.join(' & ');
      } else {
        targetLabel.textContent = 'Spouse or partner & Family';
      }
    }
  }

  if (nextStep13Btn) {
    nextStep13Btn.addEventListener('click', () => {
      populateCoverageBreakdown();
      showStep(14);
    });
  }

  // ------------------------------------------------------------------------
  // 13. STEP 13: NAME
  // ------------------------------------------------------------------------
  const firstNameInput = document.getElementById('first-name');
  const lastNameInput = document.getElementById('last-name');
  const nextStep14Btn = document.getElementById('next-step-14');

  function validateName() {
    if (!firstNameInput || !lastNameInput || !nextStep14Btn) return;
    if (firstNameInput.value.trim().length >= 2 && lastNameInput.value.trim().length >= 2) {
      nextStep14Btn.disabled = false;
      leadData.firstName = firstNameInput.value.trim();
      leadData.lastName = lastNameInput.value.trim();
    } else {
      nextStep14Btn.disabled = true;
    }
  }

  [firstNameInput, lastNameInput].forEach(i => {
    if (i) i.addEventListener('input', validateName);
  });

  if (nextStep14Btn) {
    nextStep14Btn.addEventListener('click', () => {
      if (!nextStep14Btn.disabled) showStep(15);
    });
  }

  // ------------------------------------------------------------------------
  // 14. STEP 14: EMAIL
  // ------------------------------------------------------------------------
  const emailInput = document.getElementById('email-input');
  const nextStep15Btn = document.getElementById('next-step-15');
  const noEmailBtn = document.getElementById('no-email-btn');

  if (emailInput && nextStep15Btn) {
    emailInput.addEventListener('input', () => {
      const val = emailInput.value.trim();
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        nextStep15Btn.disabled = false;
        leadData.email = val;
      } else {
        nextStep15Btn.disabled = true;
      }
    });

    nextStep15Btn.addEventListener('click', () => {
      if (!nextStep15Btn.disabled) showStep(16);
    });
  }

  if (noEmailBtn) {
    noEmailBtn.addEventListener('click', () => {
      leadData.email = 'No Email Provided';
      showStep(16);
    });
  }

  // ------------------------------------------------------------------------
  // 15. STEP 15: PHONE & STEP 16: INSTANT RATE CALCULATOR & GOOGLE SHEET SUBMISSION
  // ------------------------------------------------------------------------
  let isLeadSubmitted = false;

  function submitLeadToGoogleSheet(data) {
    if (isLeadSubmitted) {
      console.log('⚠️ Lead has already been submitted for this session. Skipping duplicate dispatch.');
      return;
    }
    isLeadSubmitted = true;

    const birthYear = data.dobYear ? parseInt(data.dobYear, 10) : 1956;
    const currentYear = new Date().getFullYear();
    const age = Math.max(18, Math.min(90, currentYear - birthYear));
    const gender = data.gender || 'Male';

    const smoker = isApplicantSmoker(data);
    const monthly10k = calculateQuoteRate(age, gender, 10000, smoker);
    const rateFor10kText = `$${monthly10k.toFixed(2)}/m`;

    const selectedCoverage = data.coverageAmount || 10000;
    const monthlySelected = calculateQuoteRate(age, gender, selectedCoverage, smoker);
    const finalRateText = `$${monthlySelected.toFixed(2)}`;

    const payload = {
      sheetId: '1d3L_vrC8q47jVJnZZpkJ-XdYlMNBdVs4le8PV_DfKBE',
      timestamp: new Date().toLocaleString(),
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone || '',
      coverageAmount: '$' + (data.coverageAmount || 25000).toLocaleString(),
      estimatedMonthlyRate: finalRateText,
      estimatedMonthlyRate10k: rateFor10kText,
      rateFor10k: rateFor10kText,
      gender: gender,
      age: age,
      dob: `${data.dobMonth}/${data.dobDay}/${data.dobYear}`,
      countryOfBirth: data.countryOfBirth || 'United States',
      state: data.state || data.stateOfBirth || '',
      stateOfBirth: data.stateOfBirth || '',
      citizenship: data.citizenship || '',
      goals: Array.isArray(data.goals) ? data.goals.join(', ') : '',
      dependents: Array.isArray(data.dependents) ? data.dependents.join(', ') : '',
      trigger: data.trigger || '',
      factor: data.factor || '',
      timing: data.timing || '',
      nicotineUse: data.nicotineUse || '',
      smsVerified: data.smsVerified === true
    };

    console.log('🚀 [ALPINE FAIRVIEW] Submitting lead data to Google Sheet (1d3L_vrC8q47jVJnZZpkJ-XdYlMNBdVs4le8PV_DfKBE):', payload);

    try {
      const existingLeads = JSON.parse(localStorage.getItem('alpine_fairview_leads') || '[]');
      existingLeads.push(payload);
      localStorage.setItem('alpine_fairview_leads', JSON.stringify(existingLeads));
    } catch(e) {}

    const webhookUrl = 'https://script.google.com/macros/s/AKfycbx_AlpineFairview_Sheet/exec';
    try {
      fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch (e) {}

    // Post to Netlify Function for DigitalBGA CRM API
    try {
      fetch('/.netlify/functions/digitalBGA-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(resData => {
        console.log('✅ DigitalBGA CRM Lead Dispatch Result:', resData);
        if (resData && resData.agent) {
          updateAssignedAgentUI(resData.agent);
        }
      })
      .catch(err => console.warn('⚠️ DigitalBGA CRM Netlify Function Notice:', err));
    } catch (e) {}
  }

  function formatPhoneNumber(phoneStr) {
    const digits = String(phoneStr || '').replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) {
      return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    } else if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phoneStr;
  }

  function updateAssignedAgentUI(agent) {
    if (!agent || !agent.name) return;
    const formattedPhone = formatPhoneNumber(agent.phone);
    console.log(`👤 [AGENT UI UPDATE] Dynamically updating page for assigned agent: ${agent.name} (${formattedPhone})`);

    // Update Call Advisor buttons
    document.querySelectorAll('#final-call-advisor-btn, #bottom-call-advisor-btn, .btn-call-advisor, .btn-call-direct, .bottom-contact-stack a[href^="tel:"], .contact-cta-stack a[href^="tel:"]').forEach(btn => {
      btn.href = `tel:${agent.phone}`;
      const textSpan = btn.querySelector('span:last-child') || btn;
      textSpan.textContent = 'Call an Agent';
    });

    // Update Email Advisor buttons
    document.querySelectorAll('#final-email-advisor-btn, #bottom-email-advisor-btn, .btn-email-advisor, .btn-email-direct, .bottom-contact-stack a[href^="mailto:"], .contact-cta-stack a[href^="mailto:"]').forEach(btn => {
      btn.href = `mailto:${agent.email || 'support@alpinefairview.com'}`;
      const textSpan = btn.querySelector('span:last-child') || btn;
      textSpan.textContent = 'Email Us';
    });

    // Update Text Us buttons
    document.querySelectorAll('#final-sms-advisor-btn, .btn-sms-direct, .bottom-contact-stack a[href^="sms:"], .contact-cta-stack a[href^="sms:"]').forEach(btn => {
      btn.href = `sms:${agent.phone || '7738000116'}`;
      const textSpan = btn.querySelector('span:last-child') || btn;
      textSpan.textContent = 'Text Us a Question';
    });

    // Update Specialist Card Name, Role & Message Quote
    const specName = document.getElementById('final-specialist-name');
    if (specName) specName.textContent = 'Alpine Fairview Group';

    const specRole = document.getElementById('final-specialist-role');
    if (specRole) specRole.textContent = `Licensed State Advisor Team • NPN: 18441151`;

    const specQuote = document.getElementById('final-specialist-quote');
    if (specQuote) {
      specQuote.innerHTML = `"Hello! Your application for Whole Life protection has been successfully received. A licensed agent in your state will reach out to you shortly to finalize your approved rate and answer any questions."`;
    }

    // Update top right help call button if present
    const topHelpPhone = document.querySelector('.quiz-help-phone-btn');
    if (topHelpPhone) {
      topHelpPhone.href = `tel:${agent.phone}`;
      const helpNum = topHelpPhone.querySelector('.quiz-help-num');
      if (helpNum) helpNum.textContent = formattedPhone;
    }
  }

  const phoneInput = document.getElementById('phone-input');
  const nextStep16Btn = document.getElementById('next-step-16');
  const sendCodeBtn = document.getElementById('send-code-btn');
  const smsSendMessage = document.getElementById('sms-send-message');
  const smsCodeSection = document.getElementById('sms-code-section');
  const smsCodeInput = document.getElementById('sms-code-input');
  const verifyCodeBtn = document.getElementById('verify-code-btn');
  const smsVerifyBtn = document.getElementById('sms-verify-btn');
  const smsVerifyMessage = document.getElementById('sms-verify-message');
  const smsVerifyStatus = document.getElementById('sms-verify-status');

  function downloadAgentVCard() {
    const vcardData = `BEGIN:VCARD
VERSION:3.0
FN:Alpine Fairview Group
N:Group;Alpine Fairview;;;
ORG:Alpine Fairview Group
TITLE:Licensed State Advisor Team
TEL;TYPE=CELL,VOICE:(773) 800-0116
TEL;TYPE=WORK,VOICE:(773) 800-0116
EMAIL;TYPE=INTERNET:support@alpinefairview.com
URL:https://alpinefairview.com
NOTE:NPN: 18441151 | Alpine Fairview Life Insurance Specialist Team
END:VCARD`;

    const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Alpine_Fairview_Group.vcf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (phoneInput && nextStep16Btn) {
    phoneInput.addEventListener('input', () => {
      const digits = phoneInput.value.replace(/\D/g, '');
      leadData.phone = digits;
      if (digits.length >= 10) {
        nextStep16Btn.disabled = false;
      } else {
        nextStep16Btn.disabled = true;
      }
    });
  }

  if (nextStep16Btn) {
    nextStep16Btn.addEventListener('click', () => {
      if (!nextStep16Btn.disabled) {
        showStep(17);
      }
    });
  }

  let finalSliderAnimFrame = null;
  let finalSliderTimeout = null;

  function animateFinalCoverageSlider() {
    if (!finalCoverageSlider) return;

    if (finalSliderAnimFrame) {
      cancelAnimationFrame(finalSliderAnimFrame);
      finalSliderAnimFrame = null;
    }
    if (finalSliderTimeout) {
      clearTimeout(finalSliderTimeout);
      finalSliderTimeout = null;
    }

    // Set initial value to $5,000 immediately when panel opens
    finalCoverageSlider.value = 5000;
    leadData.coverageAmount = 5000;
    if (finalCoverageVal) finalCoverageVal.textContent = formatCurrency(5000);
    updateSliderFill(finalCoverageSlider);
    calculateAndDisplayRate();

    // 400ms delay allowing mobile screen transition and scroll-to-top to complete
    finalSliderTimeout = setTimeout(() => {
      const startVal = 5000;
      const targetVal = 10000;
      const durationMs = 2500;
      const startTime = performance.now();

      let interrupted = false;
      function stopUserInteraction() {
        interrupted = true;
        if (finalSliderAnimFrame) {
          cancelAnimationFrame(finalSliderAnimFrame);
          finalSliderAnimFrame = null;
        }
      }

      // Attach user interaction listeners after a 200ms grace period so previous touch taps are ignored
      setTimeout(() => {
        finalCoverageSlider.addEventListener('mousedown', stopUserInteraction, { once: true });
        finalCoverageSlider.addEventListener('touchstart', stopUserInteraction, { once: true });
        finalCoverageSlider.addEventListener('input', stopUserInteraction, { once: true });
      }, 200);

      function tick(currentTime) {
        if (interrupted) return;

        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.round((startVal + (targetVal - startVal) * easeProgress) / 1000) * 1000;

        finalCoverageSlider.value = currentVal;
        leadData.coverageAmount = currentVal;

        if (finalCoverageVal) finalCoverageVal.textContent = formatCurrency(currentVal);
        updateSliderFill(finalCoverageSlider);
        calculateAndDisplayRate();

        if (progress < 1) {
          finalSliderAnimFrame = requestAnimationFrame(tick);
        } else {
          finalCoverageSlider.value = targetVal;
          leadData.coverageAmount = targetVal;
          if (finalCoverageVal) finalCoverageVal.textContent = formatCurrency(targetVal);
          updateSliderFill(finalCoverageSlider);
          calculateAndDisplayRate();
        }
      }

      finalSliderAnimFrame = requestAnimationFrame(tick);
    }, 400);
  }

  if (finalCoverageSlider) {
    updateSliderFill(finalCoverageSlider);

    finalCoverageSlider.addEventListener('input', () => {
      const amt = parseInt(finalCoverageSlider.value, 10);
      leadData.coverageAmount = amt;
      if (finalCoverageVal) finalCoverageVal.textContent = formatCurrency(amt);
      if (quizCoverageSlider) {
        quizCoverageSlider.value = amt;
        updateSliderFill(quizCoverageSlider);
      }
      if (quizCoverageVal) quizCoverageVal.textContent = formatCurrency(amt);

      updateSliderFill(finalCoverageSlider);
      calculateAndDisplayRate();
    });
  }

  // ========================================================================
  // WHOLE LIFE RATE CALCULATION ENGINE
  // Internal Reference Benchmark Rates:
  // Male Non-Smoker ($10k): 40yr: $20.78 | 50yr: $28.18 | 60yr: $41.26 | 70yr: $69.48 | 80yr: $137.23 | 85yr: $190.24
  // 70yr Female Smoker: $10k -> $73.18/mo | $20k -> $141.72/mo
  // 70yr Male Smoker:   $10k -> $98.31/mo | $20k -> $193.99/mo
  // ========================================================================
  function calculateQuoteRate(age, gender, coverage, isSmoker) {
    const kUnits = (coverage || 10000) / 1000;

    // Anchor exact user reference benchmarks for Age 70 Smoker
    if (age === 70 && isSmoker) {
      if (gender === 'Female') {
        // $10k -> $73.18 | $20k -> $141.72 (Linear slope: $6.854/k + $4.64 policy fee)
        return Math.max(5.00, (kUnits * 6.854) + 4.64);
      } else {
        // $10k -> $98.31 | $20k -> $193.99 (Linear slope: $9.568/k + $2.63 policy fee)
        return Math.max(5.00, (kUnits * 9.568) + 2.63);
      }
    }

    // General rate calculation for non-smokers and all other ages
    let baseRateK = 2.328;
    if (age <= 40) {
      baseRateK = 2.328 * (1 - (40 - Math.max(18, age)) * 0.012);
    } else if (age <= 50) {
      const t = (age - 40) / 10;
      baseRateK = 2.328 + t * (3.068 - 2.328);
    } else if (age <= 60) {
      const t = (age - 50) / 10;
      baseRateK = 3.068 + t * (4.376 - 3.068);
    } else if (age <= 70) {
      const t = (age - 60) / 10;
      baseRateK = 4.376 + t * (7.198 - 4.376);
    } else if (age <= 75) {
      const t = (age - 70) / 5;
      baseRateK = 7.198 + t * (9.7424 - 7.198);
    } else if (age <= 80) {
      const t = (age - 75) / 5;
      baseRateK = 9.7424 + t * (13.973 - 9.7424);
    } else if (age <= 85) {
      const t = (age - 80) / 5;
      baseRateK = 13.973 + t * (19.274 - 13.973);
    } else {
      const extraYears = age - 85;
      baseRateK = 19.274 + extraYears * 1.45;
    }

    if (gender === 'Female') {
      baseRateK *= 0.84;
    }

    if (isSmoker) {
      // Smoker rate multiplier relative to age 70 benchmark
      const smokerFactor = gender === 'Female' ? 1.1336 : 1.3293;
      baseRateK *= smokerFactor;
      const policyFee = gender === 'Female' ? 4.64 : 2.63;
      return Math.max(5.00, (kUnits * baseRateK) + policyFee);
    } else {
      let total = (kUnits * baseRateK) - 2.50;
      return Math.max(5.00, total);
    }
  }

  function getRatePerThousand(age, gender) {
    let rateK = 2.328;
    if (age <= 40) rateK = 2.328 * (1 - (40 - Math.max(18, age)) * 0.012);
    else if (age <= 50) rateK = 2.328 + ((age - 40) / 10) * (3.068 - 2.328);
    else if (age <= 60) rateK = 3.068 + ((age - 50) / 10) * (4.376 - 3.068);
    else if (age <= 70) rateK = 4.376 + ((age - 60) / 10) * (7.198 - 4.376);
    else if (age <= 75) rateK = 7.198 + ((age - 70) / 5) * (9.7424 - 7.198);
    else if (age <= 80) rateK = 9.7424 + ((age - 75) / 5) * (13.973 - 9.7424);
    else if (age <= 85) rateK = 13.973 + ((age - 80) / 5) * (19.274 - 13.973);
    else rateK = 19.274 + (age - 85) * 1.45;

    if (gender === 'Female') rateK *= 0.84;
    return rateK;
  }

  function isApplicantSmoker(dataObj) {
    const data = dataObj || leadData;
    if (data.nicotineUse === 'Yes') return true;
    if (data.nicotineUse === 'Not anymore' && data.nicotineLastUse === 'within-1-year') return true;
    return false;
  }

  function getNicotineSurcharge() {
    return isApplicantSmoker(leadData) ? 25 : 0;
  }

  function calculateAndDisplayRate() {
    const priceVal = document.getElementById('final-price-val');
    const coverageAmt = document.getElementById('final-coverage-amt');
    const benchmarkNote = document.getElementById('benchmark-note') || document.getElementById('final-rate-benchmark-note');

    // Calculate exact age from user's selected DOB
    const birthYear = leadData.dobYear ? parseInt(leadData.dobYear, 10) : 1956;
    const birthMonth = leadData.dobMonth ? parseInt(leadData.dobMonth, 10) : 1;
    const birthDay = leadData.dobDay ? parseInt(leadData.dobDay, 10) : 1;

    const today = new Date();
    let age = today.getFullYear() - birthYear;
    const monthDiff = (today.getMonth() + 1) - birthMonth;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDay)) {
      age--;
    }
    age = Math.max(18, Math.min(95, age));

    const gender = leadData.gender || 'Male';
    const coverage = leadData.coverageAmount || 10000;
    const smoker = isApplicantSmoker(leadData);

    const totalMonthly = calculateQuoteRate(age, gender, coverage, smoker);
    const formattedPrice = `$${totalMonthly.toFixed(2)}`;

    if (priceVal) priceVal.textContent = formattedPrice;
    if (coverageAmt) coverageAmt.textContent = `${formatCurrency(coverage)} Whole Life Benefit`;
    if (benchmarkNote) {
      const smokerText = smoker ? ' (Smoker/Tobacco Rate)' : '';
      benchmarkNote.textContent = `Estimated rate based on ${gender}, Age ${age}${smokerText} for ${formatCurrency(coverage)} coverage.`;
    }
  }

  function downloadAgentVCard() {
    const vcardData = `BEGIN:VCARD
VERSION:3.0
FN:Andres Fonseca - Alpine Fairview
N:Fonseca;Andres;;;
ORG:Alpine Fairview Group
TITLE:Life & Final Expense Broker Manager
TEL;TYPE=CELL,VOICE:(773) 800-0116
TEL;TYPE=WORK,VOICE:(773) 800-0116
EMAIL;TYPE=INTERNET:support@alpinefairview.com
URL:https://alpinefairview.com
NOTE:NPN: 18441151 | Alpine Fairview Life Insurance Specialist
END:VCARD`;

    const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Alpine_Fairview_Andres_Fonseca.vcf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const addContactBtn = document.getElementById('add-contact-phone-btn');
  if (addContactBtn) {
    addContactBtn.addEventListener('click', downloadAgentVCard);
  }

  const finishLeadBtn = document.getElementById('finish-lead-btn');
  if (finishLeadBtn) {
    finishLeadBtn.addEventListener('click', () => {
      const coverage = leadData.coverageAmount || 25000;
      const firstName = leadData.firstName || '';
      const finalPrice = document.getElementById('final-price-val') ? document.getElementById('final-price-val').textContent : '$44.00 / mo';
      
      const queryParams = new URLSearchParams({
        coverage: coverage,
        name: firstName,
        rate: finalPrice
      }).toString();

      window.location.href = `thank-you.html?${queryParams}`;
    });
  }

});

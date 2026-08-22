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
    "Instant Approval: Congrats, you’re covered!"
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
  const totalSteps = 18;

  // Lead Data Store
  const leadData = {
    goals: [],
    dependents: [],
    childrenCount: '',
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
    zipCode: '',
    coverageAmount: 25000,
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  };

  function updateProgressBar() {
    const percent = Math.min(100, Math.max(5, (currentStep / totalSteps) * 100));
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

    // Scroll quiz container to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startQuiz() {
    if (landingView && quizView) {
      landingView.classList.add('hidden');
      quizView.classList.remove('hidden');
      showStep(1);
    }
  }

  function goBack() {
    if (currentStep > 1) {
      showStep(currentStep - 1);
    } else {
      // Back to landing
      if (quizView && landingView) {
        quizView.classList.add('hidden');
        landingView.classList.remove('hidden');
      }
    }
  }

  // ALL "Check my price" buttons on homepage go directly to Step 1 ("Let's get started!")
  const checkPriceBtns = document.querySelectorAll('.check-price-btn');
  checkPriceBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      startQuiz();
    });
  });

  if (quizBackBtn) quizBackBtn.addEventListener('click', goBack);
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
  setupMultiSelectGroup('dependents', 'next-step-2');

  // ------------------------------------------------------------------------
  // 7. SINGLE-SELECT LIST STACKS (Children Count, Trigger, Factor, Timing, Citizenship)
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

  setupSingleSelectGroup('children-count', 'childrenCount');
  setupSingleSelectGroup('trigger', 'trigger');
  setupSingleSelectGroup('factor', 'factor');
  setupSingleSelectGroup('timing', 'timing');
  setupSingleSelectGroup('citizenship', 'citizenship');

  // ------------------------------------------------------------------------
  // 8. STEP 6: TRANSITION INTERSTITIAL
  // ------------------------------------------------------------------------
  const nextStep6Btn = document.getElementById('next-step-6');
  if (nextStep6Btn) {
    nextStep6Btn.addEventListener('click', () => showStep(7));
  }

  // ------------------------------------------------------------------------
  // 9. STEP 8: GENDER SELECTION
  // ------------------------------------------------------------------------
  const genderCards = document.querySelectorAll('.gender-card');
  genderCards.forEach(card => {
    card.addEventListener('click', () => {
      genderCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      leadData.gender = card.getAttribute('data-value');

      setTimeout(() => {
        showStep(9);
      }, 220);
    });
  });

  // ------------------------------------------------------------------------
  // 10. STEP 9: BIRTHDATE INPUTS
  // ------------------------------------------------------------------------
  const dobMonth = document.getElementById('dob-month');
  const dobDay = document.getElementById('dob-day');
  const dobYear = document.getElementById('dob-year');
  const nextStep9Btn = document.getElementById('next-step-9');

  function validateDOB() {
    if (!dobMonth || !dobDay || !dobYear || !nextStep9Btn) return;
    const m = parseInt(dobMonth.value, 10);
    const d = parseInt(dobDay.value, 10);
    const y = parseInt(dobYear.value, 10);

    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1930 && y <= 2008) {
      nextStep9Btn.disabled = false;
      leadData.dobMonth = m;
      leadData.dobDay = d;
      leadData.dobYear = y;
    } else {
      nextStep9Btn.disabled = true;
    }
  }

  [dobMonth, dobDay, dobYear].forEach(input => {
    if (input) input.addEventListener('input', validateDOB);
  });

  if (nextStep9Btn) {
    nextStep9Btn.addEventListener('click', () => {
      if (!nextStep9Btn.disabled) showStep(10);
    });
  }

  // ------------------------------------------------------------------------
  // 11. STEP 10 & 11: COUNTRY & STATE OF BIRTH
  // ------------------------------------------------------------------------
  const countrySelect = document.getElementById('country-of-birth');
  const nextStep10Btn = document.getElementById('next-step-10');
  if (nextStep10Btn) {
    nextStep10Btn.addEventListener('click', () => {
      if (countrySelect) leadData.countryOfBirth = countrySelect.value;
      showStep(11);
    });
  }

  const stateSelect = document.getElementById('state-of-birth');
  const nextStep11Btn = document.getElementById('next-step-11');

  if (stateSelect && nextStep11Btn) {
    stateSelect.addEventListener('change', () => {
      if (stateSelect.value) {
        nextStep11Btn.disabled = false;
        leadData.stateOfBirth = stateSelect.value;
      }
    });

    nextStep11Btn.addEventListener('click', () => {
      if (!nextStep11Btn.disabled) showStep(12);
    });
  }

  // ------------------------------------------------------------------------
  // 12. STEP 13: COVERAGE SLIDER SCALE ($5,000 - $50,000 in $1,000 steps)
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

  if (nextStep13Btn) {
    nextStep13Btn.addEventListener('click', () => {
      populateCoverageBreakdown();
      showStep(14);
    });
  }

  // ------------------------------------------------------------------------
  // 13. STEP 14: PERSONALIZED COVERAGE BREAKDOWN
  // ------------------------------------------------------------------------
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

  const nextStep14Btn = document.getElementById('next-step-14');
  if (nextStep14Btn) {
    nextStep14Btn.addEventListener('click', () => showStep(15));
  }

  // ------------------------------------------------------------------------
  // 14. STEP 15: NAME
  // ------------------------------------------------------------------------
  const firstNameInput = document.getElementById('first-name');
  const lastNameInput = document.getElementById('last-name');
  const nextStep15Btn = document.getElementById('next-step-15');

  function validateName() {
    if (!firstNameInput || !lastNameInput || !nextStep15Btn) return;
    if (firstNameInput.value.trim().length >= 2 && lastNameInput.value.trim().length >= 2) {
      nextStep15Btn.disabled = false;
      leadData.firstName = firstNameInput.value.trim();
      leadData.lastName = lastNameInput.value.trim();
    } else {
      nextStep15Btn.disabled = true;
    }
  }

  [firstNameInput, lastNameInput].forEach(i => {
    if (i) i.addEventListener('input', validateName);
  });

  if (nextStep15Btn) {
    nextStep15Btn.addEventListener('click', () => {
      if (!nextStep15Btn.disabled) showStep(16);
    });
  }

  // ------------------------------------------------------------------------
  // 15. STEP 16: EMAIL
  // ------------------------------------------------------------------------
  const emailInput = document.getElementById('email-input');
  const nextStep16Btn = document.getElementById('next-step-16');

  if (emailInput && nextStep16Btn) {
    emailInput.addEventListener('input', () => {
      const val = emailInput.value.trim();
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        nextStep16Btn.disabled = false;
        leadData.email = val;
      } else {
        nextStep16Btn.disabled = true;
      }
    });

    nextStep16Btn.addEventListener('click', () => {
      if (!nextStep16Btn.disabled) showStep(17);
    });
  }

  // ------------------------------------------------------------------------
  // 16. STEP 17: PHONE & STEP 18: INSTANT RATE CALCULATOR & GOOGLE SHEET SUBMISSION
  // Target Google Sheet: https://docs.google.com/spreadsheets/d/1d3L_vrC8q47jVJnZZpkJ-XdYlMNBdVs4le8PV_DfKBE/edit
  // ------------------------------------------------------------------------
  function submitLeadToGoogleSheet(data) {
    const birthYear = data.dobYear || 1956;
    const currentYear = new Date().getFullYear();
    const age = Math.max(18, Math.min(90, currentYear - birthYear));
    const finalRateText = document.getElementById('final-price-val') ? document.getElementById('final-price-val').textContent : '';

    const payload = {
      sheetId: '1d3L_vrC8q47jVJnZZpkJ-XdYlMNBdVs4le8PV_DfKBE',
      timestamp: new Date().toLocaleString(),
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone || '',
      coverageAmount: '$' + (data.coverageAmount || 25000).toLocaleString(),
      estimatedMonthlyRate: finalRateText,
      gender: data.gender || 'Male',
      age: age,
      dob: `${data.dobMonth}/${data.dobDay}/${data.dobYear}`,
      countryOfBirth: data.countryOfBirth || 'United States',
      stateOfBirth: data.stateOfBirth || '',
      citizenship: data.citizenship || '',
      goals: Array.isArray(data.goals) ? data.goals.join(', ') : '',
      dependents: Array.isArray(data.dependents) ? data.dependents.join(', ') : '',
      childrenCount: data.childrenCount || '',
      trigger: data.trigger || '',
      factor: data.factor || '',
      timing: data.timing || ''
    };

    console.log('🚀 [ALPINE FAIRVIEW] Submitting lead data to Google Sheet (1d3L_vrC8q47jVJnZZpkJ-XdYlMNBdVs4le8PV_DfKBE):', payload);

    // Save lead to local backup history
    try {
      const existingLeads = JSON.parse(localStorage.getItem('alpine_fairview_leads') || '[]');
      existingLeads.push(payload);
      localStorage.setItem('alpine_fairview_leads', JSON.stringify(existingLeads));
    } catch(e) {}

    // Post to Google Apps Script / Sheet Webhook endpoint
    const webhookUrl = 'https://script.google.com/macros/s/AKfycbx_AlpineFairview_Sheet/exec';
    try {
      fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch (e) {}
  }

  const phoneInput = document.getElementById('phone-input');
  const nextStep17Btn = document.getElementById('next-step-17');

  if (phoneInput && nextStep17Btn) {
    phoneInput.addEventListener('input', () => {
      const digits = phoneInput.value.replace(/\D/g, '');
      if (digits.length >= 10) {
        nextStep17Btn.disabled = false;
        leadData.phone = digits;
      } else {
        nextStep17Btn.disabled = true;
      }
    });

    nextStep17Btn.addEventListener('click', () => {
      if (!nextStep17Btn.disabled) {
        calculateAndDisplayRate();
        submitLeadToGoogleSheet(leadData);
        showStep(18);
      }
    });
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
  // User Benchmark Rates (Male at $10k):
  // 40yr: $20.78, 50yr: $28.18, 60yr: $41.26, 70yr: $69.48, 80yr: $137.23, 85yr: $190.24
  // ========================================================================
  function getRatePerThousand(age, gender) {
    let rateK = 2.328;

    if (age <= 40) {
      rateK = 2.328 * (1 - (40 - Math.max(18, age)) * 0.012);
    } else if (age <= 50) {
      const t = (age - 40) / 10;
      rateK = 2.328 + t * (3.068 - 2.328);
    } else if (age <= 60) {
      const t = (age - 50) / 10;
      rateK = 3.068 + t * (4.376 - 3.068);
    } else if (age <= 70) {
      const t = (age - 60) / 10;
      rateK = 4.376 + t * (7.198 - 4.376);
    } else if (age <= 75) {
      const t = (age - 70) / 5;
      rateK = 7.198 + t * (9.7424 - 7.198);
    } else if (age <= 80) {
      const t = (age - 75) / 5;
      rateK = 9.7424 + t * (13.973 - 9.7424);
    } else if (age <= 85) {
      const t = (age - 80) / 5;
      rateK = 13.973 + t * (19.274 - 13.973);
    } else {
      const extraYears = age - 85;
      rateK = 19.274 + extraYears * 1.45;
    }

    if (gender === 'Female') {
      rateK *= 0.84;
    }

    return rateK;
  }

  function calculateAndDisplayRate() {
    const priceVal = document.getElementById('final-price-val');
    const coverageAmt = document.getElementById('final-coverage-amt');
    const benchmarkNote = document.getElementById('final-rate-benchmark-note');

    // Calculate age
    const birthYear = leadData.dobYear || 1956;
    const currentYear = new Date().getFullYear();
    const age = Math.max(18, Math.min(90, currentYear - birthYear));
    const gender = leadData.gender || 'Male';
    const coverage = leadData.coverageAmount || 25000;

    const rateK = getRatePerThousand(age, gender);
    let totalMonthly = (coverage / 1000) * rateK;

    // Subtract $2.50 directly for actual base rate estimation
    totalMonthly = Math.max(5.00, totalMonthly - 2.50);

    const formattedPrice = `$${totalMonthly.toFixed(2)}`;

    if (priceVal) priceVal.textContent = formattedPrice;
    if (coverageAmt) coverageAmt.textContent = `${formatCurrency(coverage)} Guaranteed Whole Life Benefit`;
    if (benchmarkNote) {
      benchmarkNote.textContent = `Estimated rate based on ${gender}, Age ${age} for ${formatCurrency(coverage)} coverage.`;
    }
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

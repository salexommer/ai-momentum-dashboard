/* ========================================
   AI Momentum Dashboard — JavaScript
   ======================================== */

(function () {
  'use strict';

  /* ---------- Personio Colour Palette ---------- */
  const COLOURS = {
    primary: '#4B2AAD',
    primaryLight: '#6B4FCC',
    primaryDark: '#3A1F8C',
    secondary: '#FF6B35',
    secondaryLight: '#FF8F66',
    success: '#22C55E',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    /* Spectrum levels */
    spectrum: ['#3A1F8C', '#4B2AAD', '#6B4FCC', '#9B85E0'],
    /* Violet gradient for bar charts (darkest first) */
    violetGradient: [
      '#3A1F8C', '#4529A0', '#4B2AAD', '#5A3ABB',
      '#6B4FCC', '#7E66D6', '#9B85E0', '#B8A7E8',
    ],
    /* Warm tones for blocker charts */
    warmGradient: [
      '#C2410C', '#DC2626', '#EA580C', '#F97316',
      '#FB923C', '#FDBA74', '#FED7AA', '#FFEDD5',
    ],
    /* Three-segment donut */
    donut3: ['#4B2AAD', '#6B4FCC', '#FF6B35'],
    /* Satisfaction ring */
    ringFill: '#4B2AAD',
    ringTrack: isDarkMode ? '#374151' : '#E5E7EB',
  };

  /* ---------- Chart.js Global Defaults ---------- */
  Chart.defaults.font.family =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  Chart.defaults.font.size = 14;
  Chart.defaults.color = '#6B7280';
  Chart.defaults.plugins.legend.display = false;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.titleFont = { weight: '600', size: 14 };
  Chart.defaults.plugins.tooltip.bodyFont = { size: 13 };

  /* ---------- Dark Mode Detection ---------- */
  var isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var chartFontColor = isDarkMode ? '#9CA3AF' : '#6B7280';
  var chartGridColor = isDarkMode ? '#374151' : '#F3F4F6';
  Chart.defaults.color = chartFontColor;

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      isDarkMode = e.matches;
      chartFontColor = isDarkMode ? '#9CA3AF' : '#6B7280';
      chartGridColor = isDarkMode ? '#374151' : '#F3F4F6';
      Chart.defaults.color = chartFontColor;
      if (cohortData) renderAll();
    });
  }

  /* ---------- Chart Insights ---------- */
  var CHART_INSIGHTS = {
    expectations: 'Most participants correctly identified that AI doesn\'t truly understand language. The splits on nuanced statements show a healthy mix of critical thinking — exactly the foundation the programme aims to build.',
    spectrum: '56% of participants self-assessed at Level 3 (Thinking Partner), suggesting this cohort is more advanced than typical starting populations. Only 2% are at the basic Search Engine level, indicating strong existing familiarity with AI.',
    blockers: 'Time is the dominant barrier at 39%, not trust or skills gaps. 30% report they\'re already using AI well — the real challenge is expansion and deepening, not initial adoption.',
    shifts: 'The Expertise Shift resonated most strongly (59%), indicating the biggest mindset barrier is feeling they need to be experts before starting. Permission to learn by doing is the most impactful reframe.',
    use: 'Writing & Content and Data & Analysis dominate, aligning closely with the pre-programme AI Survey (38% content creation, 24% research). The diversity across 9 themes shows AI potential is recognised across every function.',
    stopping: 'Time and tooling issues outweigh trust or skills concerns — participants want to use AI but face practical barriers. This directly informs the design of Topics 2-4 and Adoption Group priorities.',
    actions: '81% committed to the Verification Question (alone or combined), showing strong buy-in for the critical thinking habit. This is the programme\'s most important behavioural outcome.',
    reflection: '72% report using AI regularly or confidently, while 28% are still experimenting or earlier. This validates the programme\'s multi-level approach of meeting people where they are on the AI Spectrum.',
  };

  /* ---------- State ---------- */
  let config = null;
  let cohortData = null;
  const charts = {}; // track chart instances for cleanup

  /* ---------- Fallback Mock Data ---------- */
  const FALLBACK_CONFIG = {
    programme_name: 'AI Momentum',
    organisation: 'Personio',
    total_employees: 1400,
    certification_target_h1: 0.4,
    certification_target_eoy: 1.0,
    topics: [
      { number: 1, name: 'AI Foundations', status: 'delivering' },
      { number: 2, name: 'Execution & Automation', status: 'planned' },
      { number: 3, name: 'Systems Thinking', status: 'planned' },
      { number: 4, name: 'Data Literacy', status: 'planned' },
    ],
    cohorts: ['t1-c1'],
    shift_descriptions: {
      'Replacement shift': {
        from: 'AI will replace me',
        to: 'AI handles the repetitive stuff so I can focus on what actually needs me',
      },
      'Expertise shift': {
        from: 'I need to be an expert first',
        to: 'I learn by doing, and imperfect first attempts are how skills develop',
      },
      'Failure shift': {
        from: 'What if I get it wrong?',
        to: "What if I don't try and get left behind?",
      },
    },
    ai_spectrum_descriptions: {
      'L1 - Search Engine': 'Using AI to look things up',
      'L2 - First Draft': 'Getting AI to create a starting point',
      'L3 - Thinking Partner': 'Using AI to challenge and refine your thinking',
      'L4 - Workflow Collaborator': 'Integrating AI into your daily workflow',
    },
    atomic_action_descriptions: {
      'The First Experiment': 'Try one AI-assisted task this week',
      'The Verification Question':
        'Before trusting AI output, ask: How would I verify this?',
      Both: 'Commit to both actions',
    },
  };

  const FALLBACK_COHORT = {
    cohort_id: 't1-c1',
    topic: 'AI Foundations',
    topic_number: 1,
    date: '2026-03-18',
    registered: 238,
    poll_participants: 145,
    evaluation_respondents: 47,
    expectations: [
      {
        statement: 'AI can reliably summarise a 40-page document without missing key details.',
        correct_answer: 'It Depends',
        responses: { True: 41, False: 21, 'It Depends': 83 },
        total: 145,
      },
      {
        statement: 'AI understands what it writes.',
        correct_answer: 'False',
        responses: { True: 19, False: 96, 'It Depends': 28 },
        total: 143,
      },
      {
        statement: 'AI is only useful if you work in a technical role.',
        correct_answer: 'False',
        responses: { True: 0, False: 132, 'It Depends': 3 },
        total: 135,
      },
      {
        statement: "If AI gives you a wrong answer, it's because you asked the wrong question.",
        correct_answer: 'Partly True',
        responses: { True: 2, 'Partly True': 100, False: 27 },
        total: 129,
      },
      {
        statement: 'Companies that adopt AI effectively will outperform those that don\'t.',
        correct_answer: 'It Depends',
        responses: { True: 88, False: 2, 'It Depends': 41 },
        total: 131,
      },
    ],
    ai_spectrum: {
      responses: {
        'L1 - Search Engine': 2,
        'L2 - First Draft': 35,
        'L3 - Thinking Partner': 70,
        'L4 - Workflow Colaborator': 18,
      },
      total: 125,
    },
    blockers: {
      responses: {
        "I'm not sure where to start": 22,
        "I don't trust the output": 14,
        "I don't have time to learn": 48,
        "I'm worried about getting it wrong": 2,
        "I'm already using it well (open to learning more)": 36,
      },
      total: 122,
    },
    shifts: {
      responses: {
        'Replacement shift': 28,
        'Expertise shift': 53,
        'Failure shift': 9,
      },
      total: 90,
    },
    word_cloud_tasks: [
      {
        theme: 'Other',
        count: 71,
        examples: [
          'wrong outputs', 'Confidentiality', 'hallucinations',
          "Don't know where to start", 'Quality of output', 'Data security',
          'unsure about how to prompt', 'Lack of knowledge', 'Lack of time',
        ],
      },
    ],
    word_cloud_blockers: [],
    atomic_actions: {
      responses: {
        'The First Experiment': 10,
        'The Verification Question': 23,
        Both: 20,
      },
      total: 53,
    },
    self_reflection: {
      responses: {
        'Still figuring out': 1,
        "Curious but haven't started": 2,
        'Experimenting, hit and miss': 10,
        'Using regularly': 20,
        'Use confidently and critically': 14,
      },
      total: 47,
    },
    satisfaction: {
      overall: { mean: 4.1, distribution: { 3: 9, 4: 23, 5: 15 }, total: 47 },
      facilitator_expertise: { mean: 4.6, distribution: { 3: 3, 4: 11, 5: 33 }, total: 47 },
      recommend: { mean: 4.3, distribution: { 2: 1, 3: 8, 4: 14, 5: 24 }, total: 47 },
    },
    qualitative_highlights: [
      { text: 'Loved it! Great use of breaks and different perspectives.', theme: 'positive' },
      { text: 'Would have liked more hands-on practical exercises.', theme: 'improvement' },
      { text: 'Good session overall but 2 hours felt long towards the end.', theme: 'mixed' },
    ],
    chat_highlights: [
      { text: 'Love that you added this short break', reactions: 9, reaction_type: 'heart' },
      { text: 'This was a great session', reactions: 0 },
      { text: '5/5 would recommend', reactions: 0 },
    ],
  };

  /* ============================================================
     Utilities
     ============================================================ */

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  function parseCohortId(id) {
    // e.g. "t1-c1" -> { topic: 1, cohort: 1 }
    const match = id.match(/t(\d+)-c(\d+)/);
    if (match) return { topic: parseInt(match[1]), cohort: parseInt(match[2]) };
    return { topic: 1, cohort: 1 };
  }

  function pct(value, total) {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  }

  function destroyChart(key) {
    if (charts[key]) {
      charts[key].destroy();
      delete charts[key];
    }
  }

  function destroyAllCharts() {
    Object.keys(charts).forEach(destroyChart);
  }

  /* Animated counter */
  function animateCounter(el, target, duration) {
    duration = duration || 1200;
    const start = 0;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  /* ============================================================
     Data Loading
     ============================================================ */

  async function fetchJSON(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      return await res.json();
    } catch (e) {
      console.warn('Fetch failed for ' + url + ', using fallback data.', e);
      return null;
    }
  }

  async function loadConfig() {
    const data = await fetchJSON('data/config.json');
    config = data || FALLBACK_CONFIG;
  }

  async function loadCohort(cohortId) {
    const data = await fetchJSON('data/cohorts/' + cohortId + '.json');
    cohortData = data || FALLBACK_COHORT;
  }

  /* ============================================================
     Header / Navigation
     ============================================================ */

  function initHeader() {
    const header = document.getElementById('header');
    const scrollProgress = document.getElementById('scroll-progress');

    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 10);

      // Scroll progress bar
      if (scrollProgress) {
        var scrollTop = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var scrollPct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollProgress.style.width = scrollPct + '%';
      }
    });
  }

  /* --- Scroll Reveal Observer --- */
  function initScrollReveal() {
    var sections = document.querySelectorAll('.section, #about');
    sections.forEach(function (section) {
      section.classList.add('reveal');
    });

    // Also reveal about-cards with staggered delays
    var aboutCards = document.querySelectorAll('.about-card');
    aboutCards.forEach(function (card, i) {
      card.classList.add('reveal');
      if (i > 0) card.classList.add('reveal-delay-' + Math.min(i, 3));
    });

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
      });

      document.querySelectorAll('.reveal').forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // Fallback: show everything immediately
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('visible');
      });
    }
  }

  function populateCohortDropdown() {
    const select = document.getElementById('cohort-select');
    select.innerHTML = '';

    (config.cohorts || []).forEach(function (id) {
      const parsed = parseCohortId(id);
      const topic = (config.topics || []).find(function (t) {
        return t.number === parsed.topic;
      });
      const topicName = topic ? topic.name : 'Topic ' + parsed.topic;
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = topicName + ' — Cohort ' + parsed.cohort;
      select.appendChild(opt);
    });

    select.addEventListener('change', async function () {
      const id = select.value;
      if (id) {
        await loadCohort(id);
        renderAll();
      }
    });
  }

  /* ============================================================
     Section Renderers
     ============================================================ */

  /* --- Hero --- */
  function renderHero() {
    const d = cohortData;
    const parsed = parseCohortId(d.cohort_id);
    const topic = (config.topics || []).find(function (t) {
      return t.number === d.topic_number || t.number === parsed.topic;
    });
    const topicName = d.topic || (topic ? topic.name : 'Session');

    document.getElementById('hero-title').textContent = topicName;
    document.getElementById('hero-eyebrow').textContent =
      'Topic ' + (d.topic_number || parsed.topic) +
      ' \u00B7 Cohort ' + (d.cohort_number || parsed.cohort) +
      ' \u00B7 ' + formatDate(d.date);

    animateCounter(document.getElementById('metric-registered'), d.registered);
    animateCounter(document.getElementById('metric-polls'), d.poll_participants);
    animateCounter(document.getElementById('metric-eval'), d.evaluation_respondents);
  }

  /* --- Expectations vs Reality --- */
  function renderExpectations() {
    const section = document.getElementById('expectations');
    const expectations = cohortData.expectations;

    if (!expectations || !expectations.length) {
      section.style.display = 'none';
      return;
    }
    section.style.display = '';

    // Collect all unique answer keys across all statements
    const allKeys = [];
    expectations.forEach(function (item) {
      Object.keys(item.responses).forEach(function (k) {
        if (allKeys.indexOf(k) === -1) allKeys.push(k);
      });
    });

    // Shorten labels for chart
    const labels = expectations.map(function (item) {
      let s = item.statement;
      if (s.length > 60) s = s.substring(0, 57) + '...';
      return s;
    });

    const datasets = allKeys.map(function (key, i) {
      const baseColors = ['#6B4FCC', '#9B85E0', '#B8A7E8', '#D4CBF0'];
      return {
        label: key,
        data: expectations.map(function (item) {
          return item.responses[key] || 0;
        }),
        backgroundColor: expectations.map(function (item) {
          return key === item.correct_answer ? COLOURS.secondary : (baseColors[i] || baseColors[0]);
        }),
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 4,
        borderSkipped: false,
      };
    });

    destroyChart('expectations');
    const ctx = document.getElementById('expectations-chart').getContext('2d');
    charts.expectations = new Chart(ctx, {
      type: 'bar',
      data: { labels: labels, datasets: datasets },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        onClick: function (event, elements) {
          if (elements.length > 0) {
            var expLabels = expectations.map(function (e) { return e.statement.length > 50 ? e.statement.substring(0, 50) + '...' : e.statement; });
            var expTotals = expectations.map(function (e) { return e.total; });
            var grandTotal = expTotals.reduce(function (a, b) { return a + b; }, 0);
            toggleDetailPanel('expectations', document.getElementById('expectations').querySelector('.chart-card'), {
              labels: expLabels,
              values: expTotals,
              total: grandTotal,
            }, CHART_INSIGHTS.expectations);
          }
        },
        scales: {
          x: {
            grid: { display: true, color: chartGridColor },
            ticks: { stepSize: 20 },
            title: { display: true, text: 'Number of responses', color: '#9CA3AF', font: { size: 11 } },
          },
          y: {
            grid: { display: false },
            ticks: {
              font: { size: 12.5 },
              callback: function (value) {
                var label = this.getLabelForValue(value);
                // Wrap long labels
                if (label.length > 45) {
                  var words = label.split(' ');
                  var lines = [];
                  var line = '';
                  words.forEach(function (w) {
                    if ((line + ' ' + w).trim().length > 45) {
                      lines.push(line.trim());
                      line = w;
                    } else {
                      line = (line + ' ' + w).trim();
                    }
                  });
                  if (line) lines.push(line.trim());
                  return lines;
                }
                return label;
              },
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              afterLabel: function (ctx) {
                var item = expectations[ctx.dataIndex];
                if (ctx.dataset.label === item.correct_answer) {
                  return '(Correct answer)';
                }
                return '';
              },
            },
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              pointStyle: 'rectRounded',
              padding: 16,
              font: { size: 12 },
              generateLabels: function (chart) {
                var ds = chart.data.datasets;
                return ds.map(function (d, i) {
                  return {
                    text: d.label,
                    fillStyle: ['#6B4FCC', '#9B85E0', '#B8A7E8', '#D4CBF0'][i] || '#6B4FCC',
                    strokeStyle: 'transparent',
                    hidden: false,
                    index: i,
                  };
                });
              },
            },
          },
        },
      },
    });

    // Insight
    var insightText =
      'Orange bars highlight the correct answer. ' +
      'Most participants correctly identified that AI doesn\'t truly understand language. ' +
      'The splits on more nuanced statements show a healthy mix of perspectives — exactly the kind of critical thinking the programme aims to build.';
    document.querySelector('#expectations .insight-text').textContent = insightText;
  }

  /* --- AI Spectrum Donut --- */
  function renderSpectrum() {
    var spec = cohortData.ai_spectrum;
    if (!spec || !spec.responses) return;

    var labels = Object.keys(spec.responses);
    var counts = Object.values(spec.responses);
    var total = spec.total || counts.reduce(function (a, b) { return a + b; }, 0);

    // Build legend
    var legendEl = document.getElementById('spectrum-legend');
    legendEl.innerHTML = '';
    labels.forEach(function (label, i) {
      var pctVal = pct(counts[i], total);
      var div = document.createElement('div');
      div.className = 'legend-item';
      div.innerHTML =
        '<span class="legend-dot" style="background:' + COLOURS.spectrum[i] + '"></span>' +
        '<span>' + label + '</span>' +
        '<span class="legend-value">' + pctVal + '%</span>';
      legendEl.appendChild(div);
    });

    destroyChart('spectrum');
    var ctx = document.getElementById('spectrum-chart').getContext('2d');
    charts.spectrum = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: COLOURS.spectrum,
          borderWidth: 2,
          borderColor: isDarkMode ? '#232340' : '#fff',
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '68%',
        onClick: function (event, elements) {
          if (elements.length > 0) {
            toggleDetailPanel('spectrum', document.getElementById('spectrum-chart').closest('.chart-card'), {
              labels: labels,
              values: counts,
              total: total,
            }, CHART_INSIGHTS.spectrum);
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return ctx.label + ': ' + ctx.raw + ' (' + pct(ctx.raw, total) + '%)';
              },
            },
          },
        },
      },
      plugins: [{
        id: 'centreText',
        afterDraw: function (chart) {
          var ctx2 = chart.ctx;
          var cx = chart.width / 2;
          var cy = chart.height / 2;
          ctx2.save();
          ctx2.textAlign = 'center';
          ctx2.textBaseline = 'middle';
          ctx2.font = '700 1.5rem ' + Chart.defaults.font.family;
          ctx2.fillStyle = isDarkMode ? '#E5E7EB' : '#1A1A2E';
          ctx2.fillText(total, cx, cy - 8);
          ctx2.font = '400 0.75rem ' + Chart.defaults.font.family;
          ctx2.fillStyle = '#9CA3AF';
          ctx2.fillText('responses', cx, cy + 14);
          ctx2.restore();
        },
      }],
    });
  }

  /* --- Blockers Bar --- */
  function renderBlockers() {
    var blockers = cohortData.blockers;
    if (!blockers || !blockers.responses) return;

    var entries = Object.entries(blockers.responses)
      .sort(function (a, b) { return b[1] - a[1]; });
    var labels = entries.map(function (e) { return e[0]; });
    var counts = entries.map(function (e) { return e[1]; });
    var total = blockers.total || counts.reduce(function (a, b) { return a + b; }, 0);

    destroyChart('blockers');
    var ctx = document.getElementById('blockers-chart').getContext('2d');
    charts.blockers = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: COLOURS.violetGradient.slice(0, labels.length),
          borderRadius: 6,
          borderSkipped: false,
          barThickness: 28,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        onClick: function (event, elements) {
          if (elements.length > 0) {
            toggleDetailPanel('blockers', document.getElementById('blockers-chart').closest('.chart-card'), {
              labels: labels,
              values: counts,
              total: total,
            }, CHART_INSIGHTS.blockers);
          }
        },
        scales: {
          x: { grid: { display: true, color: chartGridColor }, ticks: { stepSize: 10 } },
          y: {
            grid: { display: false },
            ticks: {
              font: { size: 12.5 },
              callback: function (value) {
                var label = this.getLabelForValue(value);
                if (label.length > 30) {
                  var parts = [];
                  var words = label.split(' ');
                  var line = '';
                  words.forEach(function (w) {
                    if ((line + ' ' + w).trim().length > 30) {
                      parts.push(line.trim());
                      line = w;
                    } else {
                      line = (line + ' ' + w).trim();
                    }
                  });
                  if (line) parts.push(line.trim());
                  return parts;
                }
                return label;
              },
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return ctx.raw + ' responses (' + pct(ctx.raw, total) + '%)';
              },
            },
          },
        },
      },
    });
  }

  /* --- Shifts --- */
  function renderShifts() {
    var shifts = cohortData.shifts;
    var section = document.getElementById('shifts');
    if (!shifts || !shifts.responses) {
      section.style.display = 'none';
      return;
    }
    section.style.display = '';

    var grid = document.getElementById('shifts-grid');
    grid.innerHTML = '';

    var entries = Object.entries(shifts.responses);
    var total = shifts.total || entries.reduce(function (a, e) { return a + e[1]; }, 0);
    var maxVal = Math.max.apply(null, entries.map(function (e) { return e[1]; }));
    var descs = (config && config.shift_descriptions) || {};

    entries.forEach(function (entry) {
      var key = entry[0];
      var count = entry[1];
      var percentage = pct(count, total);
      var isWinner = count === maxVal;
      var desc = descs[key] || {};
      var name = key.replace(' shift', '');

      var card = document.createElement('div');
      card.className = 'shift-card' + (isWinner ? ' winner' : '');
      card.innerHTML =
        '<div class="shift-name">' + name + '</div>' +
        '<div class="shift-from">"' + (desc.from || '') + '"</div>' +
        '<div class="shift-arrow">\u2193</div>' +
        '<div class="shift-to">"' + (desc.to || '') + '"</div>' +
        '<div class="shift-pct">' + percentage + '%</div>' +
        '<div class="shift-count">' + count + ' of ' + total + ' votes</div>';
      grid.appendChild(card);
    });
  }

  /* --- Word Cloud: Use Cases (Tasks) --- */
  function renderWordCloudUse() {
    var section = document.getElementById('use-cases');
    var data = cohortData.word_cloud_tasks;

    if (!data || !data.length) {
      section.style.display = 'none';
      return;
    }
    section.style.display = '';

    // If there is only a single "Other" theme with many raw examples,
    // we group the examples into categories for a richer visualization
    var themes = data;
    if (data.length === 1 && data[0].theme === 'Other') {
      themes = categoriseRawExamples(data[0].examples);
    }

    themes.sort(function (a, b) { return b.count - a.count; });

    var labels = themes.map(function (t) { return t.theme; });
    var counts = themes.map(function (t) { return t.count; });

    destroyChart('use');
    var ctx = document.getElementById('use-chart').getContext('2d');
    var useTotalCount = counts.reduce(function (a, b) { return a + b; }, 0);
    charts.use = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: COLOURS.violetGradient.slice(0, labels.length),
          borderRadius: 6,
          borderSkipped: false,
          barThickness: 28,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        onClick: function (event, elements) {
          if (elements.length > 0) {
            toggleDetailPanel('use', document.getElementById('use-cases').querySelector('.chart-card'), {
              labels: labels,
              values: counts,
              total: useTotalCount,
            }, CHART_INSIGHTS.use);
          }
        },
        scales: {
          x: { grid: { display: true, color: chartGridColor } },
          y: { grid: { display: false }, ticks: { font: { size: 13 } } },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return ctx.raw + ' responses';
              },
            },
          },
        },
        onHover: function (event, elements) {
          var container = document.getElementById('use-examples');
          if (elements.length > 0) {
            var idx = elements[0].index;
            var t = themes[idx];
            showExamples(container, t.theme, t.examples || []);
          } else {
            container.innerHTML =
              '<p class="theme-examples-hint">Hover over a bar to see example responses</p>';
          }
        },
      },
    });
  }

  /* --- Word Cloud: Blockers --- */
  function renderWordCloudBlockers() {
    var section = document.getElementById('stopping');
    var data = cohortData.word_cloud_blockers;

    if (!data || !data.length) {
      section.style.display = 'none';
      return;
    }
    section.style.display = '';

    var themes = data;
    if (data.length === 1 && data[0].theme === 'Other') {
      themes = categoriseRawExamples(data[0].examples);
    }

    themes.sort(function (a, b) { return b.count - a.count; });

    var labels = themes.map(function (t) { return t.theme; });
    var counts = themes.map(function (t) { return t.count; });

    destroyChart('stopping');
    var ctx = document.getElementById('stopping-chart').getContext('2d');
    var stoppingTotalCount = counts.reduce(function (a, b) { return a + b; }, 0);
    charts.stopping = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: COLOURS.warmGradient.slice(0, labels.length),
          borderRadius: 6,
          borderSkipped: false,
          barThickness: 28,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        onClick: function (event, elements) {
          if (elements.length > 0) {
            toggleDetailPanel('stopping', document.getElementById('stopping').querySelector('.chart-card'), {
              labels: labels,
              values: counts,
              total: stoppingTotalCount,
            }, CHART_INSIGHTS.stopping);
          }
        },
        scales: {
          x: { grid: { display: true, color: chartGridColor } },
          y: { grid: { display: false }, ticks: { font: { size: 13 } } },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return ctx.raw + ' responses';
              },
            },
          },
        },
        onHover: function (event, elements) {
          var container = document.getElementById('stopping-examples');
          if (elements.length > 0) {
            var idx = elements[0].index;
            var t = themes[idx];
            showExamples(container, t.theme, t.examples || []);
          } else {
            container.innerHTML =
              '<p class="theme-examples-hint">Hover over a bar to see example responses</p>';
          }
        },
      },
    });
  }

  /* Helper: categorise raw word-cloud examples into themes */
  function categoriseRawExamples(examples) {
    var categories = {
      'Time & Prioritisation': [],
      'Trust & Output Quality': [],
      'Knowledge & Skills Gap': [],
      'Data Security & Ethics': [],
      'Tool & Integration Issues': [],
      'Getting Started': [],
      'Other': [],
    };

    var keywords = {
      'Time & Prioritisation': ['time', 'busy', 'priorit', 'deadline'],
      'Trust & Output Quality': [
        'trust', 'quality', 'output', 'wrong', 'accuracy', 'errors', 'error',
        'hallucination', 'failure rate', 'generic answers', 'complex and bad',
        'correct', 'reliable',
      ],
      'Knowledge & Skills Gap': [
        'knowledge', 'know', 'prompt', 'learn', 'skill', 'confidence', 'imposter',
        'unsure', 'not knowing', 'lack of knowledge',
      ],
      'Data Security & Ethics': [
        'data', 'security', 'sensitive', 'confidential', 'ethical', 'values',
        'ownership', 'privacy',
      ],
      'Tool & Integration Issues': [
        'integration', 'tool', 'setup', 'system', 'availability', 'credit',
        'rate limit', 'cost', 'clicks',
      ],
      'Getting Started': ['start', 'how to', 'where to', 'nothing', 'already do'],
    };

    (examples || []).forEach(function (ex) {
      var lower = ex.toLowerCase();
      var matched = false;
      var cats = Object.keys(keywords);
      for (var i = 0; i < cats.length; i++) {
        var cat = cats[i];
        var kws = keywords[cat];
        for (var j = 0; j < kws.length; j++) {
          if (lower.indexOf(kws[j]) !== -1) {
            categories[cat].push(ex);
            matched = true;
            break;
          }
        }
        if (matched) break;
      }
      if (!matched) {
        categories['Other'].push(ex);
      }
    });

    return Object.entries(categories)
      .filter(function (e) { return e[1].length > 0; })
      .map(function (e) {
        return { theme: e[0], count: e[1].length, examples: e[1] };
      });
  }

  /* Helper: show example tags beneath a word-cloud chart */
  function showExamples(container, theme, examples) {
    var shown = examples.slice(0, 6);
    container.innerHTML =
      '<div class="theme-examples-content">' +
      '<div class="theme-examples-title">' + theme + '</div>' +
      '<div class="theme-examples-list">' +
      shown.map(function (e) {
        return '<span class="theme-example-tag">' + escapeHtml(e) + '</span>';
      }).join('') +
      (examples.length > 6 ? '<span class="theme-example-tag">+' + (examples.length - 6) + ' more</span>' : '') +
      '</div></div>';
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  /* --- Sticky Chart Detail Panel --- */
  function toggleDetailPanel(key, container, data, insight) {
    var existing = container.querySelector('.chart-detail-panel');
    if (existing) {
      existing.remove();
      return;
    }

    var panel = document.createElement('div');
    panel.className = 'chart-detail-panel';

    var showAll = data.labels.length <= 5;
    var valuesHtml = '<div class="detail-values">';
    data.labels.forEach(function (label, i) {
      var pctVal = pct(data.values[i], data.total);
      var hiddenClass = (!showAll && i >= 3) ? ' detail-value-hidden' : '';
      valuesHtml +=
        '<div class="detail-value-row' + hiddenClass + '">' +
        '<span class="detail-value-label">' + escapeHtml(label) + '</span>' +
        '<span class="detail-value-bar"><span class="detail-value-fill" style="width:' + pctVal + '%"></span></span>' +
        '<span class="detail-value-num">' + data.values[i] + ' (' + pctVal + '%)</span>' +
        '</div>';
    });
    if (!showAll) {
      valuesHtml += '<button class="detail-expand-btn">Show all ' + data.labels.length + ' values</button>';
    }
    valuesHtml += '</div>';

    var insightHtml =
      '<div class="detail-insight">' +
      '<div class="detail-insight-icon"><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="2"/><path d="M10 6v5M10 13.5v.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div>' +
      '<p class="detail-insight-text">' + insight + '</p>' +
      '</div>';

    var closeHtml = '<button class="detail-close-btn" aria-label="Close">&times;</button>';

    panel.innerHTML = closeHtml + valuesHtml + insightHtml;
    container.appendChild(panel);

    panel.querySelector('.detail-close-btn').addEventListener('click', function () {
      panel.remove();
    });

    var expandBtn = panel.querySelector('.detail-expand-btn');
    if (expandBtn) {
      expandBtn.addEventListener('click', function () {
        panel.querySelectorAll('.detail-value-hidden').forEach(function (el) {
          el.classList.remove('detail-value-hidden');
        });
        expandBtn.remove();
      });
    }
  }

  /* --- Atomic Actions Donut --- */
  function renderAtomicActions() {
    var aa = cohortData.atomic_actions;
    if (!aa || !aa.responses) return;

    var labels = Object.keys(aa.responses);
    var counts = Object.values(aa.responses);
    var total = aa.total || counts.reduce(function (a, b) { return a + b; }, 0);

    // Legend
    var legendEl = document.getElementById('actions-legend');
    legendEl.innerHTML = '';
    labels.forEach(function (label, i) {
      var pctVal = pct(counts[i], total);
      var div = document.createElement('div');
      div.className = 'legend-item';
      div.innerHTML =
        '<span class="legend-dot" style="background:' + COLOURS.donut3[i] + '"></span>' +
        '<span>' + label + '</span>' +
        '<span class="legend-value">' + pctVal + '%</span>';
      legendEl.appendChild(div);
    });

    destroyChart('actions');
    var ctx = document.getElementById('actions-chart').getContext('2d');
    charts.actions = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: COLOURS.donut3,
          borderWidth: 2,
          borderColor: isDarkMode ? '#232340' : '#fff',
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '68%',
        onClick: function (event, elements) {
          if (elements.length > 0) {
            toggleDetailPanel('actions', document.getElementById('actions-chart').closest('.chart-card'), {
              labels: labels,
              values: counts,
              total: total,
            }, CHART_INSIGHTS.actions);
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return ctx.label + ': ' + ctx.raw + ' (' + pct(ctx.raw, total) + '%)';
              },
            },
          },
        },
      },
      plugins: [{
        id: 'centreTextActions',
        afterDraw: function (chart) {
          var ctx2 = chart.ctx;
          var cx = chart.width / 2;
          var cy = chart.height / 2;
          ctx2.save();
          ctx2.textAlign = 'center';
          ctx2.textBaseline = 'middle';
          ctx2.font = '700 1.5rem ' + Chart.defaults.font.family;
          ctx2.fillStyle = isDarkMode ? '#E5E7EB' : '#1A1A2E';
          ctx2.fillText(total, cx, cy - 8);
          ctx2.font = '400 0.75rem ' + Chart.defaults.font.family;
          ctx2.fillStyle = '#9CA3AF';
          ctx2.fillText('committed', cx, cy + 14);
          ctx2.restore();
        },
      }],
    });
  }

  /* --- Self-Reflection Bar --- */
  function renderSelfReflection() {
    var sr = cohortData.self_reflection;
    if (!sr || !sr.responses) return;

    var labels = Object.keys(sr.responses);
    var counts = Object.values(sr.responses);
    var total = sr.total || counts.reduce(function (a, b) { return a + b; }, 0);

    // Gradient from light to dark violet
    var colours = labels.map(function (_, i) {
      var lightness = 80 - (i / (labels.length - 1)) * 50;
      return 'hsl(260, 55%, ' + lightness + '%)';
    });

    destroyChart('reflection');
    var ctx = document.getElementById('reflection-chart').getContext('2d');
    charts.reflection = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: colours,
          borderRadius: 6,
          borderSkipped: false,
          barThickness: 28,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        onClick: function (event, elements) {
          if (elements.length > 0) {
            toggleDetailPanel('reflection', document.getElementById('reflection-chart').closest('.chart-card'), {
              labels: labels,
              values: counts,
              total: total,
            }, CHART_INSIGHTS.reflection);
          }
        },
        scales: {
          x: { grid: { display: true, color: chartGridColor } },
          y: {
            grid: { display: false },
            ticks: {
              font: { size: 12.5 },
              callback: function (value) {
                var label = this.getLabelForValue(value);
                if (label.length > 24) {
                  var parts = [];
                  var words = label.split(' ');
                  var line = '';
                  words.forEach(function (w) {
                    if ((line + ' ' + w).trim().length > 24) {
                      parts.push(line.trim());
                      line = w;
                    } else {
                      line = (line + ' ' + w).trim();
                    }
                  });
                  if (line) parts.push(line.trim());
                  return parts;
                }
                return label;
              },
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return ctx.raw + ' responses (' + pct(ctx.raw, total) + '%)';
              },
            },
          },
        },
      },
    });
  }

  /* --- Satisfaction Rings --- */
  function renderSatisfaction() {
    var sat = cohortData.satisfaction;
    if (!sat) return;

    var metrics = [
      { key: 'overall', label: 'Overall Satisfaction', data: sat.overall },
      { key: 'facilitator_expertise', label: 'Facilitator Expertise', data: sat.facilitator_expertise },
      { key: 'recommend', label: 'Would Recommend', data: sat.recommend },
    ];

    var grid = document.getElementById('satisfaction-grid');
    grid.innerHTML = '';

    metrics.forEach(function (metric) {
      if (!metric.data) return;

      var mean = metric.data.mean;
      var maxVal = 5;
      var dist = metric.data.distribution || {};
      var total = metric.data.total || 0;

      var card = document.createElement('div');
      card.className = 'satisfaction-card';

      // Ring canvas
      var canvasId = 'ring-' + metric.key;
      card.innerHTML =
        '<div class="ring-container">' +
        '<canvas id="' + canvasId + '"></canvas>' +
        '<div class="ring-value">' +
        '<span class="ring-number">' + mean.toFixed(1) + '</span>' +
        '<span class="ring-max">/ ' + maxVal + '</span>' +
        '</div></div>' +
        '<div class="satisfaction-label">' + metric.label + '</div>' +
        '<div class="distribution-bars" id="dist-' + metric.key + '"></div>';
      grid.appendChild(card);

      // Create ring chart
      destroyChart(canvasId);
      var ctx = document.getElementById(canvasId).getContext('2d');
      charts[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [mean, maxVal - mean],
            backgroundColor: [COLOURS.ringFill, COLOURS.ringTrack],
            borderWidth: 0,
            hoverOffset: 0,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '78%',
          plugins: {
            tooltip: { enabled: false },
          },
          animation: {
            animateRotate: true,
            duration: 1000,
          },
        },
      });

      // Distribution bars
      var distContainer = document.getElementById('dist-' + metric.key);
      for (var score = 5; score >= 1; score--) {
        var count = dist[score] || 0;
        var barPct = total > 0 ? (count / total) * 100 : 0;
        var row = document.createElement('div');
        row.className = 'distribution-row';
        row.innerHTML =
          '<span class="distribution-label">' + score + '</span>' +
          '<div class="distribution-track"><div class="distribution-fill" style="width:' + barPct + '%"></div></div>' +
          '<span class="distribution-count">' + count + '</span>';
        distContainer.appendChild(row);
      }
    });
  }

  /* --- Feedback / Qualitative --- */
  function renderFeedback() {
    var section = document.getElementById('feedback');
    var quotes = cohortData.qualitative_highlights;

    if (!quotes || !quotes.length) {
      section.style.display = 'none';
      return;
    }
    section.style.display = '';

    var grid = document.getElementById('feedback-grid');
    grid.innerHTML = '';

    quotes.forEach(function (q, i) {
      var card = document.createElement('div');
      var isLong = q.text.length > 250;
      // Make every 3rd card full-width for visual variety
      var isFullWidth = (i % 3 === 2) || isLong;

      card.className = 'feedback-card' + (isFullWidth ? ' full-width' : '');
      card.setAttribute('data-theme', q.theme);

      var tagClass = 'feedback-tag feedback-tag--' + q.theme;

      var textHtml =
        '<p class="feedback-text' + (isLong ? ' truncated' : '') + '" id="fb-text-' + i + '">' +
        escapeHtml(q.text) + '</p>';

      var readMoreHtml = isLong
        ? '<button class="feedback-read-more" data-target="fb-text-' + i + '">Read more</button>'
        : '';

      card.innerHTML = textHtml + readMoreHtml +
        '<span class="' + tagClass + '">' + q.theme + '</span>';
      grid.appendChild(card);
    });

    // Read more toggle
    grid.addEventListener('click', function (e) {
      if (e.target.classList.contains('feedback-read-more')) {
        var target = document.getElementById(e.target.getAttribute('data-target'));
        if (target) {
          var isExpanded = target.classList.contains('expanded');
          target.classList.toggle('truncated', isExpanded);
          target.classList.toggle('expanded', !isExpanded);
          e.target.textContent = isExpanded ? 'Read more' : 'Show less';
        }
      }
    });

    // Filter buttons
    initFeedbackFilters();
  }

  function initFeedbackFilters() {
    var filterContainer = document.getElementById('feedback-filters');
    // Remove old listeners by replacing the node
    var newContainer = filterContainer.cloneNode(true);
    filterContainer.parentNode.replaceChild(newContainer, filterContainer);

    newContainer.addEventListener('click', function (e) {
      if (!e.target.classList.contains('filter-btn')) return;

      // Update active state
      newContainer.querySelectorAll('.filter-btn').forEach(function (btn) {
        btn.classList.remove('active');
      });
      e.target.classList.add('active');

      var filter = e.target.getAttribute('data-filter');
      var cards = document.querySelectorAll('#feedback-grid .feedback-card');
      cards.forEach(function (card) {
        if (filter === 'all' || card.getAttribute('data-theme') === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  }

  /* --- Chat Highlights --- */
  function renderChatHighlights() {
    var highlights = cohortData.chat_highlights;
    var grid = document.getElementById('chat-highlights-grid');
    var container = document.getElementById('chat-highlights');
    if (!highlights || !highlights.length) {
      if (container) container.style.display = 'none';
      return;
    }
    if (container) container.style.display = '';
    grid.innerHTML = '';

    highlights.forEach(function (h) {
      var bubble = document.createElement('div');
      bubble.className = 'chat-bubble';
      var reactionHtml = '';
      if (h.reactions && h.reactions > 0) {
        var emoji = h.reaction_type === 'heart' ? '\u2764\uFE0F' :
                    h.reaction_type === 'rocket' ? '\uD83D\uDE80' :
                    h.reaction_type === 'hundred' ? '\uD83D\uDCAF' : '\uD83D\uDC4D';
        reactionHtml = '<span class="chat-reaction">' + emoji + ' ' + h.reactions + '</span>';
      }
      bubble.innerHTML = '"' + escapeHtml(h.text) + '"' + reactionHtml;
      grid.appendChild(bubble);
    });
  }

  /* --- Programme Progress --- */
  function renderProgress() {
    var prog = cohortData.programme_progress;
    var totalEmp = (config && config.total_employees) || 1400;

    // Use session-level registered count if no programme_progress data
    var reached = (prog && prog.employees_reached) || cohortData.registered || 0;
    var sessions = (prog && prog.sessions_delivered) || 1;

    document.getElementById('progress-reached').textContent = reached;
    document.getElementById('progress-total').textContent = totalEmp.toLocaleString();
    document.getElementById('progress-sessions').textContent = sessions;

    var percentage = Math.round((reached / totalEmp) * 100);
    document.getElementById('progress-pct').textContent = percentage + '%';

    // Animate bar fill
    var fill = document.getElementById('progress-fill');
    fill.style.width = '0%';
    requestAnimationFrame(function () {
      setTimeout(function () {
        fill.style.width = percentage + '%';
      }, 100);
    });
  }

  /* ============================================================
     Render All
     ============================================================ */

  function renderAll() {
    destroyAllCharts();
    renderHero();
    renderExpectations();
    renderSpectrum();
    renderBlockers();
    renderShifts();
    renderWordCloudUse();
    renderWordCloudBlockers();
    renderAtomicActions();
    renderSelfReflection();
    renderSatisfaction();
    renderFeedback();
    renderChatHighlights();
    renderProgress();
  }

  /* ============================================================
     Init
     ============================================================ */

  async function init() {
    initHeader();
    await loadConfig();

    // Load first cohort
    var firstCohort = (config.cohorts && config.cohorts[0]) || 't1-c1';
    await loadCohort(firstCohort);
    renderAll();

    // Init scroll animations after render
    initScrollReveal();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

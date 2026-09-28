/**
 * ============================================================================
 * RAHMA M. ABDELFATTAH — AI/ML ENGINEER PORTFOLIO
 * Vanilla JavaScript Implementation
 * 
 * Features:
 * - Theme management (Dark/Light mode with local persistence & system sync)
 * - Mobile navigation menu with keyboard accessibility
 * - Header elevation on scroll & Active navigation links via IntersectionObserver
 * - Interactive Neural Network Canvas in Hero (battery-aware, reduced-motion safe)
 * - Skills & Projects category filtering
 * - Detailed Project Modal with structured specifications and verified links
 * - Copy email to clipboard utility & Toast notifications
 * - Smooth scroll & Back to top
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. THEME MANAGEMENT (DARK / LIGHT)
  // --------------------------------------------------------------------------
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const storedTheme = localStorage.getItem('theme');

  // Determine initial theme: stored -> default dark
  const initialTheme = storedTheme || (prefersDarkScheme.matches ? 'dark' : 'dark');
  document.body.setAttribute('data-theme', initialTheme);

  function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const isDark = theme === 'dark';
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
      themeToggle.setAttribute('title', `Switch to ${isDark ? 'light' : 'dark'} theme`);
    }
    // Update canvas color palette if canvas is running
    if (window.updateNeuralCanvasColors) {
      window.updateNeuralCanvasColors();
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.body.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      showToast(`Switched to ${newTheme} theme`);
    });
  }

  // --------------------------------------------------------------------------
  // 2. STICKY HEADER & SCROLL SPY
  // --------------------------------------------------------------------------
  const siteHeader = document.getElementById('site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function handleHeaderScroll() {
    if (window.scrollY > 40) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // ScrollSpy with IntersectionObserver
  const navObserverOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
          } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
          }
        });
      }
    });
  }, navObserverOptions);

  sections.forEach((section) => navObserver.observe(section));

  // --------------------------------------------------------------------------
  // 3. MOBILE NAVIGATION MENU
  // --------------------------------------------------------------------------
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  function openMobileMenu() {
    mobileToggle.setAttribute('aria-expanded', 'true');
    navMenu.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close when clicking any nav link
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          closeMobileMenu();
        }
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (mobileToggle.getAttribute('aria-expanded') === 'true') {
        if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
          closeMobileMenu();
        }
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileToggle.getAttribute('aria-expanded') === 'true') {
        closeMobileMenu();
        mobileToggle.focus();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 4. INTERACTIVE NEURAL NETWORK CANVAS (HERO)
  // --------------------------------------------------------------------------
  const canvas = document.getElementById('neural-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let animationFrameId = null;
    let isCanvasVisible = true;
    let particles = [];
    const mouse = { x: null, y: null, radius: 140 };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function resizeCanvas() {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
      initParticles();
    }

    function getThemeColors() {
      const isDark = document.body.getAttribute('data-theme') === 'dark';
      return {
        nodeColor: isDark ? 'rgba(99, 102, 241, 0.7)' : 'rgba(79, 70, 229, 0.55)',
        cyanColor: isDark ? 'rgba(6, 182, 212, 0.8)' : 'rgba(2, 132, 199, 0.65)',
        lineBase: isDark ? 'rgba(99, 102, 241,' : 'rgba(79, 70, 229,'
      };
    }

    let colors = getThemeColors();
    window.updateNeuralCanvasColors = () => {
      colors = getThemeColors();
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseRadius = Math.random() * 2 + 1.2;
        this.radius = this.baseRadius;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.isCyan = Math.random() > 0.65;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce from walls
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

        // Mouse subtle interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= (dx / distance) * force * 1.5;
            this.y -= (dy / distance) * force * 1.5;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.isCyan ? colors.cyanColor : colors.nodeColor;
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 14000), 75);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    function connectParticles() {
      const maxDistance = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.25;
            ctx.strokeStyle = `${colors.lineBase}${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }

        // Connect with mouse position
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - particles[i].x;
          const dy = mouse.y - particles[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.4;
            ctx.strokeStyle = `${colors.lineBase}${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      if (!isCanvasVisible || prefersReducedMotion.matches) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      connectParticles();

      animationFrameId = requestAnimationFrame(animate);
    }

    // Window & Mouse Events
    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();

    window.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    // Observer to pause canvas when off-screen to save battery
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isCanvasVisible = entry.isIntersecting;
          if (isCanvasVisible && !prefersReducedMotion.matches) {
            if (!animationFrameId) animate();
          } else {
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
              animationFrameId = null;
            }
          }
        });
      }, { threshold: 0.1 });
      heroObserver.observe(heroSection);
    }

    if (!prefersReducedMotion.matches) {
      animate();
    }
  }

  // --------------------------------------------------------------------------
  // 5. SKILLS CATEGORY FILTERING
  // --------------------------------------------------------------------------
  const skillFilters = document.querySelectorAll('.filter-btn');
  const skillCards = document.querySelectorAll('.skill-category-card');

  if (skillFilters.length > 0 && skillCards.length > 0) {
    skillFilters.forEach((button) => {
      button.addEventListener('click', () => {
        skillFilters.forEach((btn) => {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
        });
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');

        const filter = button.getAttribute('data-filter');

        skillCards.forEach((card) => {
          const cardCategory = card.getAttribute('data-category');
          if (filter === 'all' || cardCategory === filter) {
            card.style.display = 'flex';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 10);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 200);
          }
        });
      });
    });
  }

  // --------------------------------------------------------------------------
  // 6. PROJECTS CATEGORY FILTERING
  // --------------------------------------------------------------------------
  const projectFilters = document.querySelectorAll('.proj-filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (projectFilters.length > 0 && projectCards.length > 0) {
    projectFilters.forEach((button) => {
      button.addEventListener('click', () => {
        projectFilters.forEach((btn) => {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
        });
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');

        const category = button.getAttribute('data-category');

        projectCards.forEach((card) => {
          const cardCat = card.getAttribute('data-category');
          if (category === 'all' || cardCat === category) {
            card.style.display = 'flex';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 10);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 200);
          }
        });
      });
    });
  }

  // --------------------------------------------------------------------------
  // 7. PROJECT DETAILS MODAL
  // --------------------------------------------------------------------------
  const projectModal = document.getElementById('project-modal');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalClose = document.getElementById('modal-close');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCategory = document.getElementById('modal-category');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  // Verified Structured Data for All 7 Projects with Verified URLs
  const projectsData = {
    'edugenie': {
      title: 'EDUGENIE: AI-Powered Adaptive Learning Platform (Graduation Project)',
      category: 'Generative AI | EdTech | Graduation Project',
      description: 'EduGenie is an AI-powered adaptive learning platform designed to personalize education through intelligent content generation, interactive quizzes, and tailored learning materials. The system combines fine-tuned Large Language Models, Retrieval-Augmented Generation, and adaptive learning techniques informed by the VARK model to create personalized learning experiences.',
      features: [
        'Fine-tuned the Qwen2-7B language model using LoRA for educational domain adaptation',
        'Developed an educational content generation pipeline tailored to student comprehension levels',
        'Built scalable backend services using FastAPI and containerized with Docker',
        'Integrated Wav2Lip for AI-powered video generation and synchronized lip speech',
        'Incorporated multilingual Text-to-Speech (TTS) capabilities for interactive tutoring',
        'Designed personalized learning recommendations using the VARK multi-modal learning model'
      ],
      technologies: ['Python', 'PyTorch', 'Hugging Face', 'Qwen2-7B', 'LoRA', 'LangChain', 'FastAPI', 'Docker', 'Wav2Lip', 'React', 'Laravel'],
      coverImage: 'images/projects/edugenie.png',
      repoUrl: 'https://github.com/rahmamo1/EDUGENIE',
      repoLabel: 'View on GitHub',
      role: 'Lead AI Engineer — LLM Fine-Tuning & Pipeline Architecture'
    },
    'brain-tumor': {
      title: 'Brain Tumor Classification & Segmentation',
      category: 'Computer Vision | Deep Learning | Medical AI',
      description: 'A medical imaging application that combines deep learning-based brain tumor classification with MRI image segmentation to support automated image analysis and visual interpretation.',
      features: [
        'Automated brain tumor classification using deep convolutional neural networks',
        'MRI image segmentation and tumor-region visualization with bounding mask overlays',
        'Image preprocessing, normalization, and data augmentation pipelines',
        'Real-time inference interface enabling clinicians to inspect scans with instant visual feedback',
        'Seamless integration with TensorFlow, OpenCV, and NumPy under a Streamlit dashboard'
      ],
      technologies: ['Python', 'TensorFlow', 'OpenCV', 'NumPy', 'Streamlit'],
      coverImage: 'images/projects/brain-tumor.png',
      repoUrl: 'https://github.com/rahmamo1/Brain-Tumor-Classification-Segmentation',
      repoLabel: 'View on GitHub',
      role: 'Computer Vision Developer — Model Training & Segmentation Pipeline'
    },
    'pdf-rag': {
      title: 'PDF Q&A System (RAG-based)',
      category: 'Generative AI | NLP | RAG',
      description: 'An intelligent document question-answering application that retrieves relevant information from uploaded PDF files and generates context-aware answers using semantic search and Transformer-based language models.',
      features: [
        'Robust PDF parsing, document preprocessing, and sliding-window text chunking',
        'Semantic embeddings generation using pre-trained sentence transformer checkpoints',
        'FAISS-powered vector search for ultra-fast cosine similarity retrieval',
        'Context-aware question-answering pipeline connecting retrieved context with LLM generation',
        'Integration with LangChain framework and Hugging Face Transformers',
        'Interactive, user-friendly Streamlit interface for live document uploads and chat history'
      ],
      technologies: ['Python', 'LangChain', 'Hugging Face Transformers', 'FAISS', 'Streamlit'],
      coverImage: 'images/projects/pdf-chatbot.png',
      repoUrl: 'https://github.com/rahmamo1/PDF-QA-System-RAG-based',
      repoLabel: 'View on GitHub',
      role: 'AI Engineer — End-to-End RAG Architecture & Streamlit Deployment'
    },
    'credit-risk': {
      title: 'Credit Risk Assessment: Classical ML vs Neural Networks',
      category: 'Machine Learning | Deep Learning | Financial AI',
      description: 'A comparative financial machine learning study benchmarking classical algorithms (Logistic Regression, Random Forest, XGBoost) against Deep Neural Networks for credit risk assessment and default probability prediction.',
      features: [
        'Preprocessed and handled class-imbalanced credit datasets using SMOTE and feature scaling',
        'Trained and evaluated Logistic Regression, Random Forest, and XGBoost classifiers',
        'Implemented Deep Neural Network (DNN) architectures with dropout and batch normalization',
        'Evaluated models using ROC-AUC, Precision-Recall curves, and Cost-Sensitive metrics',
        'Benchmarked classical ML interpretability against neural network predictive capacity'
      ],
      technologies: ['Python', 'Scikit-learn', 'TensorFlow', 'XGBoost', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn'],
      repoUrl: 'https://github.com/rahmamo1/Credit-Risk-Assessment',
      repoLabel: 'View on GitHub',
      role: 'ML Engineer — Data Preprocessing, Imbalance Handling & Comparative Modeling'
    },
    'alphabet-classification': {
      title: 'Handwritten Alphabet Recognition – Architecture Comparison',
      category: 'Computer Vision | Deep Learning | Character Recognition',
      description: 'A comparative computer vision project evaluating custom CNN and deep learning architectures for handwritten English character recognition, analyzing accuracy, loss curves, and computational efficiency.',
      features: [
        'Preprocessed grayscale handwritten character image datasets with custom data augmentation',
        'Built and trained multiple CNN architectures with varying convolutional depth and regularization',
        'Benchmarked accuracy, validation loss convergence, and inference latency across models',
        'Visualized confusion matrices and misclassification patterns for character pairs',
        'Analyzed feature maps and layer activations across the network pipeline'
      ],
      technologies: ['Python', 'TensorFlow', 'Keras', 'OpenCV', 'CNNs', 'NumPy', 'Matplotlib'],
      coverImage: 'images/projects/alphabet-recognition.png',
      repoUrl: 'https://github.com/rahmamo1/Alphabet-Classification',
      repoLabel: 'View on GitHub',
      role: 'Computer Vision Developer — CNN Architecture Design & Latency Benchmarking'
    },
    'sentiment-nlp': {
      title: 'Sentiment Analysis (LSTM & BERT)',
      category: 'NLP | Deep Learning | Text Classification',
      description: 'A comparative sentiment analysis project evaluating LSTM and BERT architectures for text classification, with a focus on predictive performance, computational efficiency, and inference quality.',
      features: [
        'Implemented and fine-tuned both Recurrent LSTM and Transformer-based BERT classifiers',
        'Rigorously evaluated models across Accuracy, Precision, Recall, and F1-score metrics',
        'Conducted benchmark analysis comparing predictive accuracy against computational latency',
        'Deployed the optimized LSTM model using Streamlit for low-resource production testing',
        'Enabled real-time, interactive sentiment prediction on raw user-input text'
      ],
      technologies: ['Python', 'TensorFlow', 'Keras', 'Hugging Face BERT', 'Streamlit', 'Pandas'],
      coverImage: 'images/projects/sentiment-analysis.png',
      repoUrl: 'https://github.com/rahmamo1/Sentiment-Analysis',
      repoLabel: 'View on GitHub',
      role: 'NLP Engineer — Comparative Architecture Research & Model Deployment'
    },
    'airbnb-price': {
      title: 'Airbnb Price Prediction & Data Analysis',
      category: 'Machine Learning | Data Science | Predictive Analytics',
      description: 'A data science project involving the analysis and enrichment of Airbnb and tourism datasets to investigate accommodation pricing factors and develop predictive models.',
      features: [
        'Data cleaning, missing-value imputation, and extensive exploratory data analysis (EDA)',
        'Web scraping to augment raw listings with real-time geospatial and tourism metrics',
        'Feature engineering targeting spatial proximity, amenities, and host status',
        'Built and tuned Random Forest and XGBoost regression models',
        'Designed a structured, normalized database schema for reliable query execution',
        'Achieved a strong predictive baseline with an R² score of 80.67%'
      ],
      technologies: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'Matplotlib', 'Seaborn', 'Web Scraping'],
      repoUrl: 'https://www.kaggle.com/code/rahmamabdelfattah/airbnb-full-data-cleaning-with-web-scraping',
      repoLabel: 'View on Kaggle',
      role: 'Data Scientist & ML Engineer — EDA, Scraping, Feature Engineering & Regression'
    }
  };
  projectsData['alphabet-recognition'] = projectsData['alphabet-classification'];

  function openProjectModal(projectId) {
    const data = projectsData[projectId];
    if (!data) return;

    modalCategory.textContent = data.category;
    modalTitle.textContent = data.title;

    let html = `
      ${data.coverImage ? `
        <div class="modal-cover-wrap">
          <img src="${data.coverImage}" alt="${data.title}" class="modal-cover-img" loading="eager">
        </div>
      ` : ''}
      <p class="modal-description">${data.description}</p>
      
      <h4 class="modal-section-title">Key Architectural Features:</h4>
      <ul class="resp-list">
        ${data.features.map(f => `<li>${f}</li>`).join('')}
      </ul>

      <h4 class="modal-section-title">Technologies Applied:</h4>
      <div class="modal-tech-list">
        ${data.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('')}
      </div>

      <div class="modal-repo-action" style="margin-top: 1.25rem;">
        <a href="${data.repoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
          <span>${data.repoLabel}</span>
          <svg viewBox="0 0 20 20" fill="currentColor" style="width:14px;height:14px;margin-left:4px;" aria-hidden="true">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
          </svg>
        </a>
      </div>
    `;

    modalBody.innerHTML = html;
    projectModal.removeAttribute('hidden');
    // Trigger transition
    setTimeout(() => {
      projectModal.classList.add('is-active');
      modalClose.focus();
    }, 10);
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    projectModal.classList.remove('is-active');
    setTimeout(() => {
      projectModal.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }, 300);
  }

  // Attach modal trigger to buttons
  const detailButtons = document.querySelectorAll('.btn-details');
  detailButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.project-card');
      const projectId = btn.getAttribute('data-modal') || (card ? card.getAttribute('data-project-id') : null);
      if (projectId) {
        openProjectModal(projectId);
      }
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeProjectModal);
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeProjectModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal.classList.contains('is-active')) {
      closeProjectModal();
    }
  });

  // --------------------------------------------------------------------------
  // 8. COPY EMAIL TO CLIPBOARD
  // --------------------------------------------------------------------------
  const copyEmailBtn = document.getElementById('btn-copy-email');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      const email = 'rahmaamohamedd100@gmail.com';
      copyToClipboard(email, 'Email address copied to clipboard (rahmaamohamedd100@gmail.com)');
    });
  }

  function copyToClipboard(text, successMessage) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMessage);
      }).catch(() => {
        fallbackCopy(text, successMessage);
      });
    } else {
      fallbackCopy(text, successMessage);
    }
  }

  function fallbackCopy(text, successMessage) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(successMessage);
    } catch (err) {
      showToast('Could not copy automatically. Please copy manually.');
    }
    document.body.removeChild(textArea);
  }

  // --------------------------------------------------------------------------
  // 9. TOAST NOTIFICATION COMPONENT
  // --------------------------------------------------------------------------
  function showToast(message, duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg viewBox="0 0 20 20" fill="currentColor" style="width:16px;height:16px;color:var(--accent-cyan);flex-shrink:0;">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);

    // Animate out & remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 400);
    }, duration);
  }

  // --------------------------------------------------------------------------
  // 10. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
  // --------------------------------------------------------------------------
  const revealElements = document.querySelectorAll(
    '.project-card, .timeline-card, .skill-category-card, .service-card, .about-portrait-card, .objective-banner, .email-me-card'
  );

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    });

    revealElements.forEach((el) => {
      el.classList.add('reveal-on-scroll');
      revealObserver.observe(el);
    });
  } else {
    // Fallback: immediately show all
    revealElements.forEach((el) => el.classList.add('is-revealed'));
  }

  // --------------------------------------------------------------------------
  // 11. BACK TO TOP SMOOTH SCROLL
  // --------------------------------------------------------------------------
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});

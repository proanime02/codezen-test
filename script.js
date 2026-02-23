/**
 * CodeZen — script.js
 * Agence Web Sénégal | JavaScript Vanilla
 * 
 * Fonctionnalités :
 * - Header glassmorphisme au scroll
 * - Menu mobile responsive
 * - Navigation smooth avec fermeture auto
 * - Animations au défilement (Intersection Observer)
 * - Validation de formulaire côté client
 * - Bouton scroll-to-top
 * - Année footer dynamique
 * 
 * NOTE SÉCURITÉ : Ce script ne collecte, ne stocke
 * ni ne transmet aucune donnée des visiteurs.
 * Le formulaire est géré par Netlify Forms (côté serveur externe).
 */

'use strict';

/* ========================
   INITIALISATION
   ======================== */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initScrollAnimations();
  initFormValidation();
  initScrollTopButton();
  initYear();
});

/* ========================
   HEADER — Glassmorphisme
   ======================== */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const onScroll = () => {
    // Active le backdrop-blur après 50px de scroll
    header.classList.toggle('scrolled', window.scrollY > 50);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // État initial
}

/* ========================
   MENU MOBILE
   ======================== */
function initMobileMenu() {
  const toggle  = document.getElementById('menuToggle');
  const menu    = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-menu .btn');

  if (!toggle || !menu) return;

  const openMenu = () => {
    menu.hidden = false;
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fermer le menu');
    // Empêche le scroll du body
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    menu.hidden = true;
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Ouvrir le menu');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    const isOpen = !menu.hidden;
    isOpen ? closeMenu() : openMenu();
  });

  // Ferme le menu au clic sur un lien
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Ferme avec la touche Échap
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !menu.hidden) closeMenu();
  });

  // Ferme si on clique en dehors (sur overlay éventuel)
  document.addEventListener('click', e => {
    if (!menu.hidden && !menu.contains(e.target) && !toggle.contains(e.target)) {
      closeMenu();
    }
  });
}

/* ========================
   ANIMATIONS SCROLL
   Intersection Observer API
   ======================== */
function initScrollAnimations() {
  // Ajoute la classe 'reveal' aux éléments à animer
  const targets = document.querySelectorAll([
    '.arg-card',
    '.service-card',
    '.section-header',
    '.contact-info',
    '.contact-form',
    '.hero-visual'
  ].join(','));

  // Ajoute des délais progressifs pour les grilles
  document.querySelectorAll('.arguments-grid .arg-card').forEach((el, i) => {
    el.classList.add('reveal', `reveal-delay-${i + 1}`);
  });
  document.querySelectorAll('.services-grid .service-card').forEach((el, i) => {
    el.classList.add('reveal', `reveal-delay-${i + 1}`);
  });
  document.querySelectorAll('.section-header, .contact-info, .contact-form, .hero-visual').forEach(el => {
    el.classList.add('reveal');
  });

  // Configuration Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Anime une seule fois
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  // Observe tous les éléments avec la classe 'reveal'
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ========================
   VALIDATION FORMULAIRE
   Aucune donnée locale stockée
   ======================== */
function initFormValidation() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const submitBtn = form.querySelector('.btn-submit');
  const successMsg = document.getElementById('formSuccess');

  // Règles de validation
  const rules = {
    name: {
      el: document.getElementById('name'),
      errorEl: document.getElementById('nameError'),
      validate: val => val.trim().length >= 2,
      message: 'Veuillez entrer votre nom complet (min. 2 caractères).'
    },
    email: {
      el: document.getElementById('email'),
      errorEl: document.getElementById('emailError'),
      validate: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
      message: 'Veuillez entrer une adresse email valide.'
    },
    message: {
      el: document.getElementById('message'),
      errorEl: document.getElementById('messageError'),
      validate: val => val.trim().length >= 10,
      message: 'Veuillez décrire votre projet (min. 10 caractères).'
    }
  };

  // Validation temps réel (blur)
  Object.values(rules).forEach(({ el, errorEl, validate, message }) => {
    if (!el) return;
    el.addEventListener('blur', () => {
      const valid = validate(el.value);
      el.classList.toggle('error', !valid);
      errorEl.textContent = valid ? '' : message;
    });
    // Efface l'erreur à la saisie
    el.addEventListener('input', () => {
      if (el.classList.contains('error')) {
        el.classList.remove('error');
        errorEl.textContent = '';
      }
    });
  });

  // Soumission formulaire
  form.addEventListener('submit', e => {
    let isValid = true;

    // Valide tous les champs requis
    Object.values(rules).forEach(({ el, errorEl, validate, message }) => {
      if (!el) return;
      const valid = validate(el.value);
      el.classList.toggle('error', !valid);
      errorEl.textContent = valid ? '' : message;
      if (!valid) isValid = false;
    });

    if (!isValid) {
      e.preventDefault();
      // Focus sur le premier champ en erreur
      const firstError = form.querySelector('.form-input.error');
      if (firstError) firstError.focus();
      return;
    }

    // Animation de chargement
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    /**
     * NOTE : Le formulaire soumet normalement vers Netlify Forms.
     * En mode dev (sans Netlify), on simule une soumission réussie.
     * En production, retirer le bloc ci-dessous et laisser le submit natif.
     */
    const isNetlify = window.location.hostname !== 'localhost' &&
                      window.location.hostname !== '127.0.0.1' &&
                      !window.location.hostname.includes('.local');

    if (!isNetlify) {
      // Simulation locale uniquement
      e.preventDefault();
      setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        form.reset();
        if (successMsg) successMsg.hidden = false;
        // Cache le message après 6 secondes
        setTimeout(() => { if (successMsg) successMsg.hidden = true; }, 6000);
      }, 1500);
    }
    // En production (Netlify), le formulaire soumet normalement
  });
}

/* ========================
   BOUTON SCROLL TO TOP
   ======================== */
function initScrollTopButton() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  const onScroll = () => {
    btn.hidden = window.scrollY < 400;
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ========================
   ANNÉE FOOTER DYNAMIQUE
   ======================== */
function initYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
    document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const faqItem = button.parentElement;
    // Fermer les autres questions (optionnel, pour un effet accordéon propre)
    document.querySelectorAll('.faq-item').forEach(item => {
        if(item !== faqItem) item.classList.remove('active');
    });
    faqItem.classList.toggle('active');
  });
});
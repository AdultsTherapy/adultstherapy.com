/**
 * Navigation enhancements for Adults and Couples Therapy of Oregon
 * Using functional programming principles
 */

// Wait for DOM to be ready, then run the main function
document.addEventListener('DOMContentLoaded', () => {
  // Compose our functions together
  const run = pipe(
    highlightNavigation,
    setupAccessibility,
    addFloatingContactButton
  );
  
  // Execute our composed function
  run(document);
});

/**
 * Function composition utility
 * Runs an array of functions from left to right, passing the result of each to the next
 */
const pipe = (...fns) => initialValue => 
  fns.reduce((value, fn) => fn(value), initialValue);

/**
 * Core navigation highlighting function
 * @param {Document} doc - The document object 
 * @returns {Document} - The document for chaining
 */
const highlightNavigation = (doc) => {
  let pathForMatching = window.location.pathname;

  if (window.location.protocol === 'file:') {
    const projectRootMarker = '/preview.adultstherapy.com/';
    const markerIndex = pathForMatching.indexOf(projectRootMarker);
    if (markerIndex !== -1) {
      pathForMatching = pathForMatching.substring(markerIndex + projectRootMarker.length -1);
    }
  }

  let normalizedPath = pathForMatching;
  if (normalizedPath.endsWith('/index.html')) {
    normalizedPath = normalizedPath.substring(0, normalizedPath.length - 'index.html'.length);
  } else if (normalizedPath.endsWith('index.html')) {
     normalizedPath = normalizedPath.substring(0, normalizedPath.length - 'index.html'.length);
  }

  if (!normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath;
  }

  if (normalizedPath !== '/' && !normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath + '/';
  }
  
  if (normalizedPath === '//') {
      normalizedPath = '/';
  }

  const currentPath = normalizedPath;

  // Map paths to section names
  const pathMap = {
    '/': 'Home',
    '/skills/': 'Skills',
    '/education/': 'Education',
    '/about/': 'About',
    '/therapy/': 'Therapy'
  };
  
  // Get all navigation links
  const navLinks = Array.from(doc.querySelectorAll('.wp-block-navigation a'));
  
  const getActiveSectionKey = (path) => {
    const sortedKeys = Object.keys(pathMap).sort((a, b) => b.length - a.length);
    return sortedKeys.find(key => path.startsWith(key));
  };
  
  const activeSectionKey = getActiveSectionKey(currentPath);
  const activeSectionName = activeSectionKey ? pathMap[activeSectionKey] : null;

  const isTherapySubpage = currentPath.startsWith('/therapy/') && currentPath !== '/therapy/';
  
  const getTherapyType = (path) => {
    if (!path.startsWith('/therapy/')) return null;
    const therapyPathSegment = path.substring('/therapy/'.length);
    if (!therapyPathSegment) return null;
    
    const type = therapyPathSegment.split('/')[0];
    return type && type.length > 0 ? type : null;
  };
  
  const therapyType = getTherapyType(currentPath);
  
  // Map of therapy types to display names
  const therapyNames = {
    'cbt': 'Cognitive Behavioral Therapy',
    'dbt': 'Dialectical Behavior Therapy',
    'gottman': 'Gottman\'s Couple Therapy',
    'military': 'Military',
    'mindfulness': 'Mindfulness',
    'talk-therapy': 'Talk Therapy'
  };
  
  // Apply styles to each nav link based on conditions
  navLinks.forEach(link => {
    link.classList.remove('nav-active', 'nav-active-border', 'education-active');
    link.style.removeProperty('color');
    link.style.removeProperty('font-weight');
    link.style.removeProperty('border-bottom');
    link.style.removeProperty('padding-bottom');
    
    const linkText = link.textContent.trim();
    const isInSubmenu = !!link.closest('.wp-block-navigation__submenu-container');
    
    let linkHref = link.getAttribute('href');
    let normalizedLinkHref = null;
    if (linkHref) {
        try {
            const url = new URL(linkHref, window.location.origin + (window.location.pathname.startsWith('/') ? '' : '/') + window.location.pathname);
            normalizedLinkHref = url.pathname;

            if (window.location.protocol === 'file:') {
                const projectRootMarker = '/preview.adultstherapy.com/';
                const markerIndex = normalizedLinkHref.indexOf(projectRootMarker);
                if (markerIndex !== -1) {
                    normalizedLinkHref = normalizedLinkHref.substring(markerIndex + projectRootMarker.length -1);
                }
            }
            
            if (normalizedLinkHref.endsWith('/index.html')) {
                normalizedLinkHref = normalizedLinkHref.substring(0, normalizedLinkHref.length - 'index.html'.length);
            }
            if (!normalizedLinkHref.startsWith('/')) {
                normalizedLinkHref = '/' + normalizedLinkHref;
            }
            if (normalizedLinkHref !== '/' && !normalizedLinkHref.endsWith('/')) {
                normalizedLinkHref += '/';
            }
            if (normalizedLinkHref === '//') {
                normalizedLinkHref = '/';
            }
        } catch (e) {
            console.warn('[highlightNavigation] Could not parse href:', linkHref, e);
            normalizedLinkHref = linkHref;
        }
    }

    let appliedByLogic = false;
    if (activeSectionName && activeSectionName === linkText && !isInSubmenu) {
      markActive(link, true);
      console.log('[highlightNavigation] Active main section by name:', linkText, '; Matched key:', activeSectionKey, '; Current path:', currentPath);
      appliedByLogic = true;
    }
    
    if (isTherapySubpage && linkText === 'Therapy' && !isInSubmenu) {
      if (!link.classList.contains('nav-active')) {
          markActive(link, true);
          console.log('[highlightNavigation] Therapy parent active for subpage:', currentPath);
          appliedByLogic = true;
      }
    }
    
    if (therapyType && therapyNames[therapyType] === linkText && isInSubmenu) {
      markActive(link, false);
      console.log('[highlightNavigation] Active therapy submenu item:', linkText, '; Type:', therapyType);
      appliedByLogic = true;
    }

    if (normalizedLinkHref && normalizedLinkHref === currentPath) {
        if (!link.classList.contains('nav-active')) {
            markActive(link, !isInSubmenu);
            console.log('[highlightNavigation] Exact URL match (fallback):', linkText, '; Link Href:', normalizedLinkHref, '; Current Path:', currentPath);
            appliedByLogic = true;
        }
    }
  });
  
  console.log('Final - Current path (processed by highlightNavigation):', currentPath);
  console.log('Final - Active section key:', activeSectionKey);
  console.log('Final - Active section name:', activeSectionName);
  console.log('Final - Is Therapy Subpage:', isTherapySubpage);
  console.log('Final - Therapy type:', therapyType);
  
  return doc;
};

/**
 * Helper function to mark a link as active
 * @param {Element} link - The <a> link element to mark as active
 */
const markActive = (link) => {
  link.classList.add('nav-active');
  // Determine if this link is within a submenu
  const isSubmenuItem = !!link.closest('.wp-block-navigation__submenu-container');
  // Choose color: purple for submenu items, white for top-level
  const activeColor = isSubmenuItem ? '#7e679b' : '#ffffff';
  
  // Apply inline styles
  link.style.setProperty('color', activeColor, 'important');
  link.style.setProperty('font-weight', 'bold', 'important');

  // Also update inner span if present
  const span = link.querySelector('span.wp-block-navigation-item__label');
  if (span) {
    span.style.setProperty('color', activeColor, 'important');
    span.style.setProperty('font-weight', 'bold', 'important');
  }
};

/**
 * Set up accessibility and mobile navigation features
 * @param {Document} doc - The document object
 * @returns {Document} - The document for chaining
 */
const setupAccessibility = (doc) => {
  // Mobile menu toggle behavior
  const submenuToggles = Array.from(doc.querySelectorAll('.wp-block-navigation-submenu__toggle'));
  
  submenuToggles.forEach(toggle => {
    toggle.addEventListener('click', event => {
      const submenu = toggle.closest('.wp-block-navigation-submenu');
      if (submenu) {
        submenu.classList.toggle('is-open');
      }
    });
  });
  
  // Keyboard accessibility
  const navItems = Array.from(doc.querySelectorAll('.wp-block-navigation-item'));
  
  navItems.forEach(item => {
    // Handle keyboard navigation
    item.addEventListener('keydown', event => {
      const hasSubmenu = item.classList.contains('has-child');
      
      // Open submenu on enter or space
      if ((event.key === 'Enter' || event.key === ' ') && hasSubmenu) {
        event.preventDefault();
        item.classList.add('is-open');
        
        // Focus first submenu link
        const firstLink = item.querySelector('.wp-block-navigation__submenu-container a');
        if (firstLink) firstLink.focus();
      }
      
      // Close on escape
      if (event.key === 'Escape' && item.classList.contains('is-open')) {
        event.preventDefault();
        item.classList.remove('is-open');
        
        // Focus parent link
        const parentLink = item.querySelector(':scope > a');
        if (parentLink) parentLink.focus();
      }
    });
    
    // Handle focus out
    item.addEventListener('focusout', event => {
      if (!item.contains(event.relatedTarget)) {
        // Check if focus truly left
        setTimeout(() => {
          if (!item.contains(doc.activeElement)) {
            item.classList.remove('is-open');
          }
        }, 10);
      }
    });
  });
  
  return doc;
};

/**
 * Direct method to apply highlighting to the current page link (Extreme Fallback)
 */
const applyDirectHighlighting = (doc) => {
  const allNavLinks = Array.from(doc.querySelectorAll('.wp-block-navigation a'));
  const currentPagePath = window.location.pathname.toLowerCase();
  const breadcrumbCurrent = doc.querySelector('.breadcrumbs-item.current-item')?.textContent.trim().toLowerCase();

  let isLikelyCurrentPage = (link) => {
    const href = (link.getAttribute('href') || '').toLowerCase();
    const linkText = link.textContent.trim().toLowerCase();

    // Match /education/ or /education/index.html
    if (currentPagePath.includes('/education')) {
        if (href.includes('education') || linkText === 'education') return true;
    }
    // Match /skills/ or /skills/index.html
    if (currentPagePath.includes('/skills')) {
        if (href.includes('skills') || linkText === 'skills') return true;
    }
    // Match /about/ or /about/index.html
     if (currentPagePath.includes('/about')) {
        if (href.includes('about') || linkText === 'about') return true;
    }
    // Match main therapy page /therapy/ or /therapy/index.html
    if (currentPagePath.endsWith('/therapy/') || currentPagePath.endsWith('/therapy/index.html')) {
        if ((href.endsWith('/therapy/') || href.endsWith('/therapy/index.html')) || linkText === 'therapy') return true;
    }
    // Match homepage
    if (currentPagePath === '/' || currentPagePath.endsWith('/index.html') && !currentPagePath.includes('/', 1)) {
        if (linkText === 'home') return true; // Assuming 'Home' link exists for root
        if (href === '/' || href.endsWith('/index.html')) return true;
    }
    // Breadcrumb fallback
    if (breadcrumbCurrent && linkText === breadcrumbCurrent) return true;
    
    return false;
  };

  allNavLinks.forEach(link => {
    if (isLikelyCurrentPage(link)) {
      console.log('[applyDirectHighlighting] DIRECT HIGHLIGHT: Applying to link:', link.textContent.trim(), 'href:', link.getAttribute('href'));
      
      link.style.setProperty('color', '#ffffff', 'important');
      link.style.setProperty('font-weight', 'bold', 'important');
      
      if (!link.closest('.wp-block-navigation__submenu-container')) {
        link.style.setProperty('border-bottom', '2px solid #ffffff', 'important');
        link.style.setProperty('padding-bottom', '3px', 'important');
      }

      const span = link.querySelector('span.wp-block-navigation-item__label');
      if (span) {
        console.log('[applyDirectHighlighting] Found span, applying styles:', span.textContent);
        span.style.setProperty('color', '#ffffff', 'important');
        span.style.setProperty('font-weight', 'bold', 'important');
      } else {
        console.log('[applyDirectHighlighting] No span found for link:', link.textContent.trim());
      }
      
      link.classList.add('nav-active', 'direct-highlight-applied');
      const parentLi = link.closest('.wp-block-navigation-item');
      if(parentLi) {
        parentLi.classList.add('current-menu-item');
        console.log('[applyDirectHighlighting] Added current-menu-item to parent LI for:', link.textContent.trim());
      }
    }
  });
  
  return doc;
};

/**
 * Adds a floating contact button for accessibility
 * @param {Document} doc - The document object
 * @returns {Document} - The document for chaining
 */
const addFloatingContactButton = (doc) => {
  // Check if floating button already exists
  if (doc.querySelector('.floating-contact-button')) {
    return doc;
  }

  // Create floating contact button
  const floatingButton = doc.createElement('a');
  floatingButton.href = 'tel:+15413638817';
  floatingButton.className = 'floating-contact-button';
  floatingButton.innerHTML = '📞';
  floatingButton.setAttribute('aria-label', 'Call for immediate assistance');
  floatingButton.setAttribute('title', 'Call 541-363-8817');

  // Add to body
  doc.body.appendChild(floatingButton);

  // Add click event for analytics (if needed)
  floatingButton.addEventListener('click', () => {
    // Track contact button clicks
    if (typeof gtag !== 'undefined') {
      gtag('event', 'click', {
        'event_category': 'Contact',
        'event_label': 'Floating Contact Button'
      });
    }
  });

  return doc;
};

/**
 * Directly modifies the DOM of active links to add a visible indicator
 * This is a last-resort approach that doesn't rely on CSS
 */
const directlyModifyActiveLinkDOM = (doc) => {
  const currentPagePath = window.location.pathname.toLowerCase();
  const breadcrumbCurrent = doc.querySelector('.breadcrumbs-item.current-item')?.textContent.trim().toLowerCase();
  
  // Helper function to determine if a link matches the current page
  const isCurrentPageLink = (link) => {
    const href = (link.getAttribute('href') || '').toLowerCase();
    const linkText = link.textContent.trim().toLowerCase();
    
    // Match based on path segments
    if (currentPagePath.includes('/education') && (href.includes('education') || linkText === 'education')) {
      return true;
    }
    if (currentPagePath.includes('/skills') && (href.includes('skills') || linkText === 'skills')) {
      return true;
    }
    if (currentPagePath.includes('/about') && (href.includes('about') || linkText === 'about')) {
      return true;
    }
    if (currentPagePath.includes('/therapy') && 
        currentPagePath.indexOf('/therapy/') === -1 && 
        (href.endsWith('/therapy/') || linkText === 'therapy')) {
      return true;
    }
    
    // Use breadcrumb as fallback
    if (breadcrumbCurrent && linkText === breadcrumbCurrent) {
      return true;
    }
    
    return false;
  };
  
  // Find all navigation links
  const allNavLinks = Array.from(doc.querySelectorAll('.wp-block-navigation a'));
  
  // Process each link
  allNavLinks.forEach(link => {
    if (isCurrentPageLink(link)) {
      console.log('[directlyModifyActiveLinkDOM] Found current page link:', link.textContent.trim());
      
      // Create the indicator element
      const indicator = doc.createElement('span');
      indicator.innerHTML = '&#8226; '; // Bullet character
      indicator.style.setProperty('color', '#ffffff', 'important');
      indicator.style.setProperty('font-weight', 'bold', 'important');
      indicator.style.setProperty('font-size', '18px', 'important');
      indicator.style.setProperty('vertical-align', 'middle', 'important');
      indicator.style.setProperty('margin-right', '4px', 'important');
      indicator.style.setProperty('display', 'inline-block', 'important');
      
      // See if link contains a span for the text
      const textSpan = link.querySelector('span.wp-block-navigation-item__label');
      
      if (textSpan) {
        // If there's a span containing the text, add indicator before it
        console.log('[directlyModifyActiveLinkDOM] Adding indicator before span:', textSpan.textContent);
        textSpan.insertAdjacentElement('beforebegin', indicator);
      } else {
        // If no span, modify link's content directly
        console.log('[directlyModifyActiveLinkDOM] Adding indicator directly to link');
        // Store original text
        const originalText = link.textContent;
        // Clear current content
        link.innerHTML = '';
        // Add indicator followed by original text
        link.appendChild(indicator);
        link.appendChild(doc.createTextNode(originalText));
      }
      
      // Also add direct underline to parent element
      const parentItem = link.closest('.wp-block-navigation-item');
      if (parentItem && !link.closest('.wp-block-navigation__submenu-container')) {
        parentItem.style.setProperty('border-bottom', '2px solid #ffffff', 'important');
        parentItem.style.setProperty('padding-bottom', '2px', 'important');
      }
    }
  });
  
  return doc;
}; 
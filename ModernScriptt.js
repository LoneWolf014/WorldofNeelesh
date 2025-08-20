// flip-card mobile tap

const flipCard = document.querySelector(".flip-card");

if (flipCard) {
  flipCard.addEventListener("click", () => {
    flipCard.classList.toggle("flipped");
  });
}


// SCROLL DOWN ARROW
const scrollArrow = document.querySelector(".scroll-down");
const header = document.querySelector(".primary-header");

if (scrollArrow && header) {
  scrollArrow.addEventListener("click", () => {
    window.scrollTo({
      top: header.offsetTop,
      behavior: "smooth"
    });
  });
}


// +-------------------+
// | MOBILE NAV TOGGLE |
// +-------------------+

const primaryNav = document.querySelector(".primary-navigation");
const navToggle = document.querySelector(".mobile-nav-toggle");

navToggle.addEventListener("click", () => {
  const nav_Visibility = primaryNav.getAttribute("data-visible");

  if (nav_Visibility === "false") {
    primaryNav.setAttribute("data-visible", true);
    navToggle.setAttribute("aria-expanded", true);
  } else {
    primaryNav.setAttribute("data-visible", false);
    navToggle.setAttribute("aria-expanded", false);
  }
});



// +------------------------+
// | ACTIVE NAVIGATION LINK |
// +------------------------+

const navLinks = document.querySelectorAll('.primary-navigation li');
const sections = document.querySelectorAll('section[id], footer[id]');

// Flag to prevent scroll listener from overriding manual clicks
let isScrollingToSection = false;

// Remove active class from all nav items
function removeActiveFromAll() {
    navLinks.forEach(link => link.classList.remove('active'));
}

// Helper function to close the mobile navigation
function closeMobileNav() {
  const nav_Visibility = primaryNav.getAttribute("data-visible");
  if (nav_Visibility === "true") {
    primaryNav.setAttribute("data-visible", false);
    navToggle.setAttribute("aria-expanded", false);
  }
}

// Add click handlers to navigation links
navLinks.forEach(link => {
    const anchor = link.querySelector('a');
    if (anchor) {
        anchor.addEventListener('click', (e) => {
            // Set flag to prevent scroll listener interference
            isScrollingToSection = true;
            
            closeMobileNav();
            removeActiveFromAll();
            link.classList.add('active');
            
            // Clear the flag after scrolling is likely complete
            setTimeout(() => {
                isScrollingToSection = false;
            }, 1000); // Adjust timing if needed
        });
    }
});

// Auto-highlight based on scroll position
window.addEventListener('scroll', () => {
  // Don't update active states if user just clicked a nav link
  if (isScrollingToSection) {
    return;
  }
  
  let current = '';
  const navbarHeight = document.querySelector('.primary-header').offsetHeight;

  sections.forEach(section => {
    const sectionTop = section.offsetTop - navbarHeight - 50; // extra buffer
    const sectionHeight = section.offsetHeight;
    
    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
      current = section.getAttribute('id');
    }
  });

  removeActiveFromAll();
  if (current) {
    const activeLink = document.querySelector(`.primary-navigation a[href="#${current}"]`);
    if (activeLink) activeLink.parentElement.classList.add('active');
  } else {
    document.querySelector('.primary-navigation li').classList.add('active');
  }
});

// +----------------------------------------+
// | LINKING CARD TO MODAL                  |
// +----------------------------------------+

function addGlobalCardEventListener(EventType, selector, callback, parent = document) {
  parent.addEventListener(EventType, e => {
    const card = e.target.closest(selector); // FIX: scoped const
    if (card) {
      callback(card, parent);
    }
  });
}

const Project_Containers = document.querySelectorAll(".card_container");
const modal_Element = document.querySelector(".modal");
const modal_Close_Btn = document.querySelector(".modal-close");

Project_Containers.forEach(container => {
  addGlobalCardEventListener(
    "click",
    ".card",
    (card, collection) => {
      (async () => {
        const section = collection.getAttribute("data-content");
        const cardId = card.getAttribute("id");

        try {
          const projects = await getSectionData(section);

          if (!projects) {
            showNotFound(section, cardId);
          } else {
            const project = projects.find(p =>
              p.id === cardId ||
              p.id === cardId.replace(/-/g, "_") ||
              p.id.replace(/-/g, "_") === cardId.replace(/-/g, "_")
            );

            if (project) {
              fillModalFromProject(project);
            } else {
              showNotFound(section, cardId);
            }
          }
        } catch (error) {
          console.error(error);
          showNotFound(section, cardId);
        }

        const modalVisibility = modal_Element.getAttribute("data-modal-visible");
        if (modalVisibility === "false") {
          modal_Element.setAttribute("data-modal-visible", true);
          modal_Element.setAttribute("aria-hidden", false); // FIX: correct aria
        }
      })();
    },
    container
  );
});

// MODAL CLOSE BUTTON
modal_Close_Btn.addEventListener("click", () => {
  modal_Element.setAttribute("data-modal-visible", false);
  modal_Element.setAttribute("aria-hidden", true); // FIX: correct aria
});

// +-------------------------------------+
// | ADDING MODAL CONTENT FROM JSON FILE |
// +-------------------------------------+

const modalTitle    = document.querySelector(".modal-header h1");
const modalText     = document.querySelector(".modal-text");
const modalImage    = document.querySelector(".modal-image");
const modalGallery  = document.querySelector(".modal-gallery");
const modalFooter   = document.querySelector(".modal-footer");

const SectiontoFile = {
  "College Projects" : "data/College.json",
  "AI Collabs"       : "data/AI.json",
  "Unreal"           : "data/Unreal.json",
  "Pygame"           : "data/Pygame.json"
};

const datacache = {};

async function getSectionData(sectionName) {
  const file = SectiontoFile[sectionName];
  if (!file) return null;
  if (datacache[file]) return datacache[file];

  const res = await fetch(file);
  if (!res.ok) throw new Error("Failed to Load " + file);

  const data = await res.json();
  datacache[file] = data;
  return data;
}

// +------------------+
// | HELPER FUNCTIONS |
// +------------------+

function clear(el) {
  if (el) el.innerHTML = "";
}

function renderFooterLinks(links = []) {
  clear(modalFooter);
  (links || []).forEach(link => {
    if (!link || !link.url || !link.url.trim()) return;

    const a = document.createElement("a");
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = link.label || "Link";
    a.classList.add("modal-footer-link");
    modalFooter.appendChild(a);
  });
}

// Normalize gallery entries
function normalizeGallery(items = []) {
  return items.map(item => {
    if (typeof item === "string") {
      return { type: "image", src: item, poster: "", caption: "" };
    }
    return {
      type: item.type || "image",
      src: item.src,
      poster: item.poster || "",
      caption: item.caption || ""
    };
  });
}

function renderGallery(items = []) {
  clear(modalGallery);
  const normalized = normalizeGallery(items);

  normalized.forEach(item => {
    if (!item || !item.src) return;

    const thumb = document.createElement("div");
    thumb.classList.add("thumbnail");
    thumb.dataset.type = item.type || "image";
    thumb.dataset.src = item.src;

    if (item.type === "image") {
      thumb.style.backgroundImage = `url(${item.src})`;
    } else if (item.type === "video") {
      // Better: show YouTube thumbnail if possible
      if (item.src.includes("youtube") || item.src.includes("youtu.be")) {
        const ytId = extractYouTubeId(item.src);
        if (ytId) {
          thumb.style.backgroundImage = `url(https://img.youtube.com/vi/${ytId}/0.jpg)`;
        }
      }
      else{
        thumb.style.backgroundImage = `url(${item.poster})`;
      }
      thumb.classList.add("video-thumb");
    }

    modalGallery.appendChild(thumb);
  });
}

function fillModalFromProject(project) {
  const title     = project.title       || "";
  const blocks    = project.contentHTML || project.ContentHTML  || [];
  const hero      = project.heroImage   || project.HeroImage    || "";
  const gallery   = normalizeGallery(project.gallery || project.Gallery || []);
  const links     = project.links       || [];

  modalTitle.textContent = title;
  modalText.innerHTML = Array.isArray(blocks) ? blocks.join("") : String(blocks || "");

  currentProject = project;

  // Show hero image properly
  clear(modalImage);
  modalImage.style.backgroundImage = `url(${hero})`;
  // modalImage.style.backgroundSize = "contain"; // or "cover"
  // modalImage.style.backgroundPosition = "center";
  // modalImage.style.backgroundRepeat = "no-repeat";

  renderGallery(gallery);
  renderFooterLinks(links);
}

function showNotFound(sectionName, cardId) {
  modalTitle.textContent = "DATA NOT FOUND";
  clear(modalImage);
  clear(modalGallery);
  clear(modalFooter);

  modalText.innerHTML = `
  <div style="
    padding: 3rem 1rem;
    text-align: center;
    letter-spacing: 0.25em;
    opacity: 0.5;
    font-weight: 600;
    font-size: clamp(1rem, 5vw, 2.25rem);
    user-select: none;
  ">
    DATA NOT FOUND
  <div style="opacity: 0.7; letter-spacing: normal; font-size: 0.9rem; margin-top: 0.75rem;">
    Section: ${sectionName || "?"} &nbsp;|&nbsp; Card: ${cardId || "?"}
  </div>
  </div>
  `;
}

// +--------------------------------------+
// | HOOK INTO MODAL CLICKS               |
// +--------------------------------------+

modalImage.addEventListener("click", () => {
  if (currentProject && currentProject.gallery) {
    openLightbox(normalizeGallery(currentProject.gallery), 0);
  }
});

modalGallery.addEventListener("click", e => {
  const thumb = e.target.closest(".thumbnail");
  if (!thumb) return;
  const index = [...document.querySelectorAll(".modal-gallery .thumbnail")].indexOf(thumb);
  if (currentProject && currentProject.gallery) {
    openLightbox(normalizeGallery(currentProject.gallery), index);
  }
});

// +--------------------------+
// | LIGHTBOX / MEDIA GALLERY |
// +--------------------------+

const lightbox = document.querySelector(".lightbox");
const lightboxClose = lightbox.querySelector(".lightbox-close");
const lightboxPrev = lightbox.querySelector(".lightbox-prev");
const lightboxNext = lightbox.querySelector(".lightbox-next");
const lightboxMedia = lightbox.querySelector(".lightbox-media");
const lightboxCaption = lightbox.querySelector(".lightbox-caption");
const lightboxThumbnails = lightbox.querySelector(".lightbox-thumbnails");

let currentGallery = [];
let currentIndex = 0;

function extractYouTubeId(url) {
  const reg = /(?:v=|\/)([0-9A-Za-z_-]{11})/;
  const match = url.match(reg);
  return match ? match[1] : null;
}

function youtubeToEmbed(url) {
  const id = extractYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : url;
}

function renderLightboxMedia(index) {
  if (!currentGallery[index]) return;

  const item = currentGallery[index];
  currentIndex = index;
  lightboxMedia.innerHTML = ""; // clear old

  const figure = document.createElement("figure");

  let element;
  if (item.type === "image") {
    element = document.createElement("img");
    element.src = item.src;
    element.alt = item.caption || "";
  } else if (item.type === "video") {
    if (item.src.includes("youtube")) {
      element = document.createElement("iframe");
      element.src = youtubeToEmbed(item.src);
      element.frameBorder = "0";
      element.setAttribute("allowfullscreen", "");
    } else {
      element = document.createElement("video");
      element.src = item.src;
      element.controls = true;
    }
  }

  const caption = document.createElement("figcaption");
  caption.classList.add("lightbox-caption");
  caption.textContent = item.caption || "";

  // Build structure
  figure.appendChild(element);
  figure.appendChild(caption);
  lightboxMedia.appendChild(figure);

  [...lightboxThumbnails.querySelectorAll("img")].forEach((thumb, i) => {
    thumb.classList.toggle("active", i === index);
  });
}

function renderLightboxThumbnails() {
  lightboxThumbnails.innerHTML = "";
  currentGallery.forEach((item, i) => {
    // show both images + video thumbs
    const thumb = document.createElement("img");
    if (item.type === "image") {
      thumb.src = item.src;
    } else if (item.type === "video" && (item.src.includes("youtube") || item.src.includes("youtu.be"))) {
      const ytId = extractYouTubeId(item.src);
      thumb.src = ytId ? `https://img.youtube.com/vi/${ytId}/0.jpg` : "";
    } else {
      thumb.src = item.poster || ""; // fallback
    }
    thumb.dataset.index = i;
    thumb.addEventListener("click", () => renderLightboxMedia(i));
    lightboxThumbnails.appendChild(thumb);
  });
}

function openLightbox(gallery, startIndex = 0) {
  currentGallery = gallery;
  renderLightboxThumbnails();
  renderLightboxMedia(startIndex);
  lightbox.setAttribute("data-lightbox-visible", "true");
}

function closeLightbox() {
  
  // Stop any playing videos
  const videos = lightboxMedia.querySelectorAll("video");
  videos.forEach(video => {
    video.pause();
    video.currentTime = 0; // optional, reset to start
  });

  // Stop YouTube iframes
  const iframes = lightboxMedia.querySelectorAll("iframe");
  iframes.forEach(iframe => {
    // Reset the src to stop playback
    iframe.src = iframe.src;
  });

  lightbox.setAttribute("data-lightbox-visible", "false");
  currentGallery = [];
  currentIndex = 0;
}

lightboxPrev.addEventListener("click", () => {
  let newIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
  renderLightboxMedia(newIndex);
});
lightboxNext.addEventListener("click", () => {
  let newIndex = (currentIndex + 1) % currentGallery.length;
  renderLightboxMedia(newIndex);
});
lightboxClose.addEventListener("click", closeLightbox);
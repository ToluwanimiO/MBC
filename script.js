document.addEventListener("DOMContentLoaded", () => {
  const menuToggle =
    document.querySelector(".menu-toggle");

  const mainNav =
    document.querySelector(".main-nav");

  const siteHeader =
    document.querySelector(".site-header");

  const announcement =
    document.querySelector(".announcement");

  const announcementClose =
    document.querySelector(".announcement-close");

  const toast =
    document.querySelector("#toast");

  function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    window.setTimeout(() => {
      toast.classList.remove("show");
    }, 3600);
  }

  /* Mobile navigation */

  menuToggle?.addEventListener("click", () => {
    const open =
      menuToggle.classList.toggle("active");

    mainNav?.classList.toggle("open", open);

    menuToggle.setAttribute(
      "aria-expanded",
      String(open)
    );
  });

  document.querySelectorAll(".main-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle?.classList.remove("active");
      mainNav?.classList.remove("open");

      menuToggle?.setAttribute(
        "aria-expanded",
        "false"
      );
    });
  });

  /* Header shadow */

  window.addEventListener(
    "scroll",
    () => {
      siteHeader?.classList.toggle(
        "scrolled",
        window.scrollY > 35
      );
    },
    { passive: true }
  );

  /* Announcement close */

  announcementClose?.addEventListener("click", () => {
    announcement.style.display = "none";
  });

  /* Forms */

  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (form.id === "visitForm") {
        showToast(
          "Thank you. We’ll prepare a place for you at Maranatha."
        );
      } else if (form.id === "givingForm") {
        const amount =
          form.querySelector(
            "[name='amount']"
          )?.value;

        const category =
          form.querySelector(
            "[name='category']"
          )?.value;

        showToast(
          `${category} gift of ₦${Number(
            amount
          ).toLocaleString()} is ready for payment.`
        );
      } else if (form.id === "prayerForm") {
        showToast(
          "Your prayer request has been received. We are praying with you."
        );
      } else {
        showToast(
          "Thank you for reaching out. Our church team will respond soon."
        );
      }

      form.reset();
    });
  });

  /* Salvation button */

  document
    .querySelector("#salvationButton")
    ?.addEventListener("click", () => {
      showToast(
        "That is a beautiful decision. Please use the prayer form so we can walk with you."
      );

      document
        .querySelector("#contact")
        ?.scrollIntoView({
          behavior: "smooth",
        });

      window.setTimeout(() => {
        document
          .querySelector('[data-form="prayerForm"]')
          ?.click();
      }, 700);
    });

  /* Giving tabs */

  const givingForm =
    document.querySelector("#givingForm");

  const givingCategory =
    givingForm?.querySelector(
      "[name='category']"
    );

  document.querySelectorAll(".giving-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".giving-tab")
        .forEach((item) => {
          item.classList.remove("active");
        });

      tab.classList.add("active");

      if (givingCategory) {
        givingCategory.value =
          tab.dataset.category;
      }
    });
  });

  /* Giving quick amounts */

  document
    .querySelectorAll(".quick-amounts button")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const amountInput =
          document.querySelector(
            "#givingForm input[name='amount']"
          );

        if (!amountInput) return;

        amountInput.value =
          button.dataset.amount;

        amountInput.focus();
      });
    });

  /* Gallery filters */

  document
    .querySelectorAll(".gallery-filter")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const filter =
          button.dataset.filter;

        document
          .querySelectorAll(".gallery-filter")
          .forEach((item) => {
            item.classList.remove("active");
          });

        button.classList.add("active");

        document
          .querySelectorAll(".gallery-grid figure")
          .forEach((figure) => {
            const visible =
              filter === "all" ||
              figure.dataset.category === filter;

            figure.style.display =
              visible ? "" : "none";
          });
      });
    });

  /* Contact tabs */

  document.querySelectorAll(".form-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId =
        tab.dataset.form;

      document
        .querySelectorAll(".form-tab")
        .forEach((item) => {
          item.classList.remove("active");
        });

      document
        .querySelectorAll(".contact-form")
        .forEach((form) => {
          form.classList.remove("active");
        });

      tab.classList.add("active");

      document
        .querySelector(`#${targetId}`)
        ?.classList.add("active");
    });
  });

  /* Sermon modal */

  const videoModal =
    document.querySelector("#videoModal");

  const videoTitle =
    document.querySelector("#videoTitle");

  function openVideoModal(title) {
    if (!videoModal) return;

    if (videoTitle) {
      videoTitle.textContent = title;
    }

    videoModal.classList.add("open");
    videoModal.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add("modal-open");
  }

  function closeVideoModal() {
    if (!videoModal) return;

    videoModal.classList.remove("open");
    videoModal.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove("modal-open");
  }

  document
    .querySelectorAll(".play-button, .play-trigger")
    .forEach((button) => {
      button.addEventListener("click", () => {
        openVideoModal(
          button.dataset.video ||
            "Sermon message"
        );
      });
    });

  document
    .querySelector(".modal-close")
    ?.addEventListener(
      "click",
      closeVideoModal
    );

  document
    .querySelector(".modal-backdrop")
    ?.addEventListener(
      "click",
      closeVideoModal
    );

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeVideoModal();
    }
  });

  /* Mission arrow */

  const missionMap =
    document.querySelector("#missionMap");

  const launchArrowButton =
    document.querySelector(
      "#launchArrowButton"
    );

  function launchMissionArrow() {
    if (!missionMap) return;

    missionMap.classList.remove("launching");

    void missionMap.offsetWidth;

    missionMap.classList.add("launching");

    window.setTimeout(() => {
      showToast(
        "The mission moves from Ogbomoso to the nations."
      );
    }, 850);
  }

  launchArrowButton?.addEventListener(
    "click",
    launchMissionArrow
  );

  if (missionMap) {
    const missionObserver =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              launchMissionArrow();
              missionObserver.unobserve(
                entry.target
              );
            }
          });
        },
        {
          threshold: 0.45,
        }
      );

    missionObserver.observe(missionMap);
  }

  /* Reveal animations */

  const revealItems =
    document.querySelectorAll(".reveal");

  const revealObserver =
    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(
              "visible"
            );

            revealObserver.unobserve(
              entry.target
            );
          }
        });
      },
      {
        threshold: 0.12,
      }
    );

  revealItems.forEach((element, index) => {
    element.style.transitionDelay =
      `${Math.min(index * 0.045, 0.3)}s`;

    revealObserver.observe(element);
  });
});
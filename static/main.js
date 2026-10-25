/* ============================================================
   DigiCare — main.js
   UI interactions + client-side validation. Form is submitted normally (POST) to Django.
   ============================================================ */

(function () {
  "use strict";

  /* ---- 1. Dynamic Footer Year ---- */
  var yearEls = document.querySelectorAll("#footer-year");
  var currentYear = new Date().getFullYear();
  yearEls.forEach(function (el) {
    el.textContent = currentYear;
  });

  /* ---- 2. Age Range Slider (Home Page) ---- */
  var ageSlider = document.getElementById("age-slider");
  var agePill   = document.getElementById("age-pill");

  if (ageSlider && agePill) {
    function updateAgeSlider() {
      var min = parseInt(ageSlider.min, 10) || 18;
      var max = parseInt(ageSlider.max, 10) || 100;
      var val = parseInt(ageSlider.value, 10) || 45;

      agePill.textContent = val;
      agePill.setAttribute("aria-label", "Selected age: " + val + " years");
      ageSlider.setAttribute("aria-valuenow", val);

      var pct = ((val - min) / (max - min)) * 100;
      ageSlider.style.setProperty("--range-pct", pct.toFixed(1) + "%");
    }

    ageSlider.addEventListener("input", updateAgeSlider);
    updateAgeSlider(); // Initialize on load
  }

  /* ---- 3. Smooth On-Scroll Reveal Observer (Home Page) ---- */
  var prefersReducedMotion = false;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    prefersReducedMotion = true;
  }

  var revealElements = document.querySelectorAll(".dc-reveal");

  if (!prefersReducedMotion && "IntersectionObserver" in window && revealElements.length > 0) {
    document.body.classList.add("reveal-ready");

    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var target = entry.target;
            target.classList.add("is-revealed");
            observer.unobserve(target); // Reveal once

            // Calculate entrance delay in ms
            var delayMs = 0;
            if (target.classList.contains("delay-1")) delayMs = 100;
            else if (target.classList.contains("delay-2")) delayMs = 200;
            else if (target.classList.contains("delay-3")) delayMs = 300;
            else if (target.classList.contains("delay-4")) delayMs = 400;

            // Once entrance animation completes, remove reveal classes
            // so all hover/active component transitions execute instantly with no delay or conflict!
            setTimeout(function () {
              target.classList.remove("dc-reveal", "delay-1", "delay-2", "delay-3", "delay-4", "is-revealed");
              target.style.transition = "";
              target.style.transitionDelay = "";
              target.style.transform = "";
              target.style.opacity = "";
              target.style.willChange = "";
            }, delayMs + 650);
          }
        });
      },
      {
        root: null,
        threshold: 0.1,
        rootMargin: "0px 0px -30px 0px"
      }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ---- 4. Form Validation & Submission (Index Page) ---- */
  var assessmentForm = document.getElementById("heart-assessment-form");
  var errorBanner    = document.getElementById("form-error-banner");
  var assessBtn      = document.getElementById("assess-btn");

  if (assessmentForm) {
    // Helper to get form-card wrapper for a field
    function getCard(fieldName) {
      return assessmentForm.querySelector('.form-card[data-field="' + fieldName + '"]');
    }

    // Helper to set field error
    function setFieldError(card, message) {
      if (!card) return;
      card.classList.add("has-error");
      var existingMsg = card.querySelector(".fc-error-msg");
      if (!existingMsg) {
        var msgEl = document.createElement("div");
        msgEl.className = "fc-error-msg";
        msgEl.setAttribute("role", "alert");
        msgEl.innerHTML = '<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> ' + message;
        card.appendChild(msgEl);
      }
    }

    // Helper to clear field error
    function clearFieldError(card) {
      if (!card) return;
      card.classList.remove("has-error");
      var existingMsg = card.querySelector(".fc-error-msg");
      if (existingMsg) {
        existingMsg.remove();
      }
    }

    // Live validation listener: clear errors on input/change
    assessmentForm.addEventListener("input", handleFieldChange);
    assessmentForm.addEventListener("change", handleFieldChange);

    function handleFieldChange(e) {
      var target = e.target;
      var name = target.name;
      if (!name) return;

      var card = target.closest(".form-card");
      if (card && card.classList.contains("has-error")) {
        // Check if now valid
        var isFilled = false;
        if (target.type === "radio") {
          var checked = assessmentForm.querySelector('input[name="' + name + '"]:checked');
          isFilled = !!checked;
        } else if (target.tagName.toLowerCase() === "select") {
          isFilled = target.value.trim() !== "";
        } else {
          isFilled = target.value.trim() !== "";
        }

        if (isFilled) {
          clearFieldError(card);
          // If no more errors exist in form, hide top banner
          if (!assessmentForm.querySelector(".form-card.has-error") && errorBanner) {
            errorBanner.classList.remove("show");
          }
        }
      }
    }

    // Validation function on submit
    assessmentForm.addEventListener("submit", function (e) {

      var errors = [];
      var firstInvalidCard = null;

      // 1. Age
      var ageInput = document.getElementById("age-slider");
      var ageCard  = getCard("age");
      if (!ageInput || !ageInput.value || parseInt(ageInput.value, 10) < 18) {
        setFieldError(ageCard, "Please select your age.");
        errors.push("age");
        if (!firstInvalidCard) firstInvalidCard = ageCard;
      } else {
        clearFieldError(ageCard);
      }

      // 2. Sex
      var sexChecked = assessmentForm.querySelector('input[name="sex"]:checked');
      var sexCard    = getCard("sex");
      if (!sexChecked) {
        setFieldError(sexCard, "Please select biological sex.");
        errors.push("sex");
        if (!firstInvalidCard) firstInvalidCard = sexCard;
      } else {
        clearFieldError(sexCard);
      }

      // 3. Chest Pain Type (cp)
      var cpSelect = document.getElementById("cp-select");
      var cpCard   = getCard("cp");
      if (!cpSelect || cpSelect.value === "") {
        setFieldError(cpCard, "Please select a chest pain category.");
        errors.push("cp");
        if (!firstInvalidCard) firstInvalidCard = cpCard;
      } else {
        clearFieldError(cpCard);
      }

      // 4. Fasting Blood Sugar (fbs)
      var fbsChecked = assessmentForm.querySelector('input[name="fasting_blood_sugar"]:checked');
      var fbsCard    = getCard("fbs");
      if (!fbsChecked) {
        setFieldError(fbsCard, "Please indicate whether fasting blood sugar exceeds 120 mg/dL.");
        errors.push("fbs");
        if (!firstInvalidCard) firstInvalidCard = fbsCard;
      } else {
        clearFieldError(fbsCard);
      }

      // 5. Resting ECG (restecg)
      var restecgSelect = document.getElementById("restecg-select");
      var restecgCard   = getCard("restecg");
      if (!restecgSelect || restecgSelect.value === "") {
        setFieldError(restecgCard, "Please select your resting ECG findings.");
        errors.push("restecg");
        if (!firstInvalidCard) firstInvalidCard = restecgCard;
      } else {
        clearFieldError(restecgCard);
      }

      // 6. Exercise-Induced Angina (exang)
      var exangChecked = assessmentForm.querySelector('input[name="exercise_angina"]:checked');
      var exangCard    = getCard("exang");
      if (!exangChecked) {
        setFieldError(exangCard, "Please indicate if you experience exercise-induced angina.");
        errors.push("exang");
        if (!firstInvalidCard) firstInvalidCard = exangCard;
      } else {
        clearFieldError(exangCard);
      }

      // 7. ST Segment Slope (slope)
      var slopeSelect = document.getElementById("slope-select");
      var slopeCard   = getCard("slope");
      if (!slopeSelect || slopeSelect.value === "") {
        setFieldError(slopeCard, "Please select the peak exercise ST slope.");
        errors.push("slope");
        if (!firstInvalidCard) firstInvalidCard = slopeCard;
      } else {
        clearFieldError(slopeCard);
      }

      // 8. Resting Blood Pressure (trestbps)
      var trestbpsInput = document.getElementById("trestbps-input");
      var trestbpsCard  = getCard("trestbps");
      if (!trestbpsInput || trestbpsInput.value.trim() === "" || isNaN(parseInt(trestbpsInput.value, 10))) {
        setFieldError(trestbpsCard, "Please enter resting blood pressure in mmHg.");
        errors.push("trestbps");
        if (!firstInvalidCard) firstInvalidCard = trestbpsCard;
      } else {
        clearFieldError(trestbpsCard);
      }

      // 9. Cholesterol (chol)
      var cholInput = document.getElementById("chol-input");
      var cholCard  = getCard("chol");
      if (!cholInput || cholInput.value.trim() === "" || isNaN(parseInt(cholInput.value, 10))) {
        setFieldError(cholCard, "Please enter cholesterol level in mg/dL.");
        errors.push("chol");
        if (!firstInvalidCard) firstInvalidCard = cholCard;
      } else {
        clearFieldError(cholCard);
      }

      // 10. Maximum Heart Rate (thalach)
      var thalachInput = document.getElementById("thalach-input");
      var thalachCard  = getCard("thalach");
      if (!thalachInput || thalachInput.value.trim() === "" || isNaN(parseInt(thalachInput.value, 10))) {
        setFieldError(thalachCard, "Please enter maximum heart rate in BPM.");
        errors.push("thalach");
        if (!firstInvalidCard) firstInvalidCard = thalachCard;
      } else {
        clearFieldError(thalachCard);
      }

      // 11. Oldpeak (oldpeak)
      var oldpeakInput = document.getElementById("oldpeak-input");
      var oldpeakCard  = getCard("oldpeak");
      if (!oldpeakInput || oldpeakInput.value.trim() === "" || isNaN(parseFloat(oldpeakInput.value))) {
        setFieldError(oldpeakCard, "Please enter ST depression oldpeak value (e.g. 1.5).");
        errors.push("oldpeak");
        if (!firstInvalidCard) firstInvalidCard = oldpeakCard;
      } else {
        clearFieldError(oldpeakCard);
      }

      // Handle Validation Failure
      if (errors.length > 0) {
        e.preventDefault(); // validation failed -> don't submit
        if (errorBanner) {
          errorBanner.classList.add("show");
        }
        if (firstInvalidCard) {
          firstInvalidCard.scrollIntoView({ behavior: "smooth", block: "center" });
          // If the invalid card contains an input or select, focus it
          var focusable = firstInvalidCard.querySelector("input, select");
          if (focusable) focusable.focus({ preventScroll: true });
        }
        return;
      }

      // All fields valid: hide error banner and let the browser POST the form to Django
      if (errorBanner) {
        errorBanner.classList.remove("show");
      }

      // Button feedback (disable on next tick so the submit itself is not cancelled)
      if (assessBtn) {
        assessBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Evaluating Profile...';
        setTimeout(function () { assessBtn.disabled = true; }, 0);
      }
      // No preventDefault() and no redirect here: Django handles the result.
    });
  }

  /* ---- 5. Dynamic Background Canvas & Interactive Movement ---- */
  var canvas = document.getElementById("dynamic-pulse-canvas");
  var mouseGlow = document.getElementById("mouse-glow");
  var heroWrap = document.querySelector(".hero-image-wrap");

  if (canvas && !prefersReducedMotion) {
    var ctx = canvas.getContext("2d");
    var width, height;
    var dpr = window.devicePixelRatio || 1;

    function resizeCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Dynamic ECG Pulse Wave
    var ecgX = 0;
    var ecgSpeed = 2.4;
    var points = [];
    var maxPoints = 260;

    // Pulse waveform generator: Returns offset relative to baseline Y based on horizontal phase
    function getEcgY(x) {
      var cycleLength = 320;
      var phase = (x % cycleLength);
      if (phase < 80) return 0;
      if (phase >= 80 && phase < 100) {
        // P-Wave
        return -Math.sin(((phase - 80) / 20) * Math.PI) * 9;
      }
      if (phase >= 100 && phase < 112) return 0;
      if (phase >= 112 && phase < 120) {
        // Q-Dip
        return 7 * ((phase - 112) / 8);
      }
      if (phase >= 120 && phase < 132) {
        // R-Spike (Cardiac Peak)
        return -54 * Math.sin(((phase - 120) / 12) * Math.PI) + 7;
      }
      if (phase >= 132 && phase < 142) {
        // S-Dip
        return 12 * Math.sin(((phase - 132) / 10) * Math.PI);
      }
      if (phase >= 142 && phase < 165) return 0;
      if (phase >= 165 && phase < 205) {
        // T-Wave
        return -Math.sin(((phase - 165) / 40) * Math.PI) * 15;
      }
      return 0;
    }

    // Floating Medical Micro-Particles
    var particleCount = Math.min(24, Math.max(12, Math.floor(window.innerWidth / 75)));
    var particles = [];

    for (var i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 2 + 1,
        speedY: Math.random() * 0.35 + 0.15,
        speedX: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.38 + 0.12,
        isCross: Math.random() > 0.65,
        size: Math.random() * 6 + 6
      });
    }

    // Animation Loop
    var isTabVisible = true;
    document.addEventListener("visibilitychange", function () {
      isTabVisible = !document.hidden;
      if (isTabVisible) requestAnimationFrame(render);
    });

    function render() {
      if (!isTabVisible) return;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Floating Medical Particles
      for (var p = 0; p < particles.length; p++) {
        var pt = particles[p];
        pt.y -= pt.speedY;
        pt.x += pt.speedX;

        if (pt.y < -20) {
          pt.y = height + 20;
          pt.x = Math.random() * width;
        }
        if (pt.x < -20) pt.x = width + 20;
        if (pt.x > width + 20) pt.x = -20;

        ctx.fillStyle = "rgba(121, 13, 22, " + pt.opacity + ")";
        ctx.strokeStyle = "rgba(121, 13, 22, " + pt.opacity + ")";

        if (pt.isCross) {
          var s = pt.size / 2;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(pt.x - s, pt.y);
          ctx.lineTo(pt.x + s, pt.y);
          ctx.moveTo(pt.x, pt.y - s);
          ctx.lineTo(pt.x, pt.y + s);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Draw Moving Cardiac ECG Monitor Line
      var baseY = Math.max(130, Math.min(250, height * 0.23));
      ecgX += ecgSpeed;
      if (ecgX > width + 100) {
        ecgX = 0;
        points = [];
      }

      var currentY = baseY + getEcgY(ecgX);
      points.push({ x: ecgX, y: currentY });
      if (points.length > maxPoints) {
        points.shift();
      }

      if (points.length > 1) {
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (var j = 1; j < points.length; j++) {
          var progress = j / points.length; // 0 (tail) -> 1 (head)
          var alpha = Math.pow(progress, 1.8) * 0.45;
          ctx.strokeStyle = "rgba(121, 13, 22, " + alpha + ")";
          ctx.beginPath();
          ctx.moveTo(points[j - 1].x, points[j - 1].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.stroke();
        }

        // Glowing Head Dot
        var head = points[points.length - 1];
        ctx.fillStyle = "rgba(186, 24, 38, 0.75)";
        ctx.beginPath();
        ctx.arc(head.x, head.y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(243, 207, 210, 0.4)";
        ctx.beginPath();
        ctx.arc(head.x, head.y, 7, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }

  // Interactive Mouse Spotlight Follower
  if (mouseGlow && !prefersReducedMotion) {
    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var curX = mouseX;
    var curY = mouseY;
    var hasMoved = false;

    window.addEventListener("mousemove", function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        mouseGlow.style.opacity = "1";
      }
    });

    document.addEventListener("mouseleave", function () {
      mouseGlow.style.opacity = "0";
    });

    document.addEventListener("mouseenter", function () {
      if (hasMoved) mouseGlow.style.opacity = "1";
    });

    function updateCursorGlow() {
      curX += (mouseX - curX) * 0.08;
      curY += (mouseY - curY) * 0.08;
      mouseGlow.style.left = curX.toFixed(1) + "px";
      mouseGlow.style.top = curY.toFixed(1) + "px";
      requestAnimationFrame(updateCursorGlow);
    }
    requestAnimationFrame(updateCursorGlow);
  }

  // Subtle 3D Tilt on Hero Image on Mouse Hover
  if (heroWrap && !prefersReducedMotion) {
    var heroImg = heroWrap.querySelector("img");
    if (heroImg) {
      heroWrap.addEventListener("mousemove", function (e) {
        var rect = heroWrap.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        var rotX = (-y / rect.height) * 9;
        var rotY = (x / rect.width) * 9;
        heroImg.style.transform = "perspective(1000px) rotateX(" + rotX.toFixed(2) + "deg) rotateY(" + rotY.toFixed(2) + "deg) translateY(-8px)";
      });

      heroWrap.addEventListener("mouseleave", function () {
        heroImg.style.transform = "";
      });
    }
  }

})();
(() => {
  "use strict";

  const STORAGE = {
    applicant: "tsaChallenge.applicant",
    applicants: "tsaChallenge.applicants",
    draft: "tsaChallenge.registrationDraft",
    audit: "tsaChallenge.auditLog",
    mail: "tsaChallenge.mailLog",
    groups: "tsaChallenge.provinceGroups",
  };

  const provinces = [
    "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร",
    "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", "ชัยภูมิ",
    "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง", "ตราด", "ตาก",
    "นครนายก", "นครปฐม", "นครพนม", "นครราชสีมา", "นครศรีธรรมราช",
    "นครสวรรค์", "นนทบุรี", "นราธิวาส", "น่าน", "บึงกาฬ", "บุรีรัมย์",
    "ปทุมธานี", "ประจวบคีรีขันธ์", "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา",
    "พะเยา", "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์",
    "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน", "ยโสธร",
    "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี", "ลพบุรี", "ลำปาง",
    "ลำพูน", "เลย", "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ",
    "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย",
    "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย", "หนองบัวลำภู",
    "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี",
  ];

  const smallProvinces = new Set([
    "อำนาจเจริญ", "บึงกาฬ", "ชัยนาท", "มุกดาหาร", "นครนายก", "หนองบัวลำภู",
    "พังงา", "พิจิตร", "ระนอง", "สิงห์บุรี", "สมุทรสงคราม", "สตูล", "อุทัยธานี",
  ]);
  const largeProvinces = new Set([
    "เชียงใหม่", "ขอนแก่น", "ชลบุรี", "นครราชสีมา", "อุบลราชธานี", "อุดรธานี",
    "นครศรีธรรมราช", "สงขลา", "สุราษฎร์ธานี", "ภูเก็ต", "ระยอง", "นนทบุรี",
    "ปทุมธานี", "สมุทรปราการ", "นครปฐม", "เชียงราย", "เพชรบูรณ์", "พิษณุโลก",
    "กาญจนบุรี", "ประจวบคีรีขันธ์", "ร้อยเอ็ด", "สกลนคร", "บุรีรัมย์", "ศรีสะเกษ",
  ]);

  const positions = [
    "เจ้าหน้าที่พลศึกษา",
    "นักพัฒนาการกีฬา",
    "นักวิชาการการท่องเที่ยว",
    "นักวิชาการคอมพิวเตอร์",
    "เจ้าพนักงานธุรการ",
    "พนักงานราชการ",
    "เจ้าหน้าที่โครงการ",
    "อื่น ๆ",
  ];
  const organizationTypes = [
    ["skj", "สำนักงานการท่องเที่ยวและกีฬาจังหวัด (สกจ.)"],
    ["sat", "การกีฬาแห่งประเทศไทย (กกท.)"],
    ["local", "องค์กรปกครองส่วนท้องถิ่น (อปท.)"],
    ["school", "สถานศึกษา"],
    ["other", "หน่วยงานอื่น"],
  ];

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character]);

  const readJson = (key, fallback) => {
    const stored = localStorage.getItem(key);
    return stored === null ? fallback : JSON.parse(stored);
  };

  const writeJson = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  const provinceGroup = (province) => {
    const overrides = readJson(STORAGE.groups, {});
    if (overrides[province]) return overrides[province];
    if (province === "กรุงเทพมหานคร") return "ใหญ่พิเศษ";
    if (largeProvinces.has(province)) return "ใหญ่";
    if (smallProvinces.has(province)) return "เล็ก";
    return "กลาง";
  };

  const calculateIndividualScore = ({
    assigned = 0,
    certified = 0,
    firstSent = 0,
    firstPass = 0,
    newItems = 0,
    updatedItems = 0,
    checklist = 0,
    timely = false,
  }) => {
    if (
      ![assigned, certified, firstSent, firstPass, newItems, updatedItems, checklist].every(Number.isFinite) ||
      ![assigned, certified, firstSent, firstPass, newItems, updatedItems].every(Number.isInteger) ||
      assigned < 0 || certified < 0 || firstSent < 0 || firstPass < 0 ||
      newItems < 0 || updatedItems < 0 || firstPass > firstSent ||
      certified > assigned || checklist < 0 || checklist > 1
    ) {
      throw new RangeError("คะแนนหรือจำนวนภารกิจอยู่นอกช่วงที่อนุญาต");
    }

    const achievement = assigned === 0 ? 0 : (certified / assigned) * 40;
    const firstPassScore = firstSent === 0 ? 0 : (firstPass / firstSent) * 20;
    const units = (newItems * 2) + updatedItems;
    const outputScore = Math.min(units / 5, 1) * 20;
    const evidenceScore = checklist * 10;
    const timelyScore = timely ? 10 : 0;
    const total = achievement + firstPassScore + outputScore + evidenceScore + timelyScore;

    return {
      achievement,
      firstPass: firstPassScore,
      output: outputScore,
      evidence: evidenceScore,
      timely: timelyScore,
      total: Math.round((total + Number.EPSILON) * 100) / 100,
      units,
    };
  };

  const applicantAward = (rank) => {
    if (rank === 1) return 15000;
    if (rank === 2) return 10000;
    if (rank === 3) return 8000;
    if (rank <= 5) return 6000;
    if (rank <= 10) return 5000;
    if (rank <= 15) return 3000;
    return 0;
  };

  window.TSAChallenge = Object.freeze({
    calculateIndividualScore,
    applicantAward,
    provinceGroup,
  });

  const installStyles = () => {
    if (document.querySelector('link[data-tsa-app-styles]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "app.css";
    link.dataset.tsaAppStyles = "";
    document.head.append(link);
  };

  const createRegistrationMarkup = () => {
    const provinceOptions = provinces.map((province) =>
      `<option value="${escapeHtml(province)}">${escapeHtml(province)}</option>`).join("");
    const typeOptions = organizationTypes.map(([value, label]) =>
      `<label class="tsa-choice"><input type="radio" name="orgType" value="${value}" required>${label}</label>`).join("");
    const positionOptions = positions.map((position) =>
      `<option value="${escapeHtml(position)}">${escapeHtml(position)}</option>`).join("");

    return `
      <fieldset data-step="identity">
        <legend><span class="tsa-step-number">01</span>ข้อมูลผู้สมัคร<span class="tsa-step-status" aria-live="polite"></span></legend>
        <div class="tsa-radio-grid" role="radiogroup" aria-label="คำนำหน้า">
          <label class="tsa-choice"><input type="radio" name="title" value="นาย" required>นาย</label>
          <label class="tsa-choice"><input type="radio" name="title" value="นาง">นาง</label>
          <label class="tsa-choice"><input type="radio" name="title" value="นางสาว">นางสาว</label>
        </div>
        <div class="tsa-field-grid">
          <label class="tsa-field-label" for="firstName">ชื่อ
            <input id="firstName" name="first" autocomplete="given-name" required>
          </label>
          <label class="tsa-field-label" for="lastName">นามสกุล
            <input id="lastName" name="last" autocomplete="family-name" required>
          </label>
        </div>
      </fieldset>
      <div class="tsa-section-divider" aria-hidden="true"></div>
      <fieldset data-step="affiliation">
        <legend><span class="tsa-step-number">02</span>สังกัด<span class="tsa-step-status" aria-live="polite"></span></legend>
        <div class="tsa-field-grid">
          <label class="tsa-field-label" for="province">จังหวัดที่สังกัด
            <select id="province" name="prov" required>
              <option value="">เลือกจังหวัด</option>${provinceOptions}
            </select>
            <span id="provinceGroup" aria-live="polite">กลุ่มจังหวัดจะแสดงเมื่อเลือกจังหวัด</span>
          </label>
          <label class="tsa-field-label" for="position">ตำแหน่ง
            <select id="position" name="pos" required>
              <option value="">เลือกตำแหน่ง</option>${positionOptions}
            </select>
          </label>
        </div>
        <div>
          <span class="tsa-field-label">ประเภทหน่วยงาน <span class="tsa-inline-error" data-error-for="orgType" hidden>กรุณาเลือกประเภทหน่วยงาน</span></span>
          <div class="tsa-radio-grid" role="radiogroup" aria-label="ประเภทหน่วยงาน">${typeOptions}</div>
        </div>
        <label class="tsa-field-label" for="org">ชื่อหน่วยงาน
          <input id="org" name="org" autocomplete="organization" required readonly aria-describedby="orgHelp">
          <span id="orgHelp">สกจ. และ กกท. จะเติมชื่อให้อัตโนมัติ ยกเว้นกรุงเทพมหานคร</span>
        </label>
        <label class="tsa-field-label" id="positionOtherWrap" for="positionOther" hidden>ระบุตำแหน่ง
          <input id="positionOther" name="posOther">
        </label>
      </fieldset>
      <div class="tsa-section-divider" aria-hidden="true"></div>
      <fieldset data-step="contact">
        <legend><span class="tsa-step-number">03</span>ช่องทางติดต่อ<span class="tsa-step-status" aria-live="polite"></span></legend>
        <div class="tsa-field-grid">
          <label class="tsa-field-label" for="phone">โทรศัพท์มือถือ
            <input id="phone" name="tel" type="tel" inputmode="numeric" autocomplete="tel" placeholder="08X-XXX-XXXX" required>
            <span>กรอกตัวเลข 9–10 หลัก และขึ้นต้นด้วย 0</span>
          </label>
          <label class="tsa-field-label" for="email">อีเมล
            <input id="email" name="mail" type="email" autocomplete="email" placeholder="name@example.go.th" required>
            <span>ใช้รับรหัสผู้สมัครและผลการอนุมัติ</span>
          </label>
        </div>
      </fieldset>
      <div class="tsa-section-divider" aria-hidden="true"></div>
      <fieldset data-step="consent">
        <legend><span class="tsa-step-number">04</span>ยืนยันการสมัคร<span class="tsa-step-status" aria-live="polite"></span></legend>
        <label class="tsa-consent"><input type="checkbox" name="consentRules" required><span>ยอมรับกติกาการแข่งขัน <span>อ่านได้ที่หน้ากติกาและรางวัล</span></span></label>
        <label class="tsa-consent"><input type="checkbox" name="consentPdpa" required><span>ยินยอมให้ใช้ข้อมูลส่วนบุคคล (PDPA) <span>เพื่อพิจารณาสิทธิ์ ติดต่อประสานงาน และประกาศผลโดยแสดงชื่อพร้อมอักษรแรกของนามสกุล</span></span></label>
        <label class="tsa-consent"><input type="checkbox" name="consentRounds" required><span>ยืนยันเข้าร่วมแข่งขันครบทั้ง 2 รอบ <span>รอบที่ 1 · 1–24 พ.ย. 2569 และรอบที่ 2 · 1–24 ธ.ค. 2569</span></span></label>
        <label class="tsa-clinic-choice"><input type="checkbox" name="clinic">สมัครคลินิกออนไลน์ครั้งที่ 1 พร้อมกัน (ไม่บังคับ)</label>
      </fieldset>`;
  };

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const getRegistrationState = (form) => {
    const data = new FormData(form);
    const orgType = data.get("orgType") || "";
    const province = data.get("prov") || "";
    const autoOrganization = Boolean(
      province && province !== "กรุงเทพมหานคร" && (orgType === "skj" || orgType === "sat"),
    );
    const organization = form.elements.org;
    const position = data.get("pos") || "";
    const positionOther = form.elements.posOther.value.trim();
    const phoneDigits = form.elements.tel.value.replace(/\D/g, "");
    const controls = [
      Boolean(data.get("title")),
      Boolean(form.elements.first.value.trim()),
      Boolean(form.elements.last.value.trim()),
      Boolean(province),
      Boolean(orgType),
      autoOrganization || Boolean(organization.value.trim()),
      Boolean(position && (position !== "อื่น ๆ" || positionOther)),
      /^0\d{8,9}$/.test(phoneDigits),
      form.elements.mail.validity.valid && Boolean(form.elements.mail.value.trim()),
      form.elements.consentRules.checked,
      form.elements.consentPdpa.checked,
      form.elements.consentRounds.checked,
    ];
    const countedFields = controls.filter((_, index) => index !== 5);
    const steps = {
      identity: controls.slice(0, 3),
      affiliation: controls.slice(3, 7),
      contact: controls.slice(7, 9),
      consent: controls.slice(9, 12),
    };

    return {
      data,
      orgType,
      province,
      autoOrganization,
      controls,
      countedFields,
      steps,
      complete: controls.every(Boolean),
      completed: countedFields.filter(Boolean).length,
      total: countedFields.length,
    };
  };

  const getValidationIssues = (form, state) => {
    const issues = [];
    const addIssue = (key, element, message) => issues.push({ key, element, message });
    const selectedTitle = form.querySelector('input[name="title"]:checked');
    const selectedOrganizationType = form.querySelector('input[name="orgType"]:checked');
    const phoneDigits = form.elements.tel.value.replace(/\D/g, "");
    const email = form.elements.mail;
    const position = form.elements.pos.value;

    if (!selectedTitle) addIssue("title", form.querySelector('input[name="title"]'), "กรุณาเลือกคำนำหน้า");
    if (!form.elements.first.value.trim()) addIssue("first", form.elements.first, "กรุณากรอกชื่อ");
    if (!form.elements.last.value.trim()) addIssue("last", form.elements.last, "กรุณากรอกนามสกุล");
    if (!state.province) addIssue("province", form.elements.prov, "กรุณาเลือกจังหวัดที่สังกัด");
    if (!position) addIssue("position", form.elements.pos, "กรุณาเลือกตำแหน่ง");
    if (position === "อื่น ๆ" && !form.elements.posOther.value.trim()) {
      addIssue("positionOther", form.elements.posOther, "กรุณาระบุตำแหน่ง");
    }
    if (!selectedOrganizationType) {
      addIssue("orgType", form.querySelector('input[name="orgType"]'), "กรุณาเลือกประเภทหน่วยงาน");
    }
    if (!form.elements.org.value.trim()) addIssue("org", form.elements.org, "กรุณาระบุชื่อหน่วยงาน");
    if (!/^0\d{8,9}$/.test(phoneDigits)) {
      addIssue("phone", form.elements.tel, "กรอกเบอร์โทรศัพท์ 9–10 หลัก โดยขึ้นต้นด้วย 0");
    }
    if (!email.value.trim()) {
      addIssue("email", email, "กรุณากรอกอีเมล");
    } else if (!email.validity.valid) {
      addIssue("email", email, "รูปแบบอีเมลไม่ถูกต้อง");
    }
    if (!form.elements.consentRules.checked) {
      addIssue("consentRules", form.elements.consentRules, "กรุณายอมรับกติกาการแข่งขัน");
    }
    if (!form.elements.consentPdpa.checked) {
      addIssue("consentPdpa", form.elements.consentPdpa, "กรุณาให้ความยินยอมเกี่ยวกับข้อมูลส่วนบุคคล");
    }
    if (!form.elements.consentRounds.checked) {
      addIssue("consentRounds", form.elements.consentRounds, "กรุณายืนยันการเข้าร่วมแข่งขันทั้ง 2 รอบ");
    }
    return issues;
  };

  const draftValues = (form) => {
    const draft = {};
    for (const element of form.elements) {
      if (!element.name || element.type === "submit" || element.type === "button") continue;
      if (element.type === "radio") {
        if (element.checked) draft[element.name] = element.value;
      } else if (element.type === "checkbox") {
        draft[element.name] = element.checked;
      } else {
        draft[element.name] = element.value;
      }
    }
    return draft;
  };

  const saveDraft = (form) => writeJson(STORAGE.draft, draftValues(form));

  const restoreDraft = (form) => {
    const draft = readJson(STORAGE.draft, null);
    if (!draft) return;
    for (const element of form.elements) {
      if (!element.name || !(element.name in draft)) continue;
      if (element.type === "radio") {
        element.checked = element.value === draft[element.name];
      } else if (element.type === "checkbox") {
        element.checked = draft[element.name];
      } else {
        element.value = draft[element.name];
      }
    }
  };

  const applicantCode = (existing) => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const knownCodes = new Set(existing.map((applicant) => applicant.id));
    let code;
    do {
      const bytes = crypto.getRandomValues(new Uint8Array(6));
      code = `TSA69-${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")}`;
    } while (knownCodes.has(code));
    return code;
  };

  const appendAudit = (action, target, details, actor = "ผู้สมัคร") => {
    const log = readJson(STORAGE.audit, []);
    log.unshift({
      actor,
      action,
      target,
      details,
      at: new Date().toISOString(),
    });
    writeJson(STORAGE.audit, log);
  };

  const initializeRegistration = () => {
    const form = document.querySelector("form");
    if (!form) return;
    const mobile = location.pathname.toLowerCase().endsWith("m-register.html");
    form.id = "tsaRegistrationForm";
    form.className = "tsa-registration-form";
    form.noValidate = true;
    form.innerHTML = createRegistrationMarkup();
    if (mobile) document.body.classList.add("tsa-mobile-registration");

    const wrapper = form.parentElement;
    const pageShell = wrapper.parentElement;
    if (!mobile && pageShell) pageShell.classList.add("tsa-registration-page");
    if (mobile) {
      const progressCard = wrapper.querySelector("div[style*='margin: -62px']");
      if (progressCard) {
        progressCard.classList.add("tsa-registration-progress");
        progressCard.innerHTML = `
          <strong>สมัครรอบที่ 1 + 2</strong>
          <div class="tsa-progress-track" role="progressbar" aria-label="ความครบถ้วนของใบสมัคร" aria-valuemin="0" aria-valuemax="100"><span></span></div>
          <div class="tsa-progress-copy">กรอกข้อมูลเพื่อเริ่มสมัคร</div>`;
      }
      const oldBar = wrapper.querySelector("div[style*='position: absolute'][style*='bottom: 0']");
      if (oldBar) {
        oldBar.className = "tsa-mobile-submit";
        oldBar.innerHTML = `<div class="tsa-submit-panel"></div>`;
      }
      wrapper.style.overflow = "visible";
      wrapper.style.paddingBottom = "90px";
    } else {
      const aside = wrapper.querySelector("aside");
      if (aside) {
        const submitPanel = document.createElement("div");
        submitPanel.className = "tsa-submit-panel";
        submitPanel.setAttribute("aria-live", "polite");
        form.append(submitPanel);
        aside.innerHTML = `
          <section class="tsa-personal-card tsa-applicant-summary" aria-live="polite">
            <h2>สรุปการสมัคร</h2>
            <p data-summary-name>กรอกชื่อผู้สมัคร</p>
            <p data-summary-work>ตำแหน่งและหน่วยงานจะแสดงที่นี่</p>
            <p data-summary-province>เลือกจังหวัดเพื่อดูข้อมูลกลุ่ม</p>
            <p>สมัครทั้งรอบที่ 1 และรอบที่ 2</p>
          </section>
            <section class="tsa-next-steps">
              <h2>หลังส่งใบสมัคร</h2>
              <ol>
                <li>ระบบเดโมจะแสดงรหัสผู้สมัครในหน้า “การสมัครของฉัน”</li>
                <li>สถานะเริ่มต้นเป็นรอตรวจสอบ</li>
                <li>ข้อมูลยังบันทึกเฉพาะในเบราว์เซอร์เครื่องนี้</li>
              </ol>
            </section>`;
      }
    }

    const submitPanel = mobile
      ? wrapper.querySelector(".tsa-mobile-submit .tsa-submit-panel")
      : form.querySelector(".tsa-submit-panel");
    if (!submitPanel) return;
    submitPanel.innerHTML = `
      <div class="tsa-progress-copy"><strong data-progress-count>0/11</strong><span data-progress-message>กรอกข้อมูลให้ครบก่อนส่ง</span></div>
      <div class="tsa-progress-track" role="progressbar" aria-label="ความครบถ้วนของใบสมัคร" aria-valuemin="0" aria-valuemax="100"><span></span></div>
      <button type="submit" form="tsaRegistrationForm" disabled>ส่งใบสมัคร</button>
      <button class="tsa-missing-link" type="button">ดูช่องที่ยังขาด</button>`;

    const errorSummary = document.createElement("section");
    errorSummary.className = "tsa-error-summary";
    errorSummary.tabIndex = -1;
    errorSummary.setAttribute("role", "alert");
    errorSummary.setAttribute("aria-live", "assertive");
    errorSummary.hidden = true;
    errorSummary.innerHTML = `<h2>ยังส่งใบสมัครไม่ได้</h2><p>โปรดตรวจข้อมูลต่อไปนี้</p><ul></ul>`;
    form.prepend(errorSummary);

    restoreDraft(form);
    const attempted = { value: false };
    const updateOrganization = () => {
      const state = getRegistrationState(form);
      const org = form.elements.org;
      const orgHelp = form.querySelector("#orgHelp");
      if (state.autoOrganization) {
        const officeName = state.orgType === "skj"
          ? `สำนักงานการท่องเที่ยวและกีฬาจังหวัด${state.province}`
          : `การกีฬาแห่งประเทศไทย จังหวัด${state.province}`;
        org.value = officeName;
        org.readOnly = true;
        orgHelp.textContent = "เติมชื่อหน่วยงานอัตโนมัติจากจังหวัด";
      } else {
        const wasReadOnly = org.readOnly;
        org.readOnly = false;
        if (wasReadOnly || org.value.startsWith("สำนักงานการท่องเที่ยว") || org.value.startsWith("การกีฬาแห่งประเทศไทย")) {
          org.value = "";
        }
        orgHelp.textContent = state.province === "กรุงเทพมหานคร"
          ? "กรุงเทพมหานครต้องระบุชื่อหน่วยงาน"
          : "กรุณาระบุชื่อหน่วยงาน";
      }
      const positionOtherWrap = form.querySelector("#positionOtherWrap");
      const positionOther = form.elements.posOther;
      const needsOtherPosition = form.elements.pos.value === "อื่น ๆ";
      positionOtherWrap.hidden = !needsOtherPosition;
      positionOther.required = needsOtherPosition;
      if (!needsOtherPosition) positionOther.value = "";
      updateForm();
    };

    const updateForm = () => {
      const state = getRegistrationState(form);
      const issues = getValidationIssues(form, state);
      for (const [stepName, values] of Object.entries(state.steps)) {
        const step = form.querySelector(`[data-step="${stepName}"]`);
        const status = step.querySelector(".tsa-step-status");
        const missing = values.filter((valid) => !valid).length;
        status.textContent = missing === 0 ? "ครบแล้ว" : `ขาด ${missing}`;
        status.classList.toggle("is-complete", missing === 0);
      }
      const progressSteps = Array.from(document.querySelectorAll(".tsa-registration-steps [data-progress-step]"));
      let activeStep = Object.keys(state.steps).find((stepName) => state.steps[stepName].some((valid) => !valid));
      for (const step of progressSteps) {
        const stepName = step.dataset.progressStep;
        const isComplete = state.steps[stepName].every(Boolean);
        const isCurrent = !state.complete && stepName === activeStep;
        step.classList.toggle("is-complete", isComplete);
        step.classList.toggle("is-current", isCurrent);
        if (isCurrent) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
        step.querySelector("span").textContent = isComplete ? "✓" : String(progressSteps.indexOf(step) + 1);
      }
      const percent = state.total === 0 ? 0 : Math.round((state.completed / state.total) * 100);
      const progressText = submitPanel.querySelector("[data-progress-count]");
      const progressMessage = submitPanel.querySelector("[data-progress-message]");
      const progressBar = submitPanel.querySelector(".tsa-progress-track");
      progressText.textContent = `${state.completed}/${state.total}`;
      progressMessage.textContent = state.complete ? "ข้อมูลครบ พร้อมส่งใบสมัคร" : "กรอกข้อมูลให้ครบก่อนส่ง";
      progressBar.setAttribute("aria-valuenow", String(percent));
      progressBar.querySelector("span").style.width = `${percent}%`;
      const progressCopies = wrapper.querySelectorAll(".tsa-registration-progress .tsa-progress-copy");
      for (const copy of progressCopies) copy.textContent = `กรอกแล้ว ${state.completed} จาก ${state.total} ช่อง`;
      const summaryName = wrapper.querySelector("[data-summary-name]");
      if (summaryName) {
        const title = state.data.get("title") || "";
        const first = form.elements.first.value.trim();
        const last = form.elements.last.value.trim();
        summaryName.textContent = `${title}${first || "ชื่อ"} ${last || "นามสกุล"}`;
        wrapper.querySelector("[data-summary-work]").textContent =
          `${form.elements.pos.value === "อื่น ๆ" ? form.elements.posOther.value || "ระบุตำแหน่ง" : form.elements.pos.value || "ตำแหน่ง"} · ${form.elements.org.value || "หน่วยงาน"}`;
        wrapper.querySelector("[data-summary-province]").textContent =
          state.province ? `จังหวัด${state.province} · กลุ่ม${provinceGroup(state.province)}` : "เลือกจังหวัดเพื่อดูข้อมูลกลุ่ม";
      }
      submitPanel.querySelector('button[type="submit"]').disabled = !state.complete;

      const describedErrors = form.querySelectorAll("[data-generated-error]");
      for (const error of describedErrors) error.remove();
      for (const field of form.querySelectorAll("[aria-invalid='true']")) {
        field.removeAttribute("aria-invalid");
        const describedBy = (field.getAttribute("aria-describedby") || "")
          .split(/\s+/)
          .filter((id) => id && !id.startsWith("tsa-error-"));
        if (describedBy.length) field.setAttribute("aria-describedby", describedBy.join(" "));
        else field.removeAttribute("aria-describedby");
      }

      const summaryList = errorSummary.querySelector("ul");
      summaryList.replaceChildren();
      for (const issue of issues) {
        const group = issue.element.closest('[role="radiogroup"]');
        const groupVisited = group && Array.from(group.querySelectorAll("input"))
          .some((field) => field.dataset.visited === "true");
        if (!attempted.value && issue.element.dataset.visited !== "true" && !groupVisited) continue;
        const container = group || issue.element.closest(".tsa-field-label") || issue.element.closest("label");
        const errorId = `tsa-error-${issue.key}`;
        const error = document.createElement("span");
        error.id = errorId;
        error.className = "tsa-inline-error";
        error.dataset.generatedError = "";
        error.textContent = issue.message;
        if (container?.classList.contains("tsa-field-label")) container.append(error);
        else if (container) container.insertAdjacentElement("afterend", error);
        issue.element.setAttribute("aria-invalid", "true");
        const describedBy = new Set((issue.element.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
        describedBy.add(errorId);
        issue.element.setAttribute("aria-describedby", Array.from(describedBy).join(" "));

        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#${issue.element.id || errorId}`;
        link.textContent = issue.message;
        link.addEventListener("click", (event) => {
          event.preventDefault();
          issue.element.focus();
          issue.element.scrollIntoView({ block: "center", behavior: "smooth" });
        });
        item.append(link);
        summaryList.append(item);
      }
      errorSummary.hidden = !attempted.value || issues.length === 0;

      for (const field of form.querySelectorAll("input, select")) {
        const visited = field.dataset.visited === "true";
        const invalid = issues.some((issue) =>
          issue.element === field || (field.type === "radio" && issue.element.name === field.name),
        );
        field.classList.toggle("tsa-field-error", invalid && (visited || attempted.value));
      }
    };

    form.addEventListener("input", (event) => {
      if (event.target.name === "tel") event.target.value = formatPhone(event.target.value);
      if (event.target.name === "pos" || event.target.name === "prov" || event.target.name === "orgType") {
        updateOrganization();
      } else {
        updateForm();
      }
      saveDraft(form);
    });
    form.addEventListener("change", (event) => {
      if (event.target.name === "pos" || event.target.name === "prov" || event.target.name === "orgType") {
        updateOrganization();
      } else {
        updateForm();
      }
      saveDraft(form);
    });
    form.addEventListener("focusout", (event) => {
      if (event.target.matches("input, select")) {
        event.target.dataset.visited = "true";
        updateForm();
      }
    });
    form.querySelector("#province").addEventListener("change", (event) => {
      const group = event.target.value ? `กลุ่มจังหวัด${provinceGroup(event.target.value)} · ปรับกลุ่มได้ตามประกาศทางการ` : "กลุ่มจังหวัดจะแสดงเมื่อเลือกจังหวัด";
      form.querySelector("#provinceGroup").textContent = group;
    });
    submitPanel.querySelector(".tsa-missing-link").addEventListener("click", () => {
      const state = getRegistrationState(form);
      const firstIssue = getValidationIssues(form, state)[0];
      if (firstIssue) {
        firstIssue.element.focus();
        firstIssue.element.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      attempted.value = true;
      updateForm();
      const state = getRegistrationState(form);
      if (!state.complete) {
        errorSummary.focus();
        return;
      }

      const existing = readJson(STORAGE.applicants, []);
      const now = new Date().toISOString();
      const applicant = {
        id: applicantCode(existing),
        title: state.data.get("title"),
        first: form.elements.first.value.trim(),
        last: form.elements.last.value.trim(),
        prov: state.province,
        provinceGroup: provinceGroup(state.province),
        orgType: state.orgType,
        org: form.elements.org.value.trim(),
        pos: form.elements.pos.value === "อื่น ๆ" ? form.elements.posOther.value.trim() : form.elements.pos.value,
        tel: form.elements.tel.value.replace(/\D/g, ""),
        mail: form.elements.mail.value.trim(),
        rounds: ["r1", "r2"],
        consent: { version: "TSA-PDPA-2569-v1", at: now },
        clinic: form.elements.clinic.checked,
        status: { s: "pending", reasonCode: "", note: "", by: "", at: now },
        createdAt: now,
        updatedAt: now,
        source: "web-demo",
      };
      existing.push(applicant);
      writeJson(STORAGE.applicants, existing);
      writeJson(STORAGE.applicant, applicant);
      const mailLog = readJson(STORAGE.mail, []);
      mailLog.unshift({
        event: "applicant_submitted",
        applicantId: applicant.id,
        recipient: applicant.mail,
        status: "demo_not_sent",
        at: now,
      });
      writeJson(STORAGE.mail, mailLog);
      appendAudit("applicant_submitted", applicant.id, { status: "pending", rounds: applicant.rounds });
      localStorage.removeItem(STORAGE.draft);
      window.location.assign("my.html");
    });
    updateOrganization();
  };

  const initializeMyPage = () => {
    const applicant = readJson(STORAGE.applicant, null);
    const page = document.createElement("main");
    page.className = "tsa-personal-page";
    if (!applicant) {
      page.innerHTML = `
        <section class="tsa-personal-card">
          <h1>การสมัครและคะแนนของฉัน</h1>
          <p>ยังไม่พบใบสมัครที่บันทึกไว้ในเบราว์เซอร์นี้</p>
          <a class="tsa-button-link" href="register.html">เริ่มสมัครเข้าร่วม</a>
        </section>
        <p class="tsa-private-note">หน้านี้เป็นเดโม ข้อมูลไม่ถูกส่งไปยังเซิร์ฟเวอร์ และไม่สามารถใช้ยืนยันตัวตนหรือดูข้อมูลจากอุปกรณ์อื่นได้</p>`;
    } else {
      page.innerHTML = `
        <section class="tsa-personal-card">
          <p>ผู้สมัคร · ${escapeHtml(applicant.rounds.join(" + ").replace("r1", "รอบที่ 1").replace("r2", "รอบที่ 2"))}</p>
          <h1>${escapeHtml(applicant.title)}${escapeHtml(applicant.first)} ${escapeHtml(applicant.last)}</h1>
          <p><strong>รหัสผู้สมัคร:</strong> ${escapeHtml(applicant.id)}</p>
          <p><strong>จังหวัด:</strong> ${escapeHtml(applicant.prov)} · กลุ่มจังหวัด${escapeHtml(applicant.provinceGroup)}</p>
          <p><strong>สถานะ:</strong> รอตรวจสอบใบสมัคร</p>
        </section>
        <section class="tsa-personal-card">
          <h2>สถานะการสมัคร</h2>
          <ol>
            <li>ส่งใบสมัครแล้ว · ${new Date(applicant.createdAt).toLocaleString("th-TH")}</li>
            <li>ตรวจสอบสิทธิ์ · รอดำเนินการ</li>
            <li>รับภารกิจข้อมูล · หลังอนุมัติ</li>
            <li>ร่วมแข่งขันให้ครบทั้ง 2 รอบ</li>
          </ol>
          <p><strong>คะแนน:</strong> ยังไม่มีคะแนนที่ผ่านการรับรอง</p>
          <p><strong>หน่วยงาน:</strong> ${escapeHtml(applicant.org)}</p>
          <p><strong>ตำแหน่ง:</strong> ${escapeHtml(applicant.pos)}</p>
          <p><strong>อีเมล:</strong> ${escapeHtml(applicant.mail)}</p>
        </section>
        <section class="tsa-personal-card">
          <h2>กิจกรรมเพิ่มเติม</h2>
          <p>${applicant.clinic ? "เลือกสมัครคลินิกออนไลน์ครั้งที่ 1 ไว้แล้ว" : "ยังไม่ได้เลือกสมัครคลินิกออนไลน์"}</p>
          <button type="button" class="tsa-clear-demo">ลบข้อมูลเดโมจากอุปกรณ์นี้</button>
        </section>
        <p class="tsa-private-note">ข้อมูลนี้บันทึกเฉพาะในเบราว์เซอร์เครื่องนี้เพื่อสาธิตเท่านั้น ไม่มีระบบเข้าสู่ระบบหรือการส่งอีเมลจริง</p>`;
      page.querySelector(".tsa-clear-demo").addEventListener("click", () => {
        const applicants = readJson(STORAGE.applicants, []).filter((item) => item.id !== applicant.id);
        writeJson(STORAGE.applicants, applicants);
        writeJson(STORAGE.applicant, null);
        window.location.reload();
      });
    }
    const oldContent = document.querySelector("body > div");
    if (oldContent) oldContent.replaceWith(page);
    else document.body.append(page);
  };

  const initializeResultsSearch = () => {
    const search = document.querySelector("#r-q");
    if (!search) return;
    const form = search.closest("form");
    form?.addEventListener("submit", (event) => event.preventDefault());
    const resultsLayout = search.closest("header")?.nextElementSibling;
    const individualColumn = resultsLayout?.firstElementChild;
    const shieldTitle = Array.from(resultsLayout?.querySelectorAll("div") || [])
      .find((element) => element.textContent.trim().startsWith("โล่จังหวัด ·"));
    const provinceBoard = shieldTitle?.parentElement;
    let showProvinceBoard = false;
    const resultRows = Array.from(document.querySelectorAll('div[style*="grid-template-columns: 56px"]'))
      .filter((element) => element.textContent.trim());
    const provinceRows = Array.from(provinceBoard?.querySelectorAll('div[style*="grid-template-columns: 34px"]') || []);
    const resultDisplays = new Map(resultRows.map((row) => [row, getComputedStyle(row).display]));
    const provinceDisplays = new Map(provinceRows.map((row) => [row, getComputedStyle(row).display]));
    const individualDisplay = individualColumn ? getComputedStyle(individualColumn).display : "";
    const provinceBoardDisplay = provinceBoard ? getComputedStyle(provinceBoard).display : "";
    let activeGroup = Array.from(document.querySelectorAll('[role="group"][aria-label="กลุ่มจังหวัด"] button'))
      .find((button) => button.getAttribute("aria-pressed") === "true")?.textContent.trim() || "";
    const applySearch = () => {
      const query = search.value.trim().toLocaleLowerCase("th");
      for (const row of resultRows.slice(1)) {
        const rowText = row.textContent.toLocaleLowerCase("th");
        const province = provinces.find((name) => row.textContent.includes(name));
        const groupMatches = !activeGroup || !province || activeGroup === "จังหวัดทั้งหมด" ||
          activeGroup === `จังหวัด${provinceGroup(province)}` ||
          (activeGroup === "จังหวัดใหญ่" && provinceGroup(province) === "ใหญ่พิเศษ");
        const matches = groupMatches && (query === "" || rowText.includes(query));
        row.hidden = !matches;
        row.style.display = matches ? resultDisplays.get(row) : "none";
      }
      for (const row of provinceRows) {
        const rowText = row.textContent.toLocaleLowerCase("th");
        const province = provinces.find((name) => row.textContent.includes(name));
        const groupMatches = !activeGroup || !province || activeGroup === "จังหวัดทั้งหมด" ||
          activeGroup === `จังหวัด${provinceGroup(province)}` ||
          (activeGroup === "จังหวัดใหญ่" && provinceGroup(province) === "ใหญ่พิเศษ");
        const matches = groupMatches && (query === "" || rowText.includes(query));
        row.hidden = !matches;
        row.style.display = matches ? provinceDisplays.get(row) : "none";
      }
    };
    const updateBoardType = () => {
      if (individualColumn) {
        individualColumn.hidden = showProvinceBoard;
        individualColumn.style.display = showProvinceBoard ? "none" : individualDisplay;
      }
      if (provinceBoard) {
        provinceBoard.hidden = !showProvinceBoard;
        provinceBoard.style.display = showProvinceBoard ? provinceBoardDisplay : "none";
      }
      applySearch();
    };
    search.addEventListener("input", applySearch);
    const submit = form?.querySelector("a");
    if (submit) {
      submit.href = "#";
      submit.addEventListener("click", (event) => {
        event.preventDefault();
        applySearch();
      });
    }
    for (const group of document.querySelectorAll('[role="group"]')) {
      const buttons = Array.from(group.querySelectorAll("button"));
      if (buttons.length < 2) continue;
      buttons.forEach((button) => button.addEventListener("click", () => {
        for (const option of buttons) {
          const selected = option === button;
          option.setAttribute("aria-pressed", String(selected));
          option.style.background = selected ? "#baff19" : "transparent";
          option.style.color = selected ? "#17263D" : "#ffffff";
        }
        if (group.getAttribute("aria-label") === "กลุ่มจังหวัด") {
          activeGroup = button.textContent.trim();
          applySearch();
        }
        if (group.getAttribute("aria-label") === "ประเภท") {
          showProvinceBoard = button.textContent.trim() === "โล่จังหวัด";
          updateBoardType();
        }
      }));
    }
    updateBoardType();
  };

  const initializeAdminNavigation = () => {
    const routes = new Map([
      ["ภารกิจข้อมูล", "admin-tools.html#tasks"],
      ["กลุ่มจังหวัด", "admin-tools.html#groups"],
      ["คำทักท้วง", "admin-tools.html#appeals"],
      ["ประวัติการทำงาน", "admin-tools.html#audit"],
      ["สิทธิ์ผู้ใช้และบทบาท", "admin-tools.html#roles"],
    ]);
    for (const link of document.querySelectorAll('a[href^="#"]')) {
      const route = routes.get(link.textContent.trim());
      if (route) link.href = route;
    }
  };

  const initializeAdminExport = () => {
    const button = Array.from(document.querySelectorAll("button")).find((candidate) =>
      candidate.textContent.includes("ส่งออก CSV"));
    if (!button) return;
    button.addEventListener("click", () => {
      const main = document.querySelector("main");
      const dataRows = Array.from(main.querySelectorAll("div"))
        .filter((row) => row.children.length === 4 &&
          /TSA69-[A-Z0-9]{6}/.test(row.children[0].textContent) &&
          !row.closest("aside") && !row.hidden);
      const header = Array.from(main.querySelectorAll("div"))
        .find((row) => row.children.length === 4 && row.children[0].textContent.trim() === "ผู้สมัคร");
      const rows = [header, ...dataRows].filter(Boolean).map((row) =>
        Array.from(row.children)
          .map((cell) => `"${cell.textContent.trim().replace(/"/g, '""')}"`).join(","));
      if (rows.length < 2) {
        window.alert("ไม่พบตารางผู้สมัครสำหรับส่งออก");
        return;
      }
      const blob = new Blob(["\uFEFF", rows.join("\r\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "tsa-applicants-demo.csv";
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  };

  const initializeAdminApplicants = () => {
    const main = document.querySelector("main");
    const search = main?.querySelector("#a-q");
    if (!search) return;
    const tableRows = Array.from(main.querySelectorAll("div")).filter((row) => row.children.length === 4);
    const header = tableRows.find((row) =>
      row.children[0].textContent.trim() === "ผู้สมัคร");
    const rows = tableRows.filter((row) =>
      /TSA69-[A-Z0-9]{6}/.test(row.children[0].textContent) && !row.closest("aside"));
    const rowDisplays = new Map(rows.map((row) => [row, getComputedStyle(row).display]));
    const statusButtons = Array.from(main.querySelectorAll('[role="group"][aria-label="สถานะ"] button'));
    const groupSelect = main.querySelector('select[aria-label="กลุ่มจังหวัด"]');
    const countLabel = Array.from(main.querySelectorAll("span"))
      .find((element) => element.textContent.trim().startsWith("ผู้สมัครทั้งหมด"));
    const details = main.querySelector("aside");
    const statusStoreKey = "tsaChallenge.applicantStatuses";
    const statuses = readJson(statusStoreKey, {});
    let activeStatus = statusButtons.find((button) => button.getAttribute("aria-pressed") === "true")?.textContent.trim() || "ทั้งหมด";

    if (groupSelect.options.length) groupSelect.options[0].value = "";
    for (const group of ["เล็ก", "กลาง", "ใหญ่", "ใหญ่พิเศษ"]) {
      groupSelect.add(new Option(`จังหวัด${group}`, group));
    }
    const reasonSelect = details?.querySelector("select");
    if (reasonSelect) {
      reasonSelect.innerHTML = `<option value="">— เลือกเหตุผล —</option>
        <option value="ineligible">ไม่เข้าเงื่อนไขผู้สมัคร</option>
        <option value="duplicate">สมัครซ้ำ</option>
        <option value="invalid-contact">ข้อมูลติดต่อไม่ถูกต้อง</option>
        <option value="other">อื่น ๆ</option>`;
    }

    for (const row of rows) {
      const code = row.textContent.match(/TSA69-[A-Z0-9]{6}/)?.[0];
      if (!code || !statuses[code]) continue;
      const badge = row.children[3];
      badge.textContent = statuses[code].s === "approved" ? "อนุมัติ" : "ไม่อนุมัติ";
    }

    const applyFilters = () => {
      const query = search.value.trim().toLocaleLowerCase("th");
      const group = groupSelect.value;
      let visible = 0;
      for (const row of rows) {
        const code = row.textContent.match(/TSA69-[A-Z0-9]{6}/)?.[0];
        const status = code && statuses[code]
          ? (statuses[code].s === "approved" ? "อนุมัติ" : "ไม่อนุมัติ")
          : row.children[3].textContent.trim();
        const groupMatch = !group || row.children[1].textContent.includes(`· ${group.replace("จังหวัด", "")}`);
        const matches = row.textContent.toLocaleLowerCase("th").includes(query) &&
          (activeStatus === "ทั้งหมด" || status === activeStatus) && groupMatch;
        row.hidden = !matches;
        row.style.display = matches ? rowDisplays.get(row) : "none";
        if (matches) visible += 1;
      }
      if (countLabel) countLabel.textContent = `แสดง ${visible} จาก ${rows.length} รายการในเดโม`;
    };

    search.addEventListener("input", applyFilters);
    groupSelect.addEventListener("change", applyFilters);
    for (const button of statusButtons) {
      button.addEventListener("click", () => {
        activeStatus = button.textContent.trim();
        for (const option of statusButtons) {
          const selected = option === button;
          option.setAttribute("aria-pressed", String(selected));
          option.style.background = selected ? "#17263D" : "transparent";
          option.style.color = selected ? "#baff19" : "#17263D";
        }
        applyFilters();
      });
    }

    const selectedCode = details?.textContent.match(/TSA69-[A-Z0-9]{6}/)?.[0];
    const selectedRow = rows.find((row) => row.textContent.includes(selectedCode || ""));
    const [approveButton, rejectButton] = Array.from(details?.querySelectorAll("button") || []);
    const recordDecision = (decision) => {
      if (!selectedCode || !selectedRow) {
        window.alert("ไม่พบผู้สมัครที่เลือก");
        return;
      }
      const reason = reasonSelect?.value || "";
      if (decision === "rejected" && !reason) {
        window.alert("กรุณาเลือกเหตุผลก่อนปฏิเสธใบสมัคร");
        reasonSelect?.focus();
        return;
      }
      const prior = statuses[selectedCode]?.s || selectedRow.children[3].textContent.trim();
      if (prior === decision) {
        window.alert(`ใบสมัครนี้มีสถานะ${decision === "approved" ? "อนุมัติแล้ว" : "ไม่อนุมัติแล้ว"}`);
        return;
      }
      const actionLabel = decision === "approved" ? "อนุมัติ" : "ไม่อนุมัติ";
      if (!window.confirm(`ยืนยัน${actionLabel}ใบสมัคร ${selectedCode} ในเดโมนี้หรือไม่?`)) return;
      const now = new Date().toISOString();
      const detailsText = decision === "rejected" ? reason : "";
      statuses[selectedCode] = { s: decision, reasonCode: detailsText, by: "ผู้อนุมัติ (เดโม)", at: now };
      writeJson(statusStoreKey, statuses);
      selectedRow.children[3].textContent = actionLabel;
      selectedRow.children[3].style.background = decision === "approved" ? "#EAF5FF" : "#17263D";
      selectedRow.children[3].style.color = decision === "approved" ? "#17263D" : "#FFFFFF";
      appendAudit(`applicant_${decision}`, selectedCode, { before: prior, after: actionLabel, reason: detailsText }, "ผู้อนุมัติ (เดโม)");
      const mailLog = readJson(STORAGE.mail, []);
      mailLog.unshift({ event: `applicant_${decision}`, applicantId: selectedCode, status: "demo_not_sent", at: now });
      writeJson(STORAGE.mail, mailLog);
      const history = details.querySelector("div[style*='border-top: 2px solid']");
      if (history) {
        const item = document.createElement("div");
        item.style.cssText = "font-size:14px;padding:3px 0";
        item.textContent = `${actionLabel} · ผู้อนุมัติ (เดโม) · ${new Date(now).toLocaleString("th-TH")}${detailsText ? ` · ${detailsText}` : ""}`;
        history.append(item);
      }
      applyFilters();
    };
    approveButton?.addEventListener("click", () => recordDecision("approved"));
    rejectButton?.addEventListener("click", () => recordDecision("rejected"));

    const addButton = Array.from(main.querySelectorAll("button"))
      .find((button) => button.textContent.includes("เพิ่มผู้สมัคร"));
    const rowContainer = header?.parentElement;
    if (addButton && rowContainer) {
      const dialog = document.createElement("dialog");
      dialog.className = "tsa-applicant-dialog";
      const provinceOptions = provinces.map((province) =>
        `<option value="${escapeHtml(province)}">${escapeHtml(province)}</option>`).join("");
      dialog.innerHTML = `
        <form method="dialog" id="adminApplicantForm">
          <h2>เพิ่มผู้สมัครในเดโม</h2>
          <label>คำนำหน้า<select name="title" required><option value="">เลือกคำนำหน้า</option><option>นาย</option><option>นาง</option><option>นางสาว</option></select></label>
          <label>จังหวัด<select name="prov" required><option value="">เลือกจังหวัด</option>${provinceOptions}</select></label>
          <label>ชื่อ<input name="first" autocomplete="given-name" required></label>
          <label>นามสกุล<input name="last" autocomplete="family-name" required></label>
          <label>หน่วยงาน<input name="org" required></label>
          <label>ตำแหน่ง<input name="pos" required></label>
          <label>โทรศัพท์<input name="tel" inputmode="numeric" required></label>
          <label>อีเมล<input name="mail" type="email" required></label>
          <label class="tsa-dialog-consent"><input name="consent" type="checkbox" required>ยืนยันว่าตรวจสอบความยินยอมแล้ว</label>
          <p>รายการนี้จะบันทึกในเครื่องนี้เท่านั้น ไม่ส่งอีเมลจริง</p>
          <div class="tsa-dialog-actions">
            <button type="button" data-cancel>ยกเลิก</button>
            <button type="submit">บันทึกผู้สมัคร</button>
          </div>
        </form>`;
      document.body.append(dialog);
      addButton.addEventListener("click", () => dialog.showModal());
      dialog.querySelector("[data-cancel]").addEventListener("click", () => dialog.close());
      dialog.querySelector("form").addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const existing = readJson(STORAGE.applicants, []);
        const tel = String(data.get("tel")).replace(/\D/g, "");
        if (!/^0\d{8,9}$/.test(tel)) {
          window.alert("หมายเลขโทรศัพท์ต้องขึ้นต้นด้วย 0 และมี 9–10 หลัก");
          return;
        }
        const first = String(data.get("first")).trim();
        const last = String(data.get("last")).trim();
        const mail = String(data.get("mail")).trim().toLowerCase();
        const duplicates = existing.filter((applicant) =>
          applicant.tel === tel || applicant.mail?.toLowerCase() === mail ||
          (applicant.first === first && applicant.last === last));
        if (duplicates.length) {
          window.alert(`พบข้อมูลคล้ายกับ ${duplicates.map((item) => item.id).join(", ")} กรุณาตรวจสอบก่อนบันทึก`);
        }
        const now = new Date().toISOString();
        const applicant = {
          id: applicantCode(existing),
          title: String(data.get("title")),
          first,
          last,
          prov: String(data.get("prov")),
          provinceGroup: provinceGroup(String(data.get("prov"))),
          orgType: "admin_entry",
          org: String(data.get("org")).trim(),
          pos: String(data.get("pos")).trim(),
          tel,
          mail,
          rounds: ["r1", "r2"],
          consent: { version: "TSA-PDPA-2569-v1", at: now },
          clinic: false,
          status: { s: "pending", reasonCode: "", note: "", by: "ผู้ดูแลระบบ (เดโม)", at: now },
          createdAt: now,
          updatedAt: now,
          source: "admin-demo",
        };
        existing.push(applicant);
        writeJson(STORAGE.applicants, existing);
        appendAudit("applicant_created", applicant.id, { status: "pending" }, "ผู้ดูแลระบบ (เดโม)");
        const row = document.createElement("div");
        row.style.cssText = "display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr) 110px 96px;gap:10px;align-items:center;padding:10px 14px;border-top:1.5px solid #d6e2f0;background:#fff";
        row.innerHTML = `
          <span style="min-width:0"><span style="display:block;font-weight:700">${escapeHtml(`${applicant.title}${applicant.first} ${applicant.last}`)}</span><span style="display:block;font-size:13.5px;color:#4a5a70">${escapeHtml(applicant.id)} · ${escapeHtml(applicant.pos)}</span></span>
          <span style="min-width:0;font-size:14.5px"><span style="display:block;font-weight:700">${escapeHtml(applicant.prov)} · ${escapeHtml(applicant.provinceGroup)}</span><span style="display:block;color:#4a5a70;font-size:13.5px">${escapeHtml(applicant.org)}</span></span>
          <span style="font-size:14px;color:#3e4f66">${escapeHtml(new Date(now).toLocaleDateString("th-TH"))}</span>
          <span style="justify-self:start;font-size:13px;font-weight:800;border-radius:999px;padding:2px 10px;background:#baff19;color:#17263d">รออนุมัติ</span>`;
        rowContainer.append(row);
        rows.push(row);
        rowDisplays.set(row, "grid");
        applyFilters();
        dialog.close();
        event.currentTarget.reset();
      });
    }
    applyFilters();
  };

  const initializeAdminTools = () => {
    const main = document.querySelector("main[data-admin-tools]");
    if (!main) return;
    const applicants = readJson(STORAGE.applicants, []);
    const applicantSelect = main.querySelector("#taskApplicant");
    const applicantOptions = applicants.map((applicant) =>
      `<option value="${escapeHtml(applicant.id)}">${escapeHtml(applicant.id)} · ${escapeHtml(applicant.first)} ${escapeHtml(applicant.last)}</option>`,
    ).join("");
    applicantSelect.innerHTML = applicants.length
      ? `<option value="">เลือกผู้สมัคร</option>${applicantOptions}`
      : '<option value="">ยังไม่มีผู้สมัครเดโมในเบราว์เซอร์นี้</option>';
    applicantSelect.disabled = applicants.length === 0;

    const tasks = readJson("tsaChallenge.tasks", []);
    const taskForm = main.querySelector("#taskForm");
    taskForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const taskData = new FormData(taskForm);
      const applicantId = String(taskData.get("applicantId") || "");
      const round = String(taskData.get("round") || "");
      const assigned = Number(taskData.get("assigned"));
      if (!applicantId || !Number.isInteger(assigned) || assigned < 1) {
        window.alert("เลือกผู้สมัครและระบุจำนวนภารกิจอย่างน้อย 1 รายการ");
        return;
      }
      const prior = tasks.find((task) => task.applicantId === applicantId && task.round === round);
      if (prior && assigned < prior.assigned) {
        window.alert("ไม่สามารถลดเป้าหมายภารกิจย้อนหลังได้");
        return;
      }
      const now = new Date().toISOString();
      const record = {
        applicantId,
        round,
        assigned,
        recordId: String(taskData.get("recordId") || "").trim(),
        kind: String(taskData.get("kind") || "new"),
        assignedBy: "ผู้ดูแลระบบ (เดโม)",
        status: "assigned",
        at: now,
      };
      if (prior) Object.assign(prior, record);
      else tasks.push(record);
      writeJson("tsaChallenge.tasks", tasks);
      appendAudit("task_assigned", applicantId, { round, assigned, recordId: record.recordId }, "ผู้ดูแลระบบ (เดโม)");
      taskForm.reset();
      renderTaskList();
      renderAudit();
    });

    const renderTaskList = () => {
      const list = main.querySelector("#taskList");
      const currentTasks = readJson("tsaChallenge.tasks", []);
      list.innerHTML = currentTasks.length
        ? currentTasks.map((task) => `<li>${escapeHtml(task.applicantId)} · ${escapeHtml(task.round)} · ${escapeHtml(task.assigned)} ภารกิจ</li>`).join("")
        : "<li>ยังไม่มีภารกิจที่มอบหมายในเดโมนี้</li>";
    };

    const renderGroups = () => {
      const overrides = readJson(STORAGE.groups, {});
      const table = main.querySelector("#provinceGroupRows");
      table.innerHTML = provinces.map((province) => {
        const group = overrides[province] || provinceGroup(province);
        const options = ["เล็ก", "กลาง", "ใหญ่", "ใหญ่พิเศษ"].map((item) =>
          `<option value="${item}"${item === group ? " selected" : ""}>${item}</option>`).join("");
        return `<tr><th scope="row">${escapeHtml(province)}</th><td><label class="tsa-field-label"><span class="sr-only">กลุ่มจังหวัด${escapeHtml(province)}</span><select data-province="${escapeHtml(province)}">${options}</select></label></td></tr>`;
      }).join("");
      for (const select of table.querySelectorAll("select")) {
        select.addEventListener("change", () => {
          const current = readJson(STORAGE.groups, {});
          current[select.dataset.province] = select.value;
          writeJson(STORAGE.groups, current);
          appendAudit("province_group_updated", select.dataset.province, { group: select.value }, "ผู้ดูแลระบบ (เดโม)");
          renderGroups();
          renderAudit();
        });
      }
    };

    const renderAppeals = () => {
      const list = main.querySelector("#appealList");
      const appeals = readJson("tsaChallenge.appeals", []);
      list.innerHTML = appeals.length
        ? appeals.map((appeal) => `<li>${escapeHtml(appeal.applicantId)} · รอบ ${escapeHtml(appeal.round)} · ${escapeHtml(appeal.status)}</li>`).join("")
        : "<li>ยังไม่มีคำทักท้วงในเดโมนี้</li>";
    };

    const renderAudit = () => {
      const list = main.querySelector("#auditList");
      const log = readJson(STORAGE.audit, []);
      list.innerHTML = log.length
        ? log.map((entry) => `<li><strong>${escapeHtml(entry.action)}</strong> · ${escapeHtml(entry.target)} · ${escapeHtml(new Date(entry.at).toLocaleString("th-TH"))} · ${escapeHtml(entry.actor)}</li>`).join("")
        : "<li>ยังไม่มีรายการในประวัติการทำงาน</li>";
    };

    const appealForm = main.querySelector("#appealForm");
    const now = new Date();
    const appealStart = new Date("2027-01-04T00:00:00");
    const appealEnd = new Date("2027-01-07T23:59:59");
    const appealOpen = now >= appealStart && now <= appealEnd;
    for (const field of appealForm.elements) field.disabled = !appealOpen;
    appealForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!appealOpen) return;
      const appealData = new FormData(appealForm);
      const applicant = readJson(STORAGE.applicant, null);
      if (!applicant) {
        window.alert("เดโมนี้ต้องมีใบสมัครบนอุปกรณ์นี้ก่อนยื่นคำทักท้วง");
        return;
      }
      const appeals = readJson("tsaChallenge.appeals", []);
      const appeal = {
        applicantId: applicant.id,
        round: String(appealData.get("round")),
        itemRef: String(appealData.get("itemRef")).trim(),
        reason: String(appealData.get("reason")).trim(),
        status: "pending",
        at: new Date().toISOString(),
      };
      appeals.push(appeal);
      writeJson("tsaChallenge.appeals", appeals);
      appendAudit("appeal_submitted", applicant.id, { round: appeal.round, itemRef: appeal.itemRef });
      appealForm.reset();
      renderAppeals();
      renderAudit();
    });
    main.querySelector("#appealAvailability").textContent = appealOpen
      ? "เปิดรับคำทักท้วง 4–7 ม.ค. 2570"
      : "ยังไม่เปิดรับคำทักท้วง · เปิด 4–7 ม.ค. 2570";
    renderTaskList();
    renderGroups();
    renderAppeals();
    renderAudit();
  };

  const pathname = location.pathname.toLowerCase();
  installStyles();
  if (pathname.endsWith("register.html") || pathname.endsWith("m-register.html")) initializeRegistration();
  if (pathname.endsWith("my.html")) initializeMyPage();
  if (pathname.endsWith("results.html")) initializeResultsSearch();
  if (pathname.includes("admin")) {
    initializeAdminNavigation();
    initializeAdminExport();
  }
  if (pathname.includes("admin-applicants")) initializeAdminApplicants();
  initializeAdminTools();
})();

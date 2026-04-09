let steps = 0;
let lastStepTime = 0;

// حساسية الحركة
let threshold = 13;
let minStepInterval = 700;

// تتبع الحركة
let lastMagnitude = 0;
let peakDetected = false;

// تتبع الاتجاه
let lastY = 0;
let directionChanges = 0;

// تجاهل الحركات الصغيرة
let noiseThreshold = 2;

// ➕ إضافة فقط
let started = false;

// ➕ العبارات (إضافة فقط)
let messages = [
  "هدفنــا 1500 خطوة نحو الأفضل ",
  "هدفنــا كل خطوة ... تبني نمط حياة أكثر صحة   ",
  "هدفنــا  مع كل خطوة ... بيئة أنقى وهواء أنظف  ",
  "هدفنــا بخطواتك ... تنمو مدينة أكثر خضرة واستدامة  ",
  "هدفنــا اتبع الممر الذكي ... خطوتك في الأمان  ",
  "هدفنــا بخطواتك ... نبني مجتمع أكثر نشاط ",
  "هدفنــا مع كل خطوة ... نعيد للطبيعة توازنها  ",
  "هدفنــا التزامك  ... طريق أكثر أمان للجميع ",
  "هدفنــا مع كل خطوة ... طاقة أكثر وحياة أجمل  ",
  "هدفنــا مع كل خطوة ... نحمي الأرواح قبل الوصول ",
  "هدفنــا خطوة منك ... تعزز صحتك كل يوم ",
  "هدفنــا خطوة منك ... تزرع أمل لمستقبل أخضر ",
  "هدفنــا انتباهك ... يصنع فرق في سلامة الطريق ",
  "هدفنــا انتباهك ... يحميك من المخاطر  ",
  "هدفنــا كل خطوة ... استثمار في صحتك ",
];

// ➕ جديد (فقط)
let goalReached = false;

// ✅ إذا خلص → يروح للشكر مباشرة
if (localStorage.getItem("finished")) {
  window.location.replace("thanks.html");
}

// ✅ إذا ما فيه بيانات → يرجع للبداية
if (!localStorage.getItem("name")) {
  window.location.replace("index.html");
}

// ➕ هذا فقط الجديد
function handleAction() {
  let btn = document.getElementById("actionBtn");

  if (!started) {
    start();
    started = true;

    btn.innerText = "إنهاء";
    btn.setAttribute("data-state", "end");

  } else {
    finish();
  }
}

function start() {
  requestPermission();
}

function requestPermission() {
  if (
    typeof DeviceMotionEvent !== "undefined" &&
    typeof DeviceMotionEvent.requestPermission === "function"
  ) {
    DeviceMotionEvent.requestPermission()
      .then((response) => {
        if (response === "granted") {
          startCounting();
        } else {
          alert("يجب السماح بالحركة  ");
        }
      })
      .catch(console.error);
  } else {
    startCounting();
  }
}

function startCounting() {
  window.addEventListener("devicemotion", function (event) {
    let acc = event.accelerationIncludingGravity;
    if (!acc) return;

    let magnitude = Math.sqrt(
      acc.x * acc.x + acc.y * acc.y + acc.z * acc.z
    );

    let now = Date.now();

    if (Math.abs(magnitude - lastMagnitude) < noiseThreshold) {
      return;
    }

    if ((acc.y > 0 && lastY <= 0) || (acc.y < 0 && lastY >= 0)) {
      directionChanges++;
    }

    if (magnitude > threshold && magnitude > lastMagnitude) {
      peakDetected = true;
    }

    if (
      peakDetected &&
      directionChanges >= 2 &&
      now - lastStepTime > minStepInterval
    ) {
      steps++;
      document.getElementById("steps").innerText = steps;

      // ➕ تحديث النص
      let index = Math.floor(steps / 100);
      if (index >= messages.length) index = messages.length - 1;
      document.getElementById("motivationText").innerText =
        messages[index];

      // 🔥🔥🔥 الإضافة المطلوبة فقط
      if (steps >= 1500 && !goalReached) {
        goalReached = true;

        showGoalPopup();
      }

      lastStepTime = now;

      peakDetected = false;
      directionChanges = 0;
    }

    lastMagnitude = magnitude;
    lastY = acc.y;
  });
}

// 🔥 popup function (إضافة فقط)
function showGoalPopup() {
  let popup = document.createElement("div");
  popup.id = "goalPopup";

  popup.innerHTML = `
    <div class="popupBox">
      <h3>🎉 مبروك</h3>
      <p>وصـلـت لـهـدفـــك 1500 خطوة 👏</p>
      <button onclick="closePopup()">استمر في التقدم</button>
    </div>
  `;

  document.body.appendChild(popup);
}

// 🔥 إغلاق popup (إضافة فقط)
function closePopup() {
  let popup = document.getElementById("goalPopup");
  if (popup) popup.remove();
}

function finish() {
  if (steps < 5) {
    alert("لا يمكن إنهاء المشاركة قبل تسجيل عدد كافٍ من الخطوات");
    return;
  }

  let name = localStorage.getItem("name");
  let phone = localStorage.getItem("phone");

  fetch(
    "https://script.google.com/macros/s/AKfycbxnC4XtEQoYc2ufFOCOo1bT9B2j97Bg9Gs5V89H-bfzhuORMAJ1ciSbcYxA-rVL3Yd-/exec",
    {
      method: "POST",
      body: JSON.stringify({
        name: name,
        phone: phone,
        steps: steps,
      }),
    }
  )
    .then(() => {
      localStorage.setItem("finished", "true");
      localStorage.removeItem("name");
      localStorage.removeItem("phone");

      window.location.replace("thanks.html");
    })
    .catch(() => {
      alert(" خطأ في الإرسال ❌");
    });
}
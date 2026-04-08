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
  "هدفنــا خطوة منك ... تقلل خطراً على الطريق  ",
  "هدفنــا بخطواتك ... تنمو مدينة أكثر خضرة واستدامة  ",
  "هدفنــا اتبع المملر الذكي ... خطوتك في الأمان  ",
];

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
  let btn = document.getElementById("actionBtn"); // 👈 أضفنا هذا فقط

  if (!started) {
    start();
    started = true;

    btn.innerText = "إنهاء";
    btn.setAttribute("data-state", "end"); // 👈 هذا السطر الجديد فقط

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

      // ➕ تحديث النص كل 300 خطوة (إضافة فقط)
      let index = Math.floor(steps / 300);
      if (index >= messages.length) index = messages.length - 1;
      document.getElementById("motivationText").innerText =
        messages[index];

      lastStepTime = now;

      peakDetected = false;
      directionChanges = 0;
    }

    lastMagnitude = magnitude;
    lastY = acc.y;
  });
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
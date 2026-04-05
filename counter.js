let steps = 0;
let lastUpdate = 0;

// تأكد فيه بيانات (حماية)
if (!localStorage.getItem("name")) {
  window.location.href = "index.html";
}

// طلب إذن الحركة (مهم لآيفون 👀)
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
          alert("يجب السماح بالحركة لحساب الخطوات");
        }
      })
      .catch(console.error);
  } else {
    startCounting();
  }
}

// بدء العد
function startCounting() {
  window.addEventListener("devicemotion", function (event) {
    let acc = event.accelerationIncludingGravity;
    let now = Date.now();

    // فلترة عشان ما يحسب كل اهتزاز
    if (acc.x > 12 || acc.y > 12 || acc.z > 12) {
      if (now - lastUpdate > 500) {
        steps++;
        document.getElementById("steps").innerText = steps;
        lastUpdate = now;
      }
    }
  });
}

// زر إنهاء 🔥 (مربوط مع Google Sheets)
function finish() {
  if (steps < 10) {
    alert("امشي شوي أول 😅");
    return;
  }

  let name = localStorage.getItem("name");
  let phone = localStorage.getItem("phone");

  fetch("https://script.google.com/macros/s/AKfycbxnC4XtEQoYc2ufFOCOo1bT9B2j97Bg9Gs5V89H-bfzhuORMAJ1ciSbcYxA-rVL3Yd-/exec", {
    method: "POST",
    body: JSON.stringify({
      name: name,
      phone: phone,
      steps: steps
    })
  })
    .then(() => {
      alert("تم تسجيل نتيجتك 👏");

      // تنظيف البيانات
      localStorage.clear();

      // يرجعه للبداية (اختياري 👀)
      window.location.href = "index.html";
    })
    .catch(() => {
      alert("صار خطأ في الإرسال ❌");
    });
}

// تشغيل عند فتح الصفحة
requestPermission();
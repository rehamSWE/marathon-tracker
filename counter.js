let steps = 0;
let lastStepTime = 0;

// حساسية الحركة
let threshold = 9;
let minStepInterval = 600;

// تتبع الحركة
let lastMagnitude = 0;
let peakDetected = false;

// تتبع الاتجاه
let lastY = 0;
let directionChanges = 0;

// تجاهل الحركات الصغيرة
let noiseThreshold = 1;

// ➕ إضافة فقط
let started = false;

// 🔊 صوت الرسائل
let messageSound = new Audio("sounds/1.mp3");

// 🔊 صوت الهدف
let goalSound = new Audio("sounds/goal.wav");

// 🔓 حل مشكلة الصوت
function unlockAudio() {
  messageSound.play().then(() => {
    messageSound.pause();
    messageSound.currentTime = 0;
  }).catch(()=>{});

  goalSound.play().then(() => {
    goalSound.pause();
    goalSound.currentTime = 0;
  }).catch(()=>{});
}

// ➕ العبارات
let messages = [
"هدفنــا  مع كل خطوة .. بيئة أنقى وهواء أنظف  ",
"هدفنــا بخطواتك .. نبني مجتمع أكثر نشاط ",
"هدفنــا انتباهك .. يصنع فرق في سلامة الطريق ",
" مديـنـتـك أمــانــة .. فاجعلها خضراء ",
"جــســد نـشـيــط .. عقل صافي وحياة أفضل ",
" كــن واعــياً .. تصل سالمًا ",
" التشجير روح المدينة المستدامة ",
"هدفنــا مع كل خطوة .. طاقة أكثر وحياة أجمل  ",
" الـتفاعــل مـع الـمـمـر الــذكـي .. سلوك حضاري ",
"المدن الخضراء تبدأ بخطوة صغيرة  ",
"هدفنــا كل خطوة .. تبني نمط حياة أكثر صحة   ",
"هدفنــا اتبع الممر الذكي .. خطوتك في الأمان  ",
" البيئة النظيفة تبدأ بمساحة خضراء ",
" كـــل خـــطــوة .. تقرّبك من نسخة أقوى منك ",
"هدفنــا انتباهك .. يحميك من المخاطر  ",
"التشجير روح المدينة المستدامة  ",
"هدفنــا كل خطوة .. استثمار في صحتك ",
" سـلامتك تبدأ بخطوة واعية ",
" ازرعـــهـا الـيــوم .. لتظلك غدًا ",
"هدفنــا خطوة منك .. تعزز صحتك كل يوم ",
" الممر الـذكـي يــوجّـهـك .. فاستجب له ",
"هدفنــا  مع كل خطوة .. بيئة أنقى وهواء أنظف  ",
"هدفنــا التزامك  .. طريق أكثر أمان للجميع ",
" طـــريــق آمـــن .. مجتمع مطمئن "
];

let goalReached = false;

// 🔥 أهم متغير (stage)
let lastStage = 0;

// 🔊 تشغيل صوت الهدف
function playGoalSound() {
  goalSound.currentTime = 0;
  goalSound.play().catch(()=>{});
}

if (localStorage.getItem("finished")) {
  window.location.replace("thanks.html");
}

if (!localStorage.getItem("name")) {
  window.location.replace("index.html");
}

function handleAction() {
  let btn = document.getElementById("actionBtn");

  if (!started) {

    unlockAudio(); // 🔥 فتح الصوت أولاً
    setTimeout(() => {
      playGoalSound(); // 🔊 ثم تشغيله
    }, 100);

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
          alert("يجب السماح بالحركة");
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

    let smooth = (magnitude + lastMagnitude) / 2;

    if (smooth > 4 && smooth < 15) {

      if (
        directionChanges >= 0 &&
        now - lastStepTime > minStepInterval
      ) {
        steps++;
        document.getElementById("steps").innerText = steps;

        let textEl = document.getElementById("motivationText");

        let currentStage = Math.floor(steps / 50);

        if (currentStage > lastStage) {
          lastStage = currentStage;

          let index = (currentStage - 1) % messages.length;
          if (index < 0) index = 0;

          textEl.classList.remove("fade");
          void textEl.offsetWidth;
          textEl.innerText = messages[index];
          textEl.classList.add("fade");

          // 🔊 صوت الرسائل
          messageSound.currentTime = 0;
          messageSound.play().catch(()=>{});

          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
        }

        if (steps >= 1500 && !goalReached) {
          goalReached = true;

          playGoalSound();

          if (navigator.vibrate) {
            navigator.vibrate([300, 100, 300]);
          }

          showGoalPopup();
        }

        lastStepTime = now;
        directionChanges = 0;
      }
    }

    lastMagnitude = magnitude;
    lastY = acc.y;
  });
}

function showGoalPopup() {
  let popup = document.createElement("div");
  popup.id = "goalPopup";

  popup.innerHTML = `
    <div class="popupBox">
      <h3>🎉 مبروك</h3>
      <p>وصـلـت لـهـدفـــك 1500 خطوة</p>
      <button onclick="closePopup()">استمر في التقدم</button>
    </div>
  `;

  document.body.appendChild(popup);
}

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
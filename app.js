function loadDate() {
  const now = new Date();
  document.getElementById("datetime").value = now.toLocaleString("ja-JP");
}
loadDate();

// -------------------------------
// ◆ 完璧治療アドバイス辞書
// -------------------------------
const treatmentPatterns = [
  {
    type: "擦り傷",
    keywords: ["擦り傷","すり傷","転んで","こす", "表皮"],
    advice:
      "1) 傷口を流水でよく洗う\n2) 汚れを除去\n3) 消毒\n4) 清潔なガーゼ保護\n5) 血が止まらなければ圧迫止血"
  },
  {
    type: "切り傷",
    keywords: ["切り","刃物","カッター","切創"],
    advice:
      "1) 水で洗浄\n2) 清潔な布で5～10分圧迫止血\n3) 深い場合は医療機関へ\n4) 消毒しガーゼ固定"
  },
  {
    type: "打撲",
    keywords: ["打撲","ぶつけ","青あざ","腫れ"],
    advice:
      "RICE処置\nR：安静\nI：冷却10〜20分\nC：軽い圧迫\nE：心臓より高く保つ\n腫れが数日引かなければ受診"
  },
  {
    type: "捻挫",
    keywords: ["捻挫","ひねり","関節","足首","手首"],
    advice:
      "RICE処置\n激痛・変形がある場合は骨折の可能性 → 医療機関へ"
  },
  {
    type: "出血",
    keywords: ["出血","血が","流血"],
    advice:
      "1) 清潔なガーゼで強めに圧迫\n2) 5〜10分継続\n3) 止まらなければ受診\n4) 多量の血は救急推奨"
  },
  {
    type: "火傷",
    keywords: ["火傷","やけど","熱","炎","火"],
    advice:
      "1) 10〜20分流水で冷却\n2) 水ぶくれは潰さない\n3) 服が皮膚に貼り付いた場合は無理に剥がさない\n4) 広範囲なら受診"
  },
  {
    type: "骨折疑い",
    keywords: ["骨","折れ","変形","強い痛み","動かせない"],
    advice:
      "1) 患部を動かさず固定\n2) 氷で軽く冷却\n3) 速やかに医療機関へ\n※絶対に無理に動かさないこと"
  }
];

// -------------------------------
// ◆ 自動診断ロジック
// -------------------------------
function generateAdvice(text) {
  text = text.replace(/\s/g, "");

  for (const pattern of treatmentPatterns) {
    for (const key of pattern.keywords) {
      if (text.includes(key)) {
        return `【診断】${pattern.type}\n\n【推奨治療法】\n${pattern.advice}`;
      }
    }
  }

  return "症状から明確な診断ができません。\n安全のため、痛み・腫れが続く場合は医療機関を推奨します。";
}

// 入力に反応してリアルタイム表示
document.getElementById("detailInput").addEventListener("input", function () {
  const advice = generateAdvice(this.value);
  document.getElementById("adviceText").innerText = advice;
});

// -------------------------------
// ◆ 事故記録保存
// -------------------------------
function loadLogs() {
  return JSON.parse(localStorage.getItem("accidentLogs") || "[]");
}
function saveLogs(logs) {
  localStorage.setItem("accidentLogs", JSON.stringify(logs));
}

// -------------------------------
// ◆ 表描画
// -------------------------------
const tableBody = document.querySelector("#logTable tbody");

function renderTable() {
  const logs = loadLogs();
  tableBody.innerHTML = "";

  logs.forEach((log, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${log.datetime}</td>
      <td>${log.name}</td>
      <td>${log.place}</td>
      <td>${log.level}</td>
      <td>${log.detail}</td>
      <td>${log.advice.replace(/\n/g,"<br>")}</td>
      <td><button class="delete-btn" data-index="${index}">削除</button></td>
    `;

    tableBody.appendChild(tr);
  });
}
renderTable();

// -------------------------------
// ◆ 記録＋治療法保存
// -------------------------------
document.getElementById("accidentForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(this));
  data.advice = generateAdvice(data.detail);

  const logs = loadLogs();
  logs.push(data);
  saveLogs(logs);

  document.getElementById("msg").innerText = "記録し、治療法を生成しました。";
  renderTable();
  this.reset();
  loadDate();
});

// -------------------------------
// ◆ 削除
// -------------------------------
tableBody.addEventListener("click", function(e){
  if (!e.target.classList.contains("delete-btn")) return;

  const index = e.target.dataset.index;
  const logs = loadLogs();
  logs.splice(index, 1);
  saveLogs(logs);
  renderTable();
});

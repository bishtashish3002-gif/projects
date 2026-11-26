const fileInput = document.querySelector("#pdf-file"),
  status = document.querySelector("#pdf-status"),
  quizForm = document.querySelector("#quiz-form"),
  empty = document.querySelector("#quiz-empty"),
  result = document.querySelector("#quiz-result"),
  quizActions = document.querySelector("#quiz-actions");
let questions = [];
const stopWords = new Set(
  "about after again also among another because before being between could different every from have into just more most much only other over should some such than that their there these they this through under very were what when where which while with would your".split(
    " ",
  ),
);
fileInput.addEventListener(
  "change",
  () =>
    (document.querySelector("#file-name").textContent =
      fileInput.files[0]?.name || "No file selected"),
);
function cleanText(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1. $2")
    .trim();
}
function words(sentence) {
  return (
    sentence
      .toLowerCase()
      .match(/[a-z][a-z-]{3,}/g)
      ?.filter((word) => !stopWords.has(word)) || []
  );
}
function pickAnswer(sentence, used) {
  const candidates = words(sentence).filter((word) => !used.has(word));
  return candidates.sort((a, b) => b.length - a.length)[0] || null;
}
function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}
function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function makeQuestions(text, count) {
  const sentences = cleanText(text).match(/[^.!?]+[.!?]+/g) || [];
  const usable = sentences
    .map((s) => s.trim())
    .filter((s) => s.length > 55 && s.length < 230);
  const pool = [...new Set(usable.flatMap(words))];
  const used = new Set(),
    made = [];
  for (const sentence of usable) {
    if (made.length >= count) break;
    const answer = pickAnswer(sentence, used);
    if (!answer) continue;
    const match = new RegExp(
      `\\b${answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i",
    );
    const prompt = sentence.replace(match, "_____");
    const distractors = shuffle(
      pool.filter(
        (word) =>
          word !== answer &&
          !used.has(word) &&
          Math.abs(word.length - answer.length) <= 5,
      ),
    ).slice(0, 3);
    if (distractors.length < 3) continue;
    used.add(answer);
    made.push({ prompt, answer, options: shuffle([answer, ...distractors]) });
  }
  return made;
}
async function extractPdfText(file) {
  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  let text = "";
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    status.textContent = `Reading page ${pageNumber} of ${pdf.numPages}…`;
    const page = await pdf.getPage(pageNumber),
      content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + " ";
  }
  return text;
}
document
  .querySelector("#pdf-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const file = fileInput.files[0];
    if (!file) return;
    try {
      status.textContent = "Opening your PDF…";
      const text = await extractPdfText(file),
        count = Number(document.querySelector("#question-count").value);
      questions = makeQuestions(text, count);
      if (!questions.length)
        throw new Error(
          "This PDF does not contain enough readable study text to create questions.",
        );
      renderQuiz();
      status.textContent = `Created ${questions.length} practice questions from ${file.name}.`;
      toast("Your MCQ quiz is ready.");
    } catch (error) {
      status.textContent =
        error.message || "The PDF could not be read. Please try another file.";
      questions = [];
      quizForm.innerHTML = "";
      empty.hidden = false;
      quizActions.hidden = true;
      result.hidden = true;
    }
  });
function renderQuiz() {
  empty.hidden = true;
  quizActions.hidden = false;
  result.hidden = true;
  quizForm.innerHTML =
    questions
      .map(
        (question, index) =>
          `<article class="panel question-card"><p class="question-number">Question ${index + 1}</p><h3>${escapeHtml(question.prompt)}</h3>${question.options.map((option, choice) => `<label class="choice"><input type="radio" name="question-${index}" value="${escapeHtml(option)}"> <span>${String.fromCharCode(65 + choice)}. ${escapeHtml(option)}</span></label>`).join("")}</article>`,
      )
      .join("") + '<button class="button primary">Check answers</button>';
  quizForm.onsubmit = (event) => {
    event.preventDefault();

    // Calculate score and track correct/incorrect answers
    const results = questions.map((question, index) => {
      const userAnswer = new FormData(quizForm).get(`question-${index}`);
      const isCorrect = userAnswer === question.answer;
      return {
        index,
        isCorrect,
        userAnswer,
        correctAnswer: question.answer,
        prompt: question.prompt,
        options: question.options,
      };
    });

    const score = results.filter((r) => r.isCorrect).length;

    // Disable all radio buttons after submission
    document
      .querySelectorAll('#quiz-form input[type="radio"]')
      .forEach((input) => {
        input.disabled = true;
      });

    // Build detailed results HTML
    let resultHTML = `<div class="result-header">
      <strong>${score} / ${questions.length}</strong>
      <span class="hint">${score === questions.length ? "Perfect! You got all questions correct." : `You got ${score} correct. Review the incorrect answers below.`}</span>
    </div>`;

    // Show detailed feedback for each question
    resultHTML += '<div class="result-details">';

    results.forEach((result, idx) => {
      const statusClass = result.isCorrect ? "correct" : "incorrect";
      const statusIcon = result.isCorrect
        ? '<svg class="feedback-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>'
        : '<svg class="feedback-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="m18 6-12 12M6 6l12 12"/></svg>';

      resultHTML += `
        <article class="result-item ${statusClass}">
          <div class="result-question">
            <span class="result-status ${statusClass}">${statusIcon} Question ${result.index + 1}</span>
            <h4>${escapeHtml(result.prompt)}</h4>
          </div>
          <div class="result-answer">
            <p><strong>Your answer:</strong> ${result.userAnswer ? escapeHtml(result.userAnswer) : "<em>Not answered</em>"}</p>
            ${!result.isCorrect ? `<p class="correct-answer"><strong><svg class="feedback-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg> Correct answer:</strong> ${escapeHtml(result.correctAnswer)}</p>` : ""}
          </div>
        </article>
      `;
    });

    resultHTML += "</div>";

    result.hidden = false;
    result.innerHTML = resultHTML;
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
}

document.querySelector("#export-mcqs").addEventListener("click", () => {
  if (!questions.length) return;
  const exportWindow = window.open("", "_blank");
  if (!exportWindow) {
    toast("Allow pop-ups to export your MCQs.");
    return;
  }

  const questionMarkup = questions
    .map(
      (question, index) =>
        `<article class="question"><h2>${index + 1}. ${escapeHtml(question.prompt)}</h2><ol type="A">${question.options
          .map((option) => `<li>${escapeHtml(option)}</li>`)
          .join("")}</ol></article>`,
    )
    .join("");
  const answerMarkup = questions
    .map((question, index) => {
      const answerLetter = String.fromCharCode(
        65 + question.options.indexOf(question.answer),
      );
      return `<li>${index + 1}. ${answerLetter}</li>`;
    })
    .join("");

  exportWindow.document.open();
  exportWindow.document.write(`<!doctype html>
    <html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Student Hub MCQs</title><style>
      *{box-sizing:border-box}body{font:16px/1.5 Arial,sans-serif;color:#172033;max-width:800px;margin:40px auto;padding:0 28px}
      h1{font-size:26px;margin-bottom:8px}.subtitle{color:#596579;margin-top:0}.question{padding:14px 0;border-bottom:1px solid #d9deea;break-inside:avoid}
      .question h2{font-size:17px;font-weight:600}.question ol{padding-left:28px}.question li{padding:2px 0}.answer-key{break-before:page;page-break-before:always}
      .answer-key ol{columns:2;max-width:440px;padding:0;list-style:none}.answer-key li{padding:3px 0;font-weight:600}
      @media print{body{margin:0 auto;padding:0 12mm}.question{border-color:#bbb}}
    </style></head><body><h1>Practice MCQs</h1><p class="subtitle">Student Utility Hub</p>
    ${questionMarkup}<section class="answer-key"><h1>Answer Key</h1><ol>${answerMarkup}</ol></section>
    <script>window.addEventListener('load',()=>setTimeout(()=>window.print(),250));</script></body></html>`);
  exportWindow.document.close();
});

document.querySelector("#download-pdf").addEventListener("click", () => {
  if (!questions.length) return;
  if (!window.jspdf) {
    toast("The PDF download tool could not load. Please try again.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  function addFooter() {
    pdf.setFontSize(9);
    pdf.setTextColor(100, 110, 125);
    pdf.text(
      `Student Utility Hub • Page ${pdf.getNumberOfPages()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" },
    );
    pdf.setTextColor(23, 32, 51);
  }
  function newPage() {
    addFooter();
    pdf.addPage();
    y = margin;
  }
  function writeLines(lines, lineHeight, indent = 0) {
    lines.forEach((line) => {
      if (y + lineHeight > pageHeight - 18) newPage();
      pdf.text(line, margin + indent, y);
      y += lineHeight;
    });
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("Practice MCQs", margin, y);
  y += 8;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(89, 101, 121);
  pdf.text("Student Utility Hub", margin, y);
  pdf.setTextColor(23, 32, 51);
  y += 12;

  questions.forEach((question, index) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    const promptLines = pdf.splitTextToSize(
      `${index + 1}. ${question.prompt}`,
      contentWidth,
    );
    if (y + promptLines.length * 6 + 30 > pageHeight - 18) newPage();
    writeLines(promptLines, 6);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    question.options.forEach((option, choice) => {
      const optionLines = pdf.splitTextToSize(
        `${String.fromCharCode(65 + choice)}. ${option}`,
        contentWidth - 5,
      );
      writeLines(optionLines, 5.5, 5);
    });
    y += 5;
  });

  newPage();
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("Answer Key", margin, y);
  y += 12;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  questions.forEach((question, index) => {
    const answerLetter = String.fromCharCode(
      65 + question.options.indexOf(question.answer),
    );
    if (y + 7 > pageHeight - 18) newPage();
    pdf.text(`${index + 1}. ${answerLetter}`, margin, y);
    y += 7;
  });
  addFooter();
  pdf.save("student-hub-mcqs.pdf");
  toast("Your MCQ PDF has been downloaded.");
});

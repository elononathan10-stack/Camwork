const keyboardRuns = /(?:asdf|qwerty|zxcv|12345|09876)/i;

export const hasMeaningfulText = (value, minimumLetters = 2) => {
  const text = String(value || "").trim();
  const letters = (text.match(/[\p{L}]/gu) || []).length;
  const uniqueLetters = new Set(
    (text.match(/[\p{L}]/gu) || []).map((letter) => letter.toLowerCase()),
  ).size;
  if (letters < minimumLetters || uniqueLetters < 2 || keyboardRuns.test(text))
    return false;
  if (/^(.)\1{3,}$/u.test(text.replace(/\s/g, ""))) return false;
  return true;
};

export const hasMeaningfulFields = (values) =>
  values.every((value) => hasMeaningfulText(value));

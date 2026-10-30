import { extractText, getDocumentProxy } from "unpdf";

// Reads the text layer of a PDF locally, so the model never has to read or retype the file.
export async function pdfToText(buf: Buffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  const { text } = await extractText(pdf, { mergePages: true });
  return text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

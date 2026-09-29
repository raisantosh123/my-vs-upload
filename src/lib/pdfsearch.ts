import { pdfjs } from "react-pdf";
import { findTextMatches } from "./algorithms";

export async function searchPDF(
  file: Blob,
  query: string
) {
  const buffer = await file.arrayBuffer();

  const pdf = await pdfjs.getDocument({
    data: buffer,
  }).promise;

  const pageTexts: string[] = [];

  for (
    let pageNumber = 1;
    pageNumber <= pdf.numPages;
    pageNumber++
  ) {
    const page = await pdf.getPage(pageNumber);

    const content =
      await page.getTextContent();

    const text = content.items
      .map((item: any) => item.str)
      .join(" ");

    pageTexts.push(text);
  }

  return findTextMatches(
    pageTexts,
    query
  );
}
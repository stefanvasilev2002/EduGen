package com.finki.uiktp.edugen.service.Implementation;

import com.finki.uiktp.edugen.model.Question;
import com.finki.uiktp.edugen.model.Answer;
import com.finki.uiktp.edugen.service.QuestionService;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.pdf.draw.LineSeparator;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PdfExportService {

    private final QuestionService questionService;

    public PdfExportService(QuestionService questionService) {
        this.questionService = questionService;
    }

    public byte[] exportQuestionsToPdf(List<Long> questionIds) throws DocumentException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, baos);

        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.BLACK);
        Paragraph title = new Paragraph("Questions Export", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        Font dateFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.GRAY);
        Paragraph date = new Paragraph("Generated on: " + new java.util.Date(), dateFont);
        date.setAlignment(Element.ALIGN_RIGHT);
        date.setSpacingAfter(20);
        document.add(date);

        List<Question> questions = questionIds.stream()
                .map(id -> questionService.findById(id).orElse(null))
                .filter(q -> q != null)
                .collect(Collectors.toList());

        Map<String, List<Question>> questionsByDocument = questions.stream()
                .collect(Collectors.groupingBy(q ->
                        q.getDocument() != null ? q.getDocument().getTitle() : "No Document"
                ));

        Font documentFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BaseColor.DARK_GRAY);
        Font questionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.BLACK);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11, BaseColor.BLACK);
        Font correctAnswerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new BaseColor(0, 128, 0));

        for (Map.Entry<String, List<Question>> entry : questionsByDocument.entrySet()) {
            Paragraph docTitle = new Paragraph(entry.getKey(), documentFont);
            docTitle.setSpacingBefore(15);
            docTitle.setSpacingAfter(10);
            document.add(docTitle);

            int questionNumber = 1;
            for (Question question : entry.getValue()) {
                PdfPTable questionTable = new PdfPTable(2);
                questionTable.setWidthPercentage(100);
                questionTable.setWidths(new float[]{80, 20});

                PdfPCell questionCell = new PdfPCell(new Phrase(
                        questionNumber + ". " + question.getText(), questionFont
                ));
                questionCell.setBorder(Rectangle.NO_BORDER);
                questionCell.setPaddingBottom(5);
                questionTable.addCell(questionCell);

                PdfPCell typeCell = new PdfPCell(new Phrase(
                        formatQuestionType(question.getType().toString()), normalFont
                ));
                typeCell.setBorder(Rectangle.NO_BORDER);
                typeCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                questionTable.addCell(typeCell);

                document.add(questionTable);

                if (question.getAnswers() != null && !question.getAnswers().isEmpty()) {
                    com.itextpdf.text.List answerList = new com.itextpdf.text.List(com.itextpdf.text.List.ORDERED, com.itextpdf.text.List.ALPHABETICAL);
                    answerList.setIndentationLeft(20);

                    for (Answer answer : question.getAnswers()) {
                        Font answerFont = answer.isCorrect() ? correctAnswerFont : normalFont;
                        ListItem item = new ListItem(answer.getText(), answerFont);
                        if (answer.isCorrect()) {
                            item.add(new Phrase(" ✓", correctAnswerFont));
                        }
                        answerList.add(item);
                    }

                    document.add(answerList);
                }

                document.add(new Paragraph(" "));
                questionNumber++;
            }
        }

        document.add(Chunk.NEWLINE);
        document.add(new LineSeparator());

        Font summaryFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.GRAY);
        Paragraph summary = new Paragraph();
        summary.setFont(summaryFont);
        summary.add("Total Questions: " + questions.size());
        summary.add(Chunk.NEWLINE);

        Map<String, Long> typeCounts = questions.stream()
                .collect(Collectors.groupingBy(q -> q.getType().toString(), Collectors.counting()));

        for (Map.Entry<String, Long> typeEntry : typeCounts.entrySet()) {
            summary.add(formatQuestionType(typeEntry.getKey()) + ": " + typeEntry.getValue());
            summary.add(Chunk.NEWLINE);
        }

        document.add(summary);

        document.close();

        return baos.toByteArray();
    }

    private String formatQuestionType(String type) {
        switch (type) {
            case "MULTIPLE_CHOICE":
                return "Multiple Choice";
            case "TRUE_FALSE":
                return "True/False";
            case "FILL_IN_THE_BLANK":
                return "Fill in the Blank";
            default:
                return type;
        }
    }
}

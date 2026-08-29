import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  BorderStyle,
  PageOrientation,
  AlignmentType,
  VerticalAlign,
  ShadingType,
  convertMillimetersToTwip,
  PageBreak,
} from 'docx';
import { saveAs } from 'file-saver';
import { WeeklyPlanState, DocumentSettings } from '../types';

export async function exportToWord(
  plan: WeeklyPlanState,
  settings: DocumentSettings
): Promise<void> {
  const isLandscape = settings.orientation === 'landscape';

  // Margins in millimeters
  const marginMm =
    settings.margin === 'minimal' ? 8 : settings.margin === 'normal' ? 25 : 12.7;
  const marginTwips = convertMillimetersToTwip(marginMm);

  // Font name and size (docx sizes are in half-points: 10pt = 20 half-points)
  const font = settings.fontFamily;
  const sizeMap: Record<string, number> = {
    '9pt': 18,
    '10pt': 20,
    '11pt': 22,
    '12pt': 24,
  };
  const baseSizeHalfPt = sizeMap[settings.fontSize] || 20;
  const headerSizeHalfPt = Math.max(16, baseSizeHalfPt - 2);
  const titleSizeHalfPt = baseSizeHalfPt + 4;

  const thinBorder = {
    style: BorderStyle.SINGLE,
    size: 4,
    color: '555555',
  };

  const tableBorders = {
    top: thinBorder,
    bottom: thinBorder,
    left: thinBorder,
    right: thinBorder,
    insideHorizontal: thinBorder,
    insideVertical: thinBorder,
  };

  // Build Institutional Header Table (Only for Sheet 1)
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 60, type: WidthType.PERCENTAGE },
            shading: { fill: 'F3F4F6', type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 150, right: 150 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'ESCOLA: ',
                    bold: true,
                    font,
                    size: headerSizeHalfPt,
                  }),
                  new TextRun({
                    text: plan.cabecalho.escola || '___________________________',
                    font,
                    size: headerSizeHalfPt,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            shading: { fill: 'F3F4F6', type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 150, right: 150 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'MUNICÍPIO: ',
                    bold: true,
                    font,
                    size: headerSizeHalfPt,
                  }),
                  new TextRun({
                    text: plan.cabecalho.municipio || '___________________________',
                    font,
                    size: headerSizeHalfPt,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 60, type: WidthType.PERCENTAGE },
            margins: { top: 100, bottom: 100, left: 150, right: 150 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'DRE / NÚCLEO: ',
                    bold: true,
                    font,
                    size: headerSizeHalfPt,
                  }),
                  new TextRun({
                    text: plan.cabecalho.dre || '___________________________',
                    font,
                    size: headerSizeHalfPt,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            margins: { top: 100, bottom: 100, left: 150, right: 150 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'DOCENTE: ',
                    bold: true,
                    font,
                    size: headerSizeHalfPt,
                  }),
                  new TextRun({
                    text: plan.cabecalho.docente || '___________________________',
                    font,
                    size: headerSizeHalfPt,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            margins: { top: 100, bottom: 100, left: 150, right: 150 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'BIMESTRE: ',
                    bold: true,
                    font,
                    size: headerSizeHalfPt,
                  }),
                  new TextRun({
                    text: plan.cabecalho.bimestre || '_______________',
                    font,
                    size: headerSizeHalfPt,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            margins: { top: 100, bottom: 100, left: 150, right: 150 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'TURMA: ',
                    bold: true,
                    font,
                    size: headerSizeHalfPt,
                  }),
                  new TextRun({
                    text: plan.cabecalho.turma || '__________',
                    font,
                    size: headerSizeHalfPt,
                  }),
                  new TextRun({
                    text: '  |  TURNO: ',
                    bold: true,
                    font,
                    size: headerSizeHalfPt,
                  }),
                  new TextRun({
                    text: plan.cabecalho.turno || '__________',
                    font,
                    size: headerSizeHalfPt,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 2,
            width: { size: 100, type: WidthType.PERCENTAGE },
            margins: { top: 100, bottom: 100, left: 150, right: 150 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'COMPONENTE CURRICULAR: ',
                    bold: true,
                    font,
                    size: headerSizeHalfPt,
                  }),
                  new TextRun({
                    text:
                      plan.cabecalho.componente_curricular ||
                      '___________________________',
                    font,
                    size: headerSizeHalfPt,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Helper to convert multiline text into Paragraphs
  const textToParagraphs = (text: string, isBold = false) => {
    if (!text || !text.trim()) {
      return [
        new Paragraph({
          children: [new TextRun({ text: '—', font, size: baseSizeHalfPt })],
        }),
      ];
    }
    const lines = text.split('\n');
    return lines.map(
      (line) =>
        new Paragraph({
          spacing: { after: 60, line: 240 },
          children: [
            new TextRun({
              text: line || ' ',
              font,
              size: baseSizeHalfPt,
              bold: isBold,
            }),
          ],
        })
    );
  };

  // Helper to create the day table
  const createDayTable = (day: (typeof plan.dias)[0]) => {
    // Column widths in %
    // In landscape or portrait, column proportions:
    // DATA/DIA: 15%, OBJETOS: 22%, HABILIDADES: 20%, DESENVOLVIMENTO: 28%, RECURSOS: 15%
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: tableBorders,
      rows: [
        // Table Header
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              shading: { fill: '1E293B', type: ShadingType.CLEAR },
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 120, bottom: 120, left: 100, right: 100 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'DATA / DIA',
                      bold: true,
                      color: 'FFFFFF',
                      font,
                      size: headerSizeHalfPt,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 22, type: WidthType.PERCENTAGE },
              shading: { fill: '1E293B', type: ShadingType.CLEAR },
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 120, bottom: 120, left: 100, right: 100 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'OBJETOS DO CONHECIMENTO',
                      bold: true,
                      color: 'FFFFFF',
                      font,
                      size: headerSizeHalfPt,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 20, type: WidthType.PERCENTAGE },
              shading: { fill: '1E293B', type: ShadingType.CLEAR },
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 120, bottom: 120, left: 100, right: 100 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'HABILIDADES BNCC',
                      bold: true,
                      color: 'FFFFFF',
                      font,
                      size: headerSizeHalfPt,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 28, type: WidthType.PERCENTAGE },
              shading: { fill: '1E293B', type: ShadingType.CLEAR },
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 120, bottom: 120, left: 100, right: 100 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'DESENVOLVIMENTO / ATIVIDADES',
                      bold: true,
                      color: 'FFFFFF',
                      font,
                      size: headerSizeHalfPt,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              shading: { fill: '1E293B', type: ShadingType.CLEAR },
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 120, bottom: 120, left: 100, right: 100 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'RECURSOS',
                      bold: true,
                      color: 'FFFFFF',
                      font,
                      size: headerSizeHalfPt,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        // Day Content Row
        new TableRow({
          children: [
            // Data / Dia
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.TOP,
              shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
              margins: { top: 140, bottom: 140, left: 120, right: 120 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: day.dia_semana.toUpperCase(),
                      bold: true,
                      font,
                      size: baseSizeHalfPt,
                      color: '0F172A',
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 80 },
                  children: [
                    new TextRun({
                      text: day.data || '',
                      font,
                      size: baseSizeHalfPt,
                      color: '475569',
                    }),
                  ],
                }),
              ],
            }),
            // Objetos do Conhecimento
            new TableCell({
              width: { size: 22, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.TOP,
              margins: { top: 140, bottom: 140, left: 120, right: 120 },
              children: textToParagraphs(day.objetos_conhecimento),
            }),
            // Habilidades BNCC
            new TableCell({
              width: { size: 20, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.TOP,
              margins: { top: 140, bottom: 140, left: 120, right: 120 },
              children: textToParagraphs(day.habilidades_bncc),
            }),
            // Desenvolvimento
            new TableCell({
              width: { size: 28, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.TOP,
              margins: { top: 140, bottom: 140, left: 120, right: 120 },
              children: textToParagraphs(day.desenvolvimento),
            }),
            // Recursos
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.TOP,
              margins: { top: 140, bottom: 140, left: 120, right: 120 },
              children: textToParagraphs(day.recursos),
            }),
          ],
        }),
      ],
    });
  };

  // Build document sections: Each day on a separate page
  const sections = plan.dias.map((day, index) => {
    const isFirstPage = index === 0;
    const children: (Paragraph | Table)[] = [];

    if (isFirstPage) {
      // Sheet 1: Institutional Header
      children.push(headerTable);
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 180, after: 180 },
          children: [
            new TextRun({
              text: 'PLANEJAMENTO SEMANAL DE AULAS',
              bold: true,
              font,
              size: titleSizeHalfPt,
              color: '1E293B',
            }),
          ],
        })
      );
    } else {
      // Sheets 2-5: Mini top banner indicating continued weekly planning
      children.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 60, after: 120 },
          children: [
            new TextRun({
              text: `PLANEJAMENTO SEMANAL — ${plan.cabecalho.escola || 'ENSINO FUNDAMENTAL'} (${plan.cabecalho.turma || ''})`,
              bold: true,
              font,
              size: headerSizeHalfPt - 2,
              color: '64748B',
            }),
          ],
        })
      );
    }

    // Add Day's Table
    children.push(createDayTable(day));

    // Add signature footer
    children.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 200 },
        children: [
          new TextRun({
            text: `Docente: ${plan.cabecalho.docente || 'Assinatura'}  |  Visto da Coordenação: ____________________`,
            font,
            size: headerSizeHalfPt - 2,
            color: '64748B',
          }),
        ],
      })
    );

    return {
      properties: {
        page: {
          size: {
            orientation: isLandscape
              ? PageOrientation.LANDSCAPE
              : PageOrientation.PORTRAIT,
          },
          margin: {
            top: marginTwips,
            bottom: marginTwips,
            left: marginTwips,
            right: marginTwips,
          },
        },
      },
      children,
    };
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font,
            size: baseSizeHalfPt,
          },
        },
      },
    },
    sections,
  });

  const blob = await Packer.toBlob(doc);
  const cleanSchool = (plan.cabecalho.escola || 'Plano_Semanal')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 30);
  const fileName = `Plano_de_Aula_Semanal_${cleanSchool}.docx`;
  saveAs(blob, fileName);
}

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  quality?: number;
}

/**
 * Export a DOM element to PDF
 * @param elementId - The ID of the element to export
 * @param options - Export options
 */
export async function exportToPdf(
  elementId: string,
  options: ExportOptions = {}
): Promise<void> {
  const {
    filename = 'placement-report.pdf',
    orientation = 'portrait',
    quality = 0.95,
  } = options;

  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Calculate dimensions
    const imgWidth = orientation === 'portrait' ? 210 : 297; // A4 size in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/jpeg', quality);
    
    // Add image to PDF
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

    // If content is longer than one page, add multiple pages
    let heightLeft = imgHeight;
    let position = 0;
    const pageHeight = orientation === 'portrait' ? 297 : 210;

    while (heightLeft > pageHeight) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
}

/**
 * Export dashboard overview to PDF
 */
export async function exportDashboardToPdf(): Promise<void> {
  await exportToPdf('dashboard-content', {
    filename: `placement-dashboard-${new Date().toISOString().split('T')[0]}.pdf`,
    orientation: 'portrait',
  });
}

/**
 * Export roadmap to PDF
 */
export async function exportRoadmapToPdf(): Promise<void> {
  await exportToPdf('roadmap-content', {
    filename: `placement-roadmap-${new Date().toISOString().split('T')[0]}.pdf`,
    orientation: 'portrait',
  });
}

/**
 * Export analytics to PDF
 */
export async function exportAnalyticsToPdf(): Promise<void> {
  await exportToPdf('analytics-content', {
    filename: `placement-analytics-${new Date().toISOString().split('T')[0]}.pdf`,
    orientation: 'landscape',
  });
}

/**
 * Generate a comprehensive placement report PDF
 */
export async function exportComprehensiveReport(
  sections: {
    dashboard?: HTMLElement;
    roadmap?: HTMLElement;
    analytics?: HTMLElement;
  }
): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let isFirstPage = true;

  // Helper to add section to PDF
  const addSection = async (element: HTMLElement, title: string) => {
    if (!isFirstPage) {
      pdf.addPage();
    }

    // Add title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, 15, 15);

    // Capture section as canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgWidth = 180; // Leave margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    pdf.addImage(imgData, 'JPEG', 15, 25, imgWidth, imgHeight);
    isFirstPage = false;
  };

  // Add sections
  if (sections.dashboard) {
    await addSection(sections.dashboard, 'Dashboard Overview');
  }
  if (sections.roadmap) {
    await addSection(sections.roadmap, '16-Week Roadmap');
  }
  if (sections.analytics) {
    await addSection(sections.analytics, 'Analytics & Insights');
  }

  // Save
  pdf.save(`placement-comprehensive-report-${new Date().toISOString().split('T')[0]}.pdf`);
}

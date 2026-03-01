import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Captures specific DOM elements by ID and stitches them into a multi-page PDF.
 * Ideal for preserving exact React dashboard styling without needing a backend server renderer.
 */
export async function generatePdfFromElements(
    elements: { id: string; name: string }[],
    filename: string,
    onProgress?: (msg: string) => void
) {
    try {
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        // A4 height is ~297mm
        const pdfHeight = pdf.internal.pageSize.getHeight();

        let isFirstPage = true;

        for (let i = 0; i < elements.length; i++) {
            const { id, name } = elements[i];
            const el = document.getElementById(id);

            if (!el) {
                console.warn(`Element with ID ${id} not found, skipping in PDF.`);
                continue;
            }

            onProgress?.(`Rendering ${name}...`);

            // We wait just a moment for the DOM to settle (animations etc)
            await new Promise((resolve) => setTimeout(resolve, 100));

            const canvas = await html2canvas(el, {
                scale: 2, // Higher density for crisp text
                useCORS: true,
                logging: false,
                backgroundColor: "#0d0f12", // match our dark theme background
            });

            const imgData = canvas.toDataURL("image/jpeg", 0.95);

            // Calculate aspect ratio
            const imgWidth = pdfWidth;
            const originalCanvasHeight = canvas.height;
            const originalCanvasWidth = canvas.width;
            const ratio = imgWidth / originalCanvasWidth;
            let targetHeight = originalCanvasHeight * ratio;

            if (!isFirstPage) {
                pdf.addPage();
            }

            // If the section is taller than an A4 page, we need to split it
            if (targetHeight > pdfHeight) {
                let heightLeft = targetHeight;
                let position = 0;

                // First slice
                pdf.addImage(imgData, "JPEG", 0, position, imgWidth, targetHeight);
                heightLeft -= pdfHeight;

                // Subsequent slices
                while (heightLeft > 0) {
                    position = heightLeft - targetHeight; // shift the image up
                    pdf.addPage();
                    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, targetHeight);
                    heightLeft -= pdfHeight;
                }
            } else {
                // Fits on one page
                pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, targetHeight);
            }

            isFirstPage = false;
        }

        onProgress?.("Saving PDF...");
        pdf.save(filename);
    } catch (error) {
        console.error("PDF Generation failed:", error);
        throw new Error("Failed to generate PDF report.");
    }
}

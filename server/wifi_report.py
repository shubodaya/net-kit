import json
import sys
from datetime import datetime


def respond(payload):
    print(json.dumps(payload))


def build_pdf(output_path, payload):
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
    except Exception:
        return {
            "ok": False,
            "error": "reportlab is not installed. Run: pip install reportlab",
        }

    title = payload.get("title") or "Secure Wi-Fi Scanner Report"
    networks = payload.get("networks") or []
    generated = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    pdf = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter
    y = height - 50
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(40, y, title)
    y -= 22
    pdf.setFont("Helvetica", 10)
    pdf.drawString(40, y, f"Generated: {generated}")
    y -= 20

    if not networks:
        pdf.drawString(40, y, "No networks found.")
    else:
        pdf.setFont("Helvetica-Bold", 11)
        pdf.drawString(40, y, "SSID")
        pdf.drawString(220, y, "Security")
        pdf.drawString(330, y, "Signal")
        pdf.drawString(400, y, "Frequency")
        y -= 14
        pdf.setFont("Helvetica", 10)
        for item in networks:
            if y < 60:
                pdf.showPage()
                y = height - 50
                pdf.setFont("Helvetica", 10)
            pdf.drawString(40, y, str(item.get("ssid", "Unknown")))
            pdf.drawString(220, y, str(item.get("security", "Unknown")))
            pdf.drawString(330, y, str(item.get("signal", "")))
            pdf.drawString(400, y, str(item.get("frequency", "")))
            y -= 12

    pdf.save()
    return {"ok": True}


def main():
    if len(sys.argv) < 2:
        respond({"ok": False, "error": "Output path required."})
        return

    output_path = sys.argv[1]
    raw = sys.stdin.read().strip() or "{}"
    try:
        payload = json.loads(raw)
    except Exception:
        respond({"ok": False, "error": "Invalid payload."})
        return

    result = build_pdf(output_path, payload)
    respond(result)


if __name__ == "__main__":
    main()

import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

os.makedirs("sample_resumes", exist_ok=True)

def create_rich_resume():
    filepath = os.path.join("sample_resumes", "john_doe_full_resume.pdf")
    c = canvas.Canvas(filepath, pagesize=letter)
    width, height = letter

    c.setFont("Helvetica-Bold", 20)
    c.drawString(50, 750, "John Doe")
    
    c.setFont("Helvetica", 10)
    c.drawString(50, 735, "Email: john.doe@example.com  |  Phone: +1 (555) 234-5678  |  Location: San Francisco, CA")
    
    c.line(50, 725, 550, 725)
    
    # Summary
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, 705, "PROFESSIONAL SUMMARY")
    c.setFont("Helvetica", 10)
    c.drawString(50, 690, "Senior Cloud & Full Stack Software Engineer with over 6 years of experience designing scalable")
    c.drawString(50, 675, "microservices, backend APIs in Python and FastAPI, containerization with Docker, and cloud deployments on AWS.")

    # Skills
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, 650, "SKILLS")
    c.setFont("Helvetica", 10)
    c.drawString(50, 635, "Languages & Frameworks: Python, FastAPI, JavaScript, React, SQL, TypeScript, Bash")
    c.drawString(50, 620, "Cloud & DevOps: Docker, AWS EC2, S3, Docker Compose, CI/CD, Git, Linux")

    # Experience
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, 595, "WORK EXPERIENCE")
    
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, 580, "Apex Cloud Systems - Lead Software Engineer")
    c.setFont("Helvetica-Oblique", 10)
    c.drawString(50, 565, "March 2022 - Present")
    c.setFont("Helvetica", 10)
    c.drawString(65, 550, "- Architected high-throughput REST APIs handling 10M+ daily requests using Python and FastAPI.")
    c.drawString(65, 535, "- Containerized internal microservices with Docker and deployed them to AWS EC2 cluster.")
    c.drawString(65, 520, "- Reduced API latency by 45% by optimizing database queries and introducing caching.")

    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, 495, "TechNova Solutions - Software Developer")
    c.setFont("Helvetica-Oblique", 10)
    c.drawString(50, 480, "July 2019 - February 2022")
    c.setFont("Helvetica", 10)
    c.drawString(65, 465, "- Built customer-facing dashboard interfaces in React and state management.")
    c.drawString(65, 450, "- Created automated PDF data extraction pipelines using Python libraries.")

    # Education
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, 420, "EDUCATION")
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, 405, "Bachelor of Science in Computer Science")
    c.setFont("Helvetica", 10)
    c.drawString(50, 390, "University of California, Berkeley  |  Graduation Year: 2019")

    # Certifications
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, 360, "CERTIFICATIONS")
    c.setFont("Helvetica", 10)
    c.drawString(50, 345, "- AWS Certified Solutions Architect - Associate")
    c.drawString(50, 330, "- Docker Certified Associate (DCA)")

    c.save()
    print(f"Created: {filepath}")


def create_partial_resume():
    filepath = os.path.join("sample_resumes", "sarah_miller_missing_fields.pdf")
    c = canvas.Canvas(filepath, pagesize=letter)
    
    # Notice: No phone, no location, no professional summary, no certifications
    c.setFont("Helvetica-Bold", 20)
    c.drawString(50, 750, "Sarah Miller")
    
    c.setFont("Helvetica", 10)
    c.drawString(50, 735, "Email: sarah.miller@example.org")
    c.line(50, 725, 550, 725)

    # Skills
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, 700, "TECHNICAL SKILLS")
    c.setFont("Helvetica", 10)
    c.drawString(50, 685, "Python, Pandas, NumPy, Scikit-learn, SQL, Data Visualization")

    # Experience
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, 655, "WORK EXPERIENCE")
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, 640, "Data Analytics Corp - Junior Data Analyst")
    c.setFont("Helvetica-Oblique", 10)
    c.drawString(50, 625, "January 2023 - Present")
    c.setFont("Helvetica", 10)
    c.drawString(65, 610, "- Analyzed business performance metrics using Python and Pandas.")
    c.drawString(65, 595, "- Designed automated weekly executive reports and KPI dashboards.")

    # Education
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, 560, "EDUCATION")
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, 545, "Bachelor of Science in Statistics")
    c.setFont("Helvetica", 10)
    c.drawString(50, 530, "University of Washington  |  Graduation Year: 2023")

    c.save()
    print(f"Created: {filepath}")


def create_invalid_empty_pdf():
    # Corrupt / empty file for testing exact error handling
    filepath = os.path.join("sample_resumes", "invalid_empty_sample.pdf")
    with open(filepath, "wb") as f:
        f.write(b"")
    print(f"Created empty test file: {filepath}")


if __name__ == "__main__":
    create_rich_resume()
    create_partial_resume()
    create_invalid_empty_pdf()

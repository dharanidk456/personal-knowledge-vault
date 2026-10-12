from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from pypdf import PdfReader
import os
import shutil
import re


app = FastAPI(title="Personal Knowledge Vault API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


DATABASE_URL = "sqlite:///./vault.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)


class SavedLink(Base):
    __tablename__ = "saved_links"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    url = Column(String, nullable=False)


Base.metadata.create_all(bind=engine)


class NoteCreate(BaseModel):
    title: str
    content: str


class LinkCreate(BaseModel):
    title: str
    url: str


class AIQuestion(BaseModel):
    question: str


@app.get("/")
def home():
    return {
        "message": "Personal Knowledge Vault Backend is running!"
    }


# =========================
# NOTES
# =========================

@app.post("/notes")
def create_note(note: NoteCreate):

    db = SessionLocal()

    new_note = Note(
        title=note.title,
        content=note.content
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    result = {
        "id": new_note.id,
        "title": new_note.title,
        "content": new_note.content
    }

    db.close()

    return result


@app.get("/notes")
def get_notes():

    db = SessionLocal()

    notes = db.query(Note).all()

    result = [
        {
            "id": note.id,
            "title": note.title,
            "content": note.content
        }
        for note in notes
    ]

    db.close()

    return result


@app.put("/notes/{note_id}")
def update_note(
    note_id: int,
    note_data: NoteCreate
):

    db = SessionLocal()

    note = db.query(Note).filter(
        Note.id == note_id
    ).first()

    if not note:
        db.close()

        return {
            "message": "Note not found"
        }

    note.title = note_data.title
    note.content = note_data.content

    db.commit()
    db.refresh(note)

    result = {
        "id": note.id,
        "title": note.title,
        "content": note.content
    }

    db.close()

    return result


@app.delete("/notes/{note_id}")
def delete_note(note_id: int):

    db = SessionLocal()

    note = db.query(Note).filter(
        Note.id == note_id
    ).first()

    if not note:
        db.close()

        return {
            "message": "Note not found"
        }

    db.delete(note)
    db.commit()

    db.close()

    return {
        "message": "Note deleted successfully"
    }


# =========================
# SAVED LINKS
# =========================

@app.post("/links")
def create_link(link: LinkCreate):

    db = SessionLocal()

    new_link = SavedLink(
        title=link.title,
        url=link.url
    )

    db.add(new_link)
    db.commit()
    db.refresh(new_link)

    result = {
        "id": new_link.id,
        "title": new_link.title,
        "url": new_link.url
    }

    db.close()

    return result


@app.get("/links")
def get_links():

    db = SessionLocal()

    links = db.query(SavedLink).all()

    result = [
        {
            "id": link.id,
            "title": link.title,
            "url": link.url
        }
        for link in links
    ]

    db.close()

    return result


@app.delete("/links/{link_id}")
def delete_link(link_id: int):

    db = SessionLocal()

    link = db.query(SavedLink).filter(
        SavedLink.id == link_id
    ).first()

    if not link:
        db.close()

        return {
            "message": "Link not found"
        }

    db.delete(link)
    db.commit()

    db.close()

    return {
        "message": "Link deleted successfully"
    }


# =========================
# DOCUMENTS
# =========================

@app.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...)
):

    if not file.filename.lower().endswith(".pdf"):

        return {
            "message": "Only PDF files are allowed"
        }

    filename = os.path.basename(
        file.filename
    )

    file_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    return {
        "message": "PDF uploaded successfully!",
        "filename": filename
    }


@app.get("/documents")
def get_documents():

    result = []

    if os.path.exists(UPLOAD_FOLDER):

        for filename in os.listdir(UPLOAD_FOLDER):

            if filename.lower().endswith(".pdf"):

                result.append({
                    "filename": filename
                })

    return result


@app.get("/documents/open/{filename}")
def open_document(filename: str):

    filename = os.path.basename(
        filename
    )

    file_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    if not os.path.exists(file_path):

        return {
            "message": "Document not found"
        }

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=filename
    )


@app.delete("/documents/{filename}")
def delete_document(filename: str):

    filename = os.path.basename(
        filename
    )

    file_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    if not os.path.exists(file_path):

        return {
            "message": "Document not found"
        }

    os.remove(file_path)

    return {
        "message": "Document deleted successfully"
    }


# =========================
# PDF TEXT EXTRACTION
# =========================

def extract_pdf_text(file_path):

    try:

        reader = PdfReader(file_path)

        pages = []

        for page in reader.pages:

            page_text = page.extract_text()

            if page_text:

                pages.append(page_text)

        return "\n".join(pages)

    except Exception:

        return ""


# =========================
# TEXT HELPERS
# =========================

def normalize_text(text):

    text = text.lower()

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


# =========================
# PROGRAMMING SKILLS
# =========================

def get_programming_skills_answer(documents):

    for document in documents:

        filename = document["filename"].lower()

        if (
            "resume" not in filename
            and "cv" not in filename
        ):
            continue

        text = document["content"]

        match = re.search(
            r"Programming Languages\s*"
            r"(.*?)(?=Tools|Soft Skills|Framework|Platforms|$)",
            text,
            flags=re.IGNORECASE | re.DOTALL
        )

        if match:

            result = re.sub(
                r"\s+",
                " ",
                match.group(1)
            ).strip()

            if result:

                return (
                    "📄 "
                    + document["filename"]
                    + "\n\n"
                    + "Programming Skills:\n"
                    + result
                )

    return None


# =========================
# PROJECT EXTRACTION
# =========================

def clean_project_text(text):

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    text = text.strip()

    return text


def get_project_answer(
    question,
    documents
):

    q = normalize_text(question)


    for document in documents:

        filename = document["filename"].lower()

        if (
            "resume" not in filename
            and "cv" not in filename
        ):
            continue

        text = document["content"]

        if not text:
            continue


        # =========================
        # COLLEGE WEBSITE PROJECT
        # =========================

        if (
            "college website" in q
            or "college website creation" in q
        ):

            match = re.search(
                r"College Website Creation\s*"
                r"(.*?)(?="
                r"Retail Industry Project|"
                r"Netflix Data Analysis|"
                r"Business Analyst|"
                r"Bussiness Analyst|"
                r"Framework|"
                r"Platforms|"
                r"$)",
                text,
                flags=re.IGNORECASE | re.DOTALL
            )

            if match:

                project_text = clean_project_text(
                    match.group(1)
                )

                return (
                    "📄 "
                    + document["filename"]
                    + "\n\n"
                    + "College Website Creation\n\n"
                    + project_text
                )


        # =========================
        # RETAIL PROJECT
        # =========================

        if (
            "retail industry" in q
            or "retail project" in q
        ):

            match = re.search(
                r"Retail Industry Project\s*"
                r"(.*?)(?="
                r"Netflix Data Analysis|"
                r"Business Analyst|"
                r"Bussiness Analyst|"
                r"Framework|"
                r"Platforms|"
                r"$)",
                text,
                flags=re.IGNORECASE | re.DOTALL
            )

            if match:

                project_text = clean_project_text(
                    match.group(1)
                )

                return (
                    "📄 "
                    + document["filename"]
                    + "\n\n"
                    + "Retail Industry Project\n\n"
                    + project_text
                )


        # =========================
        # NETFLIX PROJECT
        # =========================

        if (
            "netflix" in q
            or "netflix project" in q
            or "netflix data analysis" in q
        ):

            match = re.search(
                r"Netflix Data Analysis, Preprocessing and Visualization\s*"
                r"(.*?)(?="
                r"Business Analyst|"
                r"Bussiness Analyst|"
                r"Framework|"
                r"Platforms|"
                r"$)",
                text,
                flags=re.IGNORECASE | re.DOTALL
            )

            if match:

                project_text = clean_project_text(
                    match.group(1)
                )

                return (
                    "📄 "
                    + document["filename"]
                    + "\n\n"
                    + "Netflix Data Analysis, Preprocessing and Visualization\n\n"
                    + project_text
                )


        # =========================
        # ALL PROJECTS
        # =========================

        match1 = re.search(
            r"College Website Creation\s*"
            r"(.*?)(?="
            r"Retail Industry Project|"
            r"Netflix Data Analysis|"
            r"Business Analyst|"
            r"Bussiness Analyst|"
            r"Framework|"
            r"Platforms|"
            r"$)",
            text,
            flags=re.IGNORECASE | re.DOTALL
        )

        match2 = re.search(
            r"Retail Industry Project\s*"
            r"(.*?)(?="
            r"Netflix Data Analysis|"
            r"Business Analyst|"
            r"Bussiness Analyst|"
            r"Framework|"
            r"Platforms|"
            r"$)",
            text,
            flags=re.IGNORECASE | re.DOTALL
        )

        match3 = re.search(
            r"Netflix Data Analysis, Preprocessing and Visualization\s*"
            r"(.*?)(?="
            r"Business Analyst|"
            r"Bussiness Analyst|"
            r"Framework|"
            r"Platforms|"
            r"$)",
            text,
            flags=re.IGNORECASE | re.DOTALL
        )


        projects = []


        if match1:

            projects.append(
                "1. College Website Creation\n"
                + clean_project_text(
                    match1.group(1)
                )
            )


        if match2:

            projects.append(
                "2. Retail Industry Project\n"
                + clean_project_text(
                    match2.group(1)
                )
            )


        if match3:

            projects.append(
                "3. Netflix Data Analysis, Preprocessing and Visualization\n"
                + clean_project_text(
                    match3.group(1)
                )
            )


        if projects:

            return (
                "📄 "
                + document["filename"]
                + "\n\n"
                + "\n\n".join(projects)
            )


    return None


# =========================
# AI ASSISTANT
# =========================

@app.post("/ai/ask")
def ask_ai(data: AIQuestion):

    db = SessionLocal()

    notes = db.query(Note).all()

    links = db.query(SavedLink).all()

    documents = []


    if os.path.exists(UPLOAD_FOLDER):

        for filename in os.listdir(UPLOAD_FOLDER):

            if filename.lower().endswith(".pdf"):

                file_path = os.path.join(
                    UPLOAD_FOLDER,
                    filename
                )

                documents.append({
                    "filename": filename,
                    "content": extract_pdf_text(
                        file_path
                    )
                })


    question = data.question.strip()

    question_lower = normalize_text(
        question
    )


    # =========================
    # PROJECT QUESTIONS
    # =========================

    if "project" in question_lower:

        project_answer = get_project_answer(
            question,
            documents
        )

        if project_answer:

            db.close()

            return {
                "answer": project_answer
            }


    # =========================
    # PROGRAMMING SKILLS
    # =========================

    if (
        "programming skill" in question_lower
        or "programming skills" in question_lower
        or "programming language" in question_lower
        or "programming languages" in question_lower
        or "coding skills" in question_lower
        or "technical skills" in question_lower
    ):

        skills_answer = get_programming_skills_answer(
            documents
        )

        if skills_answer:

            db.close()

            return {
                "answer": skills_answer
            }


    # =========================
    # SUMMARY
    # =========================

    if (
        "show my vault stats" in question_lower
        or "summary" in question_lower
        or "what do i have" in question_lower
    ):

        answer = (
            "Here is your Knowledge Vault summary:\n\n"
            "📝 Notes: "
            + str(len(notes))
            + "\n"
            "🔗 Saved Links: "
            + str(len(links))
            + "\n"
            "📄 Documents: "
            + str(len(documents))
        )

        db.close()

        return {
            "answer": answer
        }


    # =========================
    # NOTE QUESTIONS
    # =========================

    if (
        "note" in question_lower
        or "notes" in question_lower
    ):

        if not notes:

            answer = (
                "You currently have no saved notes."
            )

        elif (
            "title" in question_lower
            or "titles" in question_lower
            or "list" in question_lower
        ):

            answer = (
                "Here are your saved notes:\n\n"
            )

            for note in notes:

                answer += (
                    "📝 "
                    + note.title
                    + "\n"
                )

        else:

            answer = (
                "Here is the content of your saved notes:\n\n"
            )

            for note in notes:

                answer += (
                    "📝 "
                    + note.title
                    + "\n"
                    + note.content
                    + "\n\n"
                )

        db.close()

        return {
            "answer": answer
        }


    # =========================
    # LINK QUESTIONS
    # =========================

    if (
        "link" in question_lower
        or "links" in question_lower
    ):

        if not links:

            answer = (
                "You currently have no saved links."
            )

        else:

            answer = (
                "Here are your saved links:\n\n"
            )

            for link in links:

                answer += (
                    "🔗 "
                    + link.title
                    + "\n"
                    + link.url
                    + "\n\n"
                )

        db.close()

        return {
            "answer": answer
        }


    # =========================
    # DOCUMENT QUESTIONS
    # =========================

    if (
        "document" in question_lower
        or "documents" in question_lower
        or "pdf" in question_lower
    ):

        if not documents:

            answer = (
                "You currently have no PDF documents."
            )

        else:

            answer = (
                "Here are your PDF documents:\n\n"
            )

            for document in documents:

                answer += (
                    "📄 "
                    + document["filename"]
                    + "\n"
                )

        db.close()

        return {
            "answer": answer
        }


    # =========================
    # GENERAL SEARCH
    # =========================

    stop_words = {
        "what",
        "are",
        "the",
        "is",
        "my",
        "in",
        "tell",
        "me",
        "about",
        "give",
        "a",
        "an",
        "of",
        "do",
        "i",
        "have",
        "can",
        "you",
        "please",
        "show",
        "list",
        "from",
        "to",
        "and",
        "for",
        "on",
        "this",
        "that",
        "how"
    }


    keywords = [
        word
        for word in re.findall(
            r"[a-zA-Z0-9]+",
            question_lower
        )
        if word not in stop_words
        and len(word) > 2
    ]


    matching_notes = []

    matching_documents = []


    for note in notes:

        title_text = normalize_text(
            note.title
        )

        content_text = normalize_text(
            note.content
        )

        score = 0


        if title_text == question_lower:

            score += 100


        if question_lower in title_text:

            score += 80


        if title_text in question_lower:

            score += 70


        for keyword in keywords:

            if keyword in title_text:

                score += 20

            elif keyword in content_text:

                score += 5


        if score > 0:

            matching_notes.append({
                "note": note,
                "score": score
            })


    for document in documents:

        filename_text = normalize_text(
            document["filename"]
        )

        content_text = normalize_text(
            document["content"]
        )

        score = 0


        for keyword in keywords:

            if keyword in filename_text:

                score += 10

            elif keyword in content_text:

                score += 2


        if score > 0:

            matching_documents.append({
                "document": document,
                "score": score
            })


    matching_notes.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    matching_documents.sort(
        key=lambda item: item["score"],
        reverse=True
    )


    if matching_notes:

        best_note = matching_notes[0]["note"]

        best_score = matching_notes[0]["score"]


        if best_score >= 20:

            answer = (
                "Here is the most relevant information "
                "from your Knowledge Vault:\n\n"
                "📝 "
                + best_note.title
                + "\n\n"
                + best_note.content
            )

            db.close()

            return {
                "answer": answer
            }


    if (
        not matching_notes
        and not matching_documents
    ):

        answer = (
            "I could not find a matching item "
            "in your Knowledge Vault.\n\n"
            "Your current vault contains:\n"
            "📝 "
            + str(len(notes))
            + " notes\n"
            "🔗 "
            + str(len(links))
            + " saved links\n"
            "📄 "
            + str(len(documents))
            + " documents"
        )

    else:

        answer = (
            "I found these matching items "
            "in your Knowledge Vault:\n\n"
        )


        for item in matching_notes[:3]:

            note = item["note"]

            answer += (
                "📝 "
                + note.title
                + "\n"
                + note.content
                + "\n\n"
            )


        for item in matching_documents[:2]:

            document = item["document"]

            answer += (
                "📄 "
                + document["filename"]
                + "\n"
            )

            if document["content"]:

                answer += (
                    document["content"][:1200]
                    + "\n\n"
                )


    db.close()

    return {
        "answer": answer
    }

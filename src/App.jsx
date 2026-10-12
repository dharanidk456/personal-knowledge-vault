import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [page, setPage] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", icon: "🏠", name: "Dashboard" },
    { id: "notes", icon: "📝", name: "My Notes" },
    { id: "documents", icon: "📄", name: "Documents" },
    { id: "links", icon: "🔗", name: "Saved Links" },
    { id: "ai", icon: "✨", name: "AI Assistant" },
    { id: "settings", icon: "⚙️", name: "Settings" },
  ];

  return (
    <div className="app">

      <aside className="sidebar">

        <div className="logo">
          <span>PERSONAL</span>
          <strong>Knowledge Vault</strong>
        </div>

        <div className="menu-label">
          WORKSPACE
        </div>

        {menuItems.map((item) => (
          <button
            key={item.id}
            className={page === item.id ? "menu active" : "menu"}
            onClick={() => setPage(item.id)}
          >
            <span>{item.icon}</span>
            {item.name}
          </button>
        ))}

        <div className="sidebar-bottom">

          <div className="profile">

            <div className="avatar">
              U
            </div>

            <div>
              <strong>User</strong>
              <small>Personal Vault</small>
            </div>

          </div>

        </div>

      </aside>

      <main className="main">

        {page === "dashboard" && (
          <Dashboard setPage={setPage} />
        )}

        {page === "notes" && (
          <Notes />
        )}

        {page === "documents" && (
          <Documents />
        )}

        {page === "links" && (
          <SavedLinks />
        )}

        {page === "ai" && (
          <AIAssistant />
        )}

        {page === "settings" && (
          <Settings />
        )}

      </main>

    </div>
  );
}


/* ================= DASHBOARD ================= */

function Dashboard({ setPage }) {

  const [totalNotes, setTotalNotes] = useState(0);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [totalLinks, setTotalLinks] = useState(0);

  useEffect(() => {

    const loadDashboardData = async () => {

      try {

        const notesResponse = await fetch(
          `${API_URL}/notes`
        );

        if (notesResponse.ok) {
          const notes = await notesResponse.json();
          setTotalNotes(notes.length);
        }

      } catch (error) {
        console.error("Notes dashboard error:", error);
      }

      try {

        const documentsResponse = await fetch(
          `${API_URL}/documents`
        );

        if (documentsResponse.ok) {
          const documents = await documentsResponse.json();
          setTotalDocuments(documents.length);
        }

      } catch (error) {
        console.error("Documents dashboard error:", error);
      }

      try {

        const linksResponse = await fetch(
          `${API_URL}/links`
        );

        if (linksResponse.ok) {
          const links = await linksResponse.json();
          setTotalLinks(links.length);
        }

      } catch (error) {
        console.error("Links dashboard error:", error);
      }

    };

    loadDashboardData();

  }, []);

  return (
    <>

      <div className="topbar">

        <div>

          <p className="eyebrow">
            PERSONAL KNOWLEDGE VAULT
          </p>

          <h1>
            Good morning 👋
          </h1>

          <p className="subtitle">
            Your knowledge, organized intelligently.
          </p>

        </div>

        <button
          className="primary-btn"
          onClick={() => setPage("notes")}
        >
          + New Note
        </button>

      </div>


      <div className="search">

        🔍

        <input
          placeholder="Search your knowledge..."
        />

      </div>


      <div className="stats">

        <div className="stat-card">

          <span className="stat-icon">
            📝
          </span>

          <div>

            <p>Total Notes</p>

            <h2>
              {totalNotes}
            </h2>

          </div>

        </div>


        <div className="stat-card">

          <span className="stat-icon">
            📄
          </span>

          <div>

            <p>Documents</p>

            <h2>
              {totalDocuments}
            </h2>

          </div>

        </div>


        <div className="stat-card">

          <span className="stat-icon">
            🔗
          </span>

          <div>

            <p>Saved Links</p>

            <h2>
              {totalLinks}
            </h2>

          </div>

        </div>


        <div className="stat-card">

          <span className="stat-icon">
            ✨
          </span>

          <div>

            <p>AI Insights</p>

            <h2>
              08
            </h2>

          </div>

        </div>

      </div>


      <div className="welcome">

        <h2>
          Welcome to your Knowledge Vault
        </h2>

        <p>
          Store your notes, documents, links and ideas
          in one intelligent workspace.
        </p>

      </div>

    </>
  );
}


/* ================= MY NOTES ================= */

function Notes() {

  const [showForm, setShowForm] =
    useState(false);

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [notes, setNotes] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [search, setSearch] =
    useState("");


  const loadNotes = async () => {

    try {

      const response = await fetch(
        `${API_URL}/notes`
      );

      if (!response.ok) {
        throw new Error("Failed to load notes");
      }

      const data = await response.json();

      setNotes(data);

    } catch (error) {

      console.error(
        "Error loading notes:",
        error
      );

    }

  };


  useEffect(() => {

    loadNotes();

  }, []);


  const createNote = async () => {

    if (
      !title.trim() ||
      !content.trim()
    ) {

      alert(
        "Please enter title and content"
      );

      return;

    }

    setLoading(true);

    try {

      const response = await fetch(
        `${API_URL}/notes`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
          }),

        }
      );

      if (!response.ok) {

        throw new Error(
          "Failed to create note"
        );

      }

      const newNote =
        await response.json();

      setNotes((previousNotes) => [
        ...previousNotes,
        newNote,
      ]);

      alert(
        "Note created successfully! 🎉"
      );

      setTitle("");
      setContent("");
      setShowForm(false);

    } catch (error) {

      console.error(
        "Backend error:",
        error
      );

      alert(
        "Could not connect to backend"
      );

    } finally {

      setLoading(false);

    }

  };


  const deleteNote = async (noteId) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this note?"
      );

    if (!confirmDelete) {
      return;
    }

    try {

      const response = await fetch(
        `${API_URL}/notes/${noteId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {

        throw new Error(
          "Failed to delete note"
        );

      }

      setNotes((previousNotes) =>
        previousNotes.filter(
          (note) => note.id !== noteId
        )
      );

      alert(
        "Note deleted successfully! 🗑️"
      );

    } catch (error) {

      console.error(
        "Delete error:",
        error
      );

      alert(
        "Could not delete note"
      );

    }

  };


  const startEdit = (note) => {

    setEditingId(note.id);

    setTitle(note.title);

    setContent(note.content);

    setShowForm(true);

  };


  const updateNote = async () => {

    if (
      !title.trim() ||
      !content.trim()
    ) {

      alert(
        "Please enter title and content"
      );

      return;

    }

    setLoading(true);

    try {

      const response = await fetch(
        `${API_URL}/notes/${editingId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
          }),

        }
      );

      if (!response.ok) {

        throw new Error(
          "Failed to update note"
        );

      }

      const updatedNote =
        await response.json();

      setNotes((previousNotes) =>
        previousNotes.map((note) =>
          note.id === editingId
            ? updatedNote
            : note
        )
      );

      alert(
        "Note updated successfully! ✏️"
      );

      setTitle("");
      setContent("");
      setEditingId(null);
      setShowForm(false);

    } catch (error) {

      console.error(
        "Update error:",
        error
      );

      alert(
        "Could not update note"
      );

    } finally {

      setLoading(false);

    }

  };


  const cancelEdit = () => {

    setTitle("");
    setContent("");
    setEditingId(null);
    setShowForm(false);

  };


  const filteredNotes =
    notes.filter((note) => {

      const searchText =
        search.toLowerCase();

      return (
        note.title
          .toLowerCase()
          .includes(searchText) ||

        note.content
          .toLowerCase()
          .includes(searchText)
      );

    });


  return (
    <>

      <PageHeader
        title="My Notes 📝"
        subtitle="Create and manage your personal knowledge."
      />


      <div className="search">

        🔍

        <input
          placeholder="Search my notes..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>


      <div className="page-card">

        <h2>
          Your Notes ({filteredNotes.length})
        </h2>

        <p>
          Your saved notes will appear here.
        </p>


        {!showForm && (

          <button
            className="primary-btn"
            onClick={() =>
              setShowForm(true)
            }
          >
            + Create Note
          </button>

        )}


        {showForm && (

          <div>

            <input
              className="form-input"
              placeholder="Note title..."
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />


            <textarea
              className="form-input"
              placeholder="Write your note..."
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              style={{
                height: "120px",
                paddingTop: "12px",
                resize: "vertical",
              }}
            />


            {editingId === null ? (

              <button
                className="primary-btn"
                onClick={createNote}
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : "Save Note"}
              </button>

            ) : (

              <>

                <button
                  className="primary-btn"
                  onClick={updateNote}
                  disabled={loading}
                >
                  {loading
                    ? "Updating..."
                    : "Update Note"}
                </button>


                <button
                  onClick={cancelEdit}
                  style={{
                    marginLeft: "10px",
                    padding: "10px 16px",
                    borderRadius: "6px",
                    border: "1px solid #202b48",
                    background: "transparent",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

              </>

            )}

          </div>

        )}


        {filteredNotes.length > 0 && (

          <div
            style={{
              marginTop: "30px",
            }}
          >

            <h2>
              Saved Notes
            </h2>


            {filteredNotes.map((note) => (

              <div
                key={note.id}
                style={{
                  marginTop: "15px",
                  padding: "18px",
                  border: "1px solid #202b48",
                  borderRadius: "10px",
                  background: "#0b1123",
                }}
              >

                <h3>
                  {note.title}
                </h3>


                <p
                  style={{
                    marginTop: "8px",
                    marginBottom: "15px",
                  }}
                >
                  {note.content}
                </p>


                <button
                  onClick={() =>
                    startEdit(note)
                  }
                  style={{
                    padding: "8px 14px",
                    border: "none",
                    borderRadius: "6px",
                    background: "#2563eb",
                    color: "white",
                    cursor: "pointer",
                    marginRight: "8px",
                  }}
                >
                  ✏️ Edit
                </button>


                <button
                  onClick={() =>
                    deleteNote(note.id)
                  }
                  style={{
                    padding: "8px 14px",
                    border: "none",
                    borderRadius: "6px",
                    background: "#dc2626",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  🗑️ Delete
                </button>

              </div>

            ))}

          </div>

        )}


        {search.trim() !== "" &&
          filteredNotes.length === 0 && (

            <p
              style={{
                marginTop: "25px",
              }}
            >
              No notes found 🔍
            </p>

        )}

      </div>

    </>
  );
}


/* ================= DOCUMENTS ================= */

function Documents() {

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [uploading, setUploading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [documents, setDocuments] =
    useState([]);


  const loadDocuments = async () => {

    try {

      const response = await fetch(
        `${API_URL}/documents`
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setDocuments(data);

    } catch (error) {

      console.error(
        "Documents error:",
        error
      );

    }

  };


  useEffect(() => {

    loadDocuments();

  }, []);


  const handleFileChange = (event) => {

    const file =
      event.target.files[0];

    if (!file) {
      return;
    }

    if (
      !file.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {

      alert(
        "Please select a PDF file only."
      );

      event.target.value = "";

      return;
    }

    setSelectedFile(file);

    setMessage("");

  };


  const uploadDocument = async () => {

    if (!selectedFile) {

      alert(
        "Please select a PDF file first."
      );

      return;

    }

    setUploading(true);

    setMessage("");

    const formData =
      new FormData();

    formData.append(
      "file",
      selectedFile
    );


    try {

      const response = await fetch(
        `${API_URL}/documents/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
          "Upload failed"
        );

      }

      setMessage(
        `✅ ${data.message} - ${data.filename}`
      );

      setSelectedFile(null);

      await loadDocuments();

    } catch (error) {

      console.error(
        "Upload error:",
        error
      );

      setMessage(
        "❌ Could not upload PDF."
      );

    } finally {

      setUploading(false);

    }

  };


  const deleteDocument = async (filename) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this document?"
      );

    if (!confirmDelete) {
      return;
    }

    try {

      const response = await fetch(
        `${API_URL}/documents/${encodeURIComponent(filename)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      alert(
        "Document deleted successfully! 🗑️"
      );

      loadDocuments();

    } catch (error) {

      console.error(
        "Delete document error:",
        error
      );

      alert(
        "Could not delete document"
      );

    }

  };


  return (
    <>

      <PageHeader
        title="Documents 📄"
        subtitle="Store and manage your important documents."
      />


      <div className="page-card">

        <div className="large-icon">
          📄
        </div>


        <h2>
          Upload Documents
        </h2>


        <p>
          Upload PDF documents and keep your knowledge organized.
        </p>


        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          style={{
            marginTop: "20px",
            marginBottom: "15px",
            display: "block",
          }}
        />


        {selectedFile && (

          <p>
            Selected file:{" "}
            <strong>
              {selectedFile.name}
            </strong>
          </p>

        )}


        <button
          className="primary-btn"
          onClick={uploadDocument}
          disabled={uploading}
        >
          {uploading
            ? "Uploading..."
            : "📤 Upload PDF"}
        </button>


        {message && (

          <p
            style={{
              marginTop: "20px",
            }}
          >
            {message}
          </p>

        )}


        {documents.length > 0 && (

          <div
            style={{
              marginTop: "30px",
            }}
          >

            <h2>
              Uploaded Documents
            </h2>


            {documents.map((document, index) => {

              const filename =
                typeof document === "string"
                  ? document
                  : document.filename || document.name;

              return (

                <div
                  key={index}
                  style={{
                    marginTop: "12px",
                    padding: "15px",
                    border: "1px solid #202b48",
                    borderRadius: "10px",
                    background: "#0b1123",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >

                  <span>
                    📄 {filename}
                  </span>


                  <div>

                    <button
                      onClick={() =>
                        window.open(
                          `${API_URL}/documents/open/${encodeURIComponent(filename)}`,
                          "_blank"
                        )
                      }
                      style={{
                        padding: "8px 14px",
                        border: "none",
                        borderRadius: "6px",
                        background: "#2563eb",
                        color: "white",
                        cursor: "pointer",
                        marginRight: "8px",
                      }}
                    >
                      Open
                    </button>


                    <button
                      onClick={() =>
                        deleteDocument(filename)
                      }
                      style={{
                        padding: "8px 14px",
                        border: "none",
                        borderRadius: "6px",
                        background: "#dc2626",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </div>

    </>
  );
}


/* ================= SAVED LINKS ================= */

function SavedLinks() {

  const [title, setTitle] =
    useState("");

  const [url, setUrl] =
    useState("");

  const [links, setLinks] =
    useState([]);

  const [loading, setLoading] =
    useState(false);


  const loadLinks = async () => {

    try {

      const response = await fetch(
        `${API_URL}/links`
      );

      if (!response.ok) {
        throw new Error("Failed to load links");
      }

      const data =
        await response.json();

      setLinks(data);

    } catch (error) {

      console.error(
        "Load links error:",
        error
      );

    }

  };


  useEffect(() => {

    loadLinks();

  }, []);


  const saveLink = async () => {

    if (
      !title.trim() ||
      !url.trim()
    ) {

      alert(
        "Please enter link title and URL"
      );

      return;

    }

    setLoading(true);

    try {

      const response = await fetch(
        `${API_URL}/links`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            title: title.trim(),
            url: url.trim(),
          }),

        }
      );

      if (!response.ok) {

        throw new Error(
          "Failed to save link"
        );

      }

      const newLink =
        await response.json();

      setLinks((previousLinks) => [
        ...previousLinks,
        newLink,
      ]);

      setTitle("");
      setUrl("");

      alert(
        "Link saved successfully! 🔗"
      );

    } catch (error) {

      console.error(
        "Save link error:",
        error
      );

      alert(
        "Could not save link"
      );

    } finally {

      setLoading(false);

    }

  };


  const deleteLink = async (linkId) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this link?"
      );

    if (!confirmDelete) {
      return;
    }

    try {

      const response = await fetch(
        `${API_URL}/links/${linkId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setLinks((previousLinks) =>
        previousLinks.filter(
          (link) => link.id !== linkId
        )
      );

      alert(
        "Link deleted successfully! 🗑️"
      );

    } catch (error) {

      console.error(
        "Delete link error:",
        error
      );

      alert(
        "Could not delete link"
      );

    }

  };


  return (
    <>

      <PageHeader
        title="Saved Links 🔗"
        subtitle="Keep your useful websites and resources together."
      />


      <div className="page-card">

        <h2>
          Add a useful link
        </h2>


        <input
          className="form-input"
          placeholder="Link title..."
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />


        <input
          className="form-input"
          placeholder="https://example.com"
          value={url}
          onChange={(e) =>
            setUrl(e.target.value)
          }
        />


        <button
          className="primary-btn"
          onClick={saveLink}
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : "+ Save Link"}
        </button>


        {links.length > 0 && (

          <div
            style={{
              marginTop: "30px",
            }}
          >

            <h2>
              Saved Links
            </h2>


            {links.map((link) => (

              <div
                key={link.id}
                style={{
                  marginTop: "15px",
                  padding: "18px",
                  border: "1px solid #202b48",
                  borderRadius: "10px",
                  background: "#0b1123",
                }}
              >

                <h3>
                  {link.title}
                </h3>


                <p
                  style={{
                    marginTop: "8px",
                    marginBottom: "15px",
                  }}
                >
                  {link.url}
                </p>


                <button
                  onClick={() =>
                    window.open(
                      link.url,
                      "_blank"
                    )
                  }
                  style={{
                    padding: "8px 14px",
                    border: "none",
                    borderRadius: "6px",
                    background: "#2563eb",
                    color: "white",
                    cursor: "pointer",
                    marginRight: "8px",
                  }}
                >
                  🔗 Open
                </button>


                <button
                  onClick={() =>
                    deleteLink(link.id)
                  }
                  style={{
                    padding: "8px 14px",
                    border: "none",
                    borderRadius: "6px",
                    background: "#dc2626",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  🗑️ Delete
                </button>

              </div>

            ))}

          </div>

        )}

      </div>

    </>
  );
}


/* ================= AI ASSISTANT ================= */

function AIAssistant() {

  const [question, setQuestion] =
    useState("");

  const [answer, setAnswer] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  const askAI = async () => {

    if (!question.trim()) {

      alert(
        "Please enter a question."
      );

      return;

    }

    setLoading(true);
    setAnswer("");

    try {

      const response = await fetch(
        `${API_URL}/ai/ask`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            question: question.trim(),
          }),

        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail ||
          "AI request failed"
        );

      }

      setAnswer(
        data.answer ||
        data.response ||
        "No answer received."
      );

    } catch (error) {

      console.error(
        "AI error:",
        error
      );

      setAnswer(
        "❌ Could not connect to AI Assistant."
      );

    } finally {

      setLoading(false);

    }

  };


  return (
    <>

      <PageHeader
        title="AI Assistant ✨"
        subtitle="Ask questions about your personal knowledge."
      />


      <div className="ai-chat">

        <div className="ai-message">

          <div className="ai-avatar">
            ✨
          </div>


          <div>

            <strong>
              Knowledge Assistant
            </strong>


            <p>
              Hello! Ask me questions about your
              saved notes and documents.
            </p>

          </div>

        </div>


        {answer && (

          <div
            className="ai-message"
            style={{
              marginTop: "20px",
            }}
          >

            <div className="ai-avatar">
              🤖
            </div>


            <div>

              <strong>
                Assistant
              </strong>


              <p
                style={{
                  whiteSpace: "pre-wrap",
                }}
              >
                {answer}
              </p>

            </div>

          </div>

        )}


        <div className="chat-input">

          <input
            placeholder="Ask something about your knowledge..."
            value={question}
            onChange={(e) =>
              setQuestion(e.target.value)
            }
            onKeyDown={(e) => {

              if (e.key === "Enter") {
                askAI();
              }

            }}
          />


          <button
            className="primary-btn"
            onClick={askAI}
            disabled={loading}
          >
            {loading
              ? "Thinking..."
              : "Send"}
          </button>

        </div>

      </div>

    </>
  );
}


/* ================= SETTINGS ================= */

function Settings() {

  return (
    <>

      <PageHeader
        title="Settings ⚙️"
        subtitle="Manage your Personal Knowledge Vault."
      />


      <div className="page-card">

        <h2>
          Profile
        </h2>


        <div className="profile-large">

          <div className="avatar big">
            U
          </div>


          <div>

            <strong>
              User
            </strong>

            <p>
              Personal Vault
            </p>

          </div>

        </div>


        <hr />


        <h2>
          Preferences
        </h2>


        <div className="setting-row">

          <span>
            Dark Mode
          </span>

          <span>
            ✓ Enabled
          </span>

        </div>


        <div
          className="setting-row"
          style={{
            marginTop: "15px",
          }}
        >

          <span>
            Backend API
          </span>

          <span>
            ✓ Connected on port 8000
          </span>

        </div>

      </div>

    </>

  );
}


/* ================= PAGE HEADER ================= */

function PageHeader({
  title,
  subtitle,
}) {

  return (
    <div className="topbar">

      <div>

        <p className="eyebrow">
          PERSONAL KNOWLEDGE VAULT
        </p>


        <h1>
          {title}
        </h1>


        <p className="subtitle">
          {subtitle}
        </p>

      </div>

    </div>
  );

}


export default App;

